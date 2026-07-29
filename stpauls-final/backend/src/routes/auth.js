const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db/pool');

const SECRET  = process.env.JWT_SECRET     || 'dev-secret-change-in-prod';
const EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, password_hash, role, initials FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase().trim()]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name, initials: user.initials },
      SECRET,
      { expiresIn: EXPIRES }
    );

    res.json({
      token,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role, initials: user.initials }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, role, initials FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
