const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Helper to check admin
function isAdmin(req) {
    return req.session.staffRole === 'admin';
}

// View audit logs
router.get('/', async (req, res) => {
    let logs;
    if (isAdmin(req)) {
        [logs] = await pool.query(
            `SELECT audit_logs.*, staff.full_name AS staff_name
             FROM audit_logs
             JOIN staff ON audit_logs.staff_id = staff.id
             ORDER BY audit_logs.created_at DESC
             LIMIT 200`
        );
    } else {
        [logs] = await pool.query(
            `SELECT audit_logs.*, staff.full_name AS staff_name
             FROM audit_logs
             JOIN staff ON audit_logs.staff_id = staff.id
             WHERE audit_logs.staff_id = ?
             ORDER BY audit_logs.created_at DESC
             LIMIT 200`,
            [req.session.staffId]
        );
    }
    res.render('audit/list', { title: 'Audit Logs', logs });
});

module.exports = router;
