const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { logAudit } = require('../middleware/audit');
const router = express.Router();

// Show settings page (profile, preferences, password)
router.get('/', async (req, res) => {
    const [rows] = await pool.query('SELECT full_name FROM staff WHERE id = ?', [req.session.staffId]);
    const profile = rows.length ? rows[0] : { full_name: '' };
    // Placeholder for user preferences
    const preferences = {};
    res.render('settings/index', { title: 'Settings', error: null, success: null, profile, preferences });
});

// Handle password change
router.post('/password', async (req, res) => {
    const { old_password, new_password, confirm_password } = req.body;
    if (!old_password || !new_password || !confirm_password) {
        return res.render('settings/index', { title: 'Settings', error: 'All fields are required.', success: null });
    }
    if (new_password !== confirm_password) {
        return res.render('settings/index', { title: 'Settings', error: 'Passwords do not match.', success: null });
    }
    const [rows] = await pool.query('SELECT password_hash FROM staff WHERE id = ?', [req.session.staffId]);
    if (!rows.length) {
        return res.render('settings/index', { title: 'Settings', error: 'User not found.', success: null });
    }
    const match = await bcrypt.compare(old_password, rows[0].password_hash);
    if (!match) {
        return res.render('settings/index', { title: 'Settings', error: 'Incorrect old password.', success: null });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE staff SET password_hash = ? WHERE id = ?', [hash, req.session.staffId]);
    await logAudit(req.session.staffId, 'change_password', 'User changed their password');
    res.render('settings/index', { title: 'Settings', error: null, success: 'Password changed successfully.' });
});

// Handle profile update
router.post('/profile', async (req, res) => {
    const { full_name } = req.body;
    if (!full_name) {
        const [rows] = await pool.query('SELECT full_name FROM staff WHERE id = ?', [req.session.staffId]);
        const profile = rows.length ? rows[0] : { full_name: '' };
        return res.render('settings/index', { title: 'Settings', error: 'Name is required.', success: null, profile, preferences: {} });
    }
    await pool.query('UPDATE staff SET full_name = ? WHERE id = ?', [full_name, req.session.staffId]);
    await logAudit(req.session.staffId, 'update_profile', 'User updated profile');
    const profile = { full_name };
    res.render('settings/index', { title: 'Settings', error: null, success: 'Profile updated.', profile, preferences: {} });
});

module.exports = router;
