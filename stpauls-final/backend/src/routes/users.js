const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../db/pool');
const auth   = require('../middleware/auth');

router.use(auth);

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, role, initials, is_active, created_at FROM users WHERE is_active = TRUE ORDER BY full_name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me  (update own profile / password)
router.patch('/me', async (req, res) => {
  const { full_name, email, password } = req.body;
  const updates = {};
  if (full_name) updates.full_name = full_name;
  if (email)     updates.email     = email.toLowerCase().trim();
  if (password)  updates.password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10'));

  if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });

  try {
    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i+2}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE users SET ${setClauses} WHERE id = $1 RETURNING id, full_name, email, role, initials`,
      [req.user.id, ...Object.values(updates)]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /users/me:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
