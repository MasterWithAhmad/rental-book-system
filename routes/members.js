const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Helper to check admin
function isAdmin(req) {
    return req.session.staffRole === 'admin';
}

// List members
router.get('/', async (req, res) => {
    let members;
    if (isAdmin(req)) {
        [members] = await pool.query('SELECT * FROM members');
    } else {
        [members] = await pool.query('SELECT * FROM members WHERE staff_id = ?', [req.session.staffId]);
    }
    res.render('members/list', {
        title: 'Members',
        members,
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Add member form
router.get('/add', (req, res) => {
    res.render('members/add', { title: 'Add Member' });
});

// Handle add member
router.post('/add', async (req, res) => {
    const { full_name, email, phone, address } = req.body;
    try {
        await pool.query('INSERT INTO members (full_name, email, phone, address, staff_id) VALUES (?, ?, ?, ?, ?)', [full_name, email, phone, address, req.session.staffId]);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'add_member', `Added member: ${full_name}`);
        res.redirect('/members');
    } catch (err) {
        res.status(500).send('Error adding member');
    }
});

// Edit member form
router.get('/edit/:id', async (req, res) => {
    let rows;
    if (isAdmin(req)) {
        [rows] = await pool.query('SELECT * FROM members WHERE id=?', [req.params.id]);
    } else {
        [rows] = await pool.query('SELECT * FROM members WHERE id=? AND staff_id=?', [req.params.id, req.session.staffId]);
    }
    if (!rows.length) return res.status(404).send('Member not found');
    res.render('members/edit', { title: 'Edit Member', member: rows[0] });
});

// Handle edit member
router.post('/edit/:id', async (req, res) => {
    const { full_name, email, phone, address } = req.body;
    try {
        let result;
        if (isAdmin(req)) {
            result = await pool.query('UPDATE members SET full_name=?, email=?, phone=?, address=? WHERE id=?', [full_name, email, phone, address, req.params.id]);
        } else {
            result = await pool.query('UPDATE members SET full_name=?, email=?, phone=?, address=? WHERE id=? AND staff_id=?', [full_name, email, phone, address, req.params.id, req.session.staffId]);
        }
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'edit_member', `Edited member: ${req.params.id}`);
        res.redirect('/members');
    } catch (err) {
        res.status(500).send('Error updating member');
    }
});

// Delete member
router.post('/delete/:id', async (req, res) => {
    try {
        let result;
        if (isAdmin(req)) {
            result = await pool.query('DELETE FROM members WHERE id=?', [req.params.id]);
        } else {
            result = await pool.query('DELETE FROM members WHERE id=? AND staff_id=?', [req.params.id, req.session.staffId]);
        }
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'delete_member', `Deleted member: ${req.params.id}`);
        res.redirect('/members');
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
            req.flash('error', 'Cannot delete member: This member has related rentals.');
            return res.redirect('/members');
        }
        res.status(500).send('Error deleting member');
    }
});

module.exports = router;
