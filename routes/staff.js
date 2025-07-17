const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireRole } = require('../middleware/role');
const router = express.Router();

// List staff (admin only)
router.get('/', requireRole('admin'), async (req, res) => {
    const [staff] = await pool.query('SELECT id, username, full_name, role, created_at FROM staff');
    res.render('staff/list', { title: 'Staff Management', staff });
});

// Add staff form
router.get('/add', requireRole('admin'), (req, res) => {
    res.render('staff/add', { title: 'Add Staff' });
});

// Handle add staff
router.post('/add', requireRole('admin'), async (req, res) => {
    const { username, password, full_name, role } = req.body;
    if (!username || !password) return res.status(400).send('Username and password required');
    const hash = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO staff (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)', [username, hash, full_name, role]);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'add_staff', `Added staff: ${username}`);
        res.redirect('/staff');
    } catch (err) {
        res.status(500).send('Error creating staff');
    }
});

// Edit staff form
router.get('/edit/:id', requireRole('admin'), async (req, res) => {
    const [rows] = await pool.query('SELECT id, username, full_name, role FROM staff WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Staff not found');
    res.render('staff/edit', { title: 'Edit Staff', staff: rows[0] });
});

// Handle edit staff
router.post('/edit/:id', requireRole('admin'), async (req, res) => {
    const { full_name, role, password } = req.body;
    let query = 'UPDATE staff SET full_name=?, role=?';
    let params = [full_name, role];
    if (password) {
        const hash = await bcrypt.hash(password, 10);
        query += ', password_hash=?';
        params.push(hash);
    }
    query += ' WHERE id=?';
    params.push(req.params.id);
    try {
        await pool.query(query, params);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'edit_staff', `Edited staff: ${req.params.id}`);
        res.redirect('/staff');
    } catch (err) {
        res.status(500).send('Error updating staff');
    }
});

// Delete staff
router.post('/delete/:id', requireRole('admin'), async (req, res) => {
    try {
        await pool.query('DELETE FROM staff WHERE id=?', [req.params.id]);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'delete_staff', `Deleted staff: ${req.params.id}`);
        res.redirect('/staff');
    } catch (err) {
        res.status(500).send('Error deleting staff');
    }
});

module.exports = router;
