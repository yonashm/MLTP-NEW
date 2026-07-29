const router = require('express').Router();
const pool   = require('../db/pool');
const auth   = require('../middleware/auth');

router.use(auth);

// GET /api/reports/monthly
router.get('/monthly', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(month, 'Mon YYYY') AS label,
        source,
        total,
        closed_count,
        overdue_count
      FROM v_monthly_stats
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/status-breakdown
router.get('/status-breakdown', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        status,
        source,
        COUNT(*) AS count
      FROM inquiries
      GROUP BY status, source
      ORDER BY status, source
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/staff-workload
router.get('/staff-workload', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.full_name,
        u.initials,
        COUNT(i.id)                                       AS total,
        COUNT(i.id) FILTER (WHERE i.status <> 'Closed')  AS open,
        COUNT(i.id) FILTER (WHERE i.status = 'Closed')   AS closed
      FROM   users u
      LEFT   JOIN inquiries i ON i.assigned_to = u.id
      WHERE  u.is_active = TRUE
      GROUP  BY u.id, u.full_name, u.initials
      ORDER  BY total DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
