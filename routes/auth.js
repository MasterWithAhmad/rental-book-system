const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login', message: req.flash('error') });
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM staff WHERE username = ?', [username]);
        if (!rows.length) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }
        const staff = rows[0];
        const match = await bcrypt.compare(password, staff.password_hash);
        if (!match) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }
        req.session.staffId = staff.id;
        req.session.staffRole = staff.role;
        req.session.staffName = staff.full_name || staff.username;
        res.redirect('/');
    } catch (err) {
        req.flash('error', 'Login failed');
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

// Registration routes
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
  const { username, password, full_name } = req.body;
  if (!username || !password || !full_name) {
    return res.render('auth/register', { error: 'All fields are required.' });
  }
  try {
    // Check if username exists
    const [rows] = await pool.query('SELECT id FROM staff WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.render('auth/register', { error: 'Username already exists.' });
    }
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    // Insert new staff (default role: librarian)
    await pool.query(
      'INSERT INTO staff (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hash, full_name, 'librarian']
    );
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { error: 'Registration failed. Try again.' });
  }
});

module.exports = router;
