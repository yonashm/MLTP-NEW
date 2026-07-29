const router = require('express').Router();
const pool   = require('../db/pool');
const auth   = require('../middleware/auth');

// All inquiry routes require auth
router.use(auth);

// ── GET /api/inquiries ─────────────────────────────────────
// Query params: source, status, assignee, search, limit, offset
router.get('/', async (req, res) => {
  try {
    const { source, status, assignee, search, limit = 100, offset = 0 } = req.query;
    const conditions = [];
    const params = [];

    if (source)   { params.push(source);   conditions.push(`source = $${params.length}`); }
    if (status)   { params.push(status);   conditions.push(`status = $${params.length}`); }
    if (assignee) { params.push(assignee); conditions.push(`assignee_id = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      conditions.push(`(patient_name ILIKE $${n} OR card_id ILIKE $${n} OR reference_number ILIKE $${n} OR requesting_party ILIKE $${n})`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(parseInt(limit), parseInt(offset));

    const sql = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM   v_inquiry_summary
      ${where}
      ORDER  BY created_at DESC
      LIMIT  $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await pool.query(sql, params);
    res.json({
      data:  rows,
      total: rows[0]?.total_count ?? 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error('GET /inquiries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/inquiries/stats ───────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                        AS total,
        COUNT(*) FILTER (WHERE status <> 'Closed')     AS open,
        COUNT(*) FILTER (WHERE deadline_health = 'overdue') AS overdue,
        COUNT(*) FILTER (WHERE status = 'Response prepared') AS ready,
        COUNT(*) FILTER (WHERE status = 'Closed')      AS closed,
        COUNT(*) FILTER (WHERE source = 'Court')       AS court,
        COUNT(*) FILTER (WHERE source = 'Police')      AS police,
        COUNT(*) FILTER (WHERE source = 'Office')      AS office
      FROM v_inquiry_summary
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/inquiries/:id ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM v_inquiry_summary WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Inquiry not found' });

    // Also fetch audit log
    const { rows: audit } = await pool.query(
      `SELECT a.action, a.old_value, a.new_value, a.notes, a.performed_at, u.full_name AS performed_by
       FROM   audit_log a LEFT JOIN users u ON u.id = a.performed_by
       WHERE  a.inquiry_id = $1 ORDER BY a.performed_at ASC`,
      [req.params.id]
    );

    res.json({ ...rows[0], audit });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/inquiries ───────────────────────────────────
router.post('/', async (req, res) => {
  const {
    source, requesting_party, external_ref, patient_name, card_id,
    patient_dob, request_type, notes, received_at, deadline,
    status = 'Logged & assigned', priority = 'Normal', assigned_to
  } = req.body;

  if (!source || !requesting_party || !patient_name || !card_id || !deadline) {
    return res.status(400).json({ error: 'Missing required fields: source, requesting_party, patient_name, card_id, deadline' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const refNum = (await client.query('SELECT next_reference_number() AS ref')).rows[0].ref;

    const { rows } = await client.query(`
      INSERT INTO inquiries
        (reference_number, source, requesting_party, external_ref, patient_name, card_id,
         patient_dob, request_type, notes, received_at, deadline, status, priority,
         assigned_to, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [refNum, source, requesting_party, external_ref || null, patient_name, card_id,
       patient_dob || null, request_type || 'Medical records', notes || null,
       received_at || new Date().toISOString().slice(0,10), deadline,
       status, priority, assigned_to || null, req.user.id]
    );

    await client.query(
      `INSERT INTO audit_log (inquiry_id, performed_by, action, new_value, notes)
       VALUES ($1,$2,'CREATED',NULL,$3)`,
      [rows[0].id, req.user.id, `Inquiry logged by ${req.user.name}`]
    );

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /inquiries:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ── PATCH /api/inquiries/:id ──────────────────────────────
router.patch('/:id', async (req, res) => {
  const allowed = ['status','priority','assigned_to','response_notes','notes','deadline','finalized_by'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch old state for audit
    const { rows: old } = await client.query('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
    if (!old.length) return res.status(404).json({ error: 'Inquiry not found' });
    if (old[0].is_locked) return res.status(409).json({ error: 'Inquiry is closed and locked.' });

    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i+2}`).join(', ');
    const values = [req.params.id, ...Object.values(updates)];

    const { rows } = await client.query(
      `UPDATE inquiries SET ${setClauses} WHERE id = $1 RETURNING *`,
      values
    );

    // Audit
    const changed = Object.keys(updates).filter(k => old[0][k] !== updates[k]);
    if (changed.length) {
      const oldSnap = Object.fromEntries(changed.map(k => [k, old[0][k]]));
      const newSnap = Object.fromEntries(changed.map(k => [k, updates[k]]));
      const action  = updates.status ? 'STATUS_CHANGE' : updates.response_notes ? 'RESPONSE_ADDED' : 'UPDATED';
      await client.query(
        `INSERT INTO audit_log (inquiry_id, performed_by, action, old_value, new_value)
         VALUES ($1,$2,$3,$4,$5)`,
        [req.params.id, req.user.id, action, JSON.stringify(oldSnap), JSON.stringify(newSnap)]
      );
    }

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH /inquiries:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// ── GET /api/inquiries/source/overdue ─────────────────────
router.get('/source/overdue', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_overdue_inquiries');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
