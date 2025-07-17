const pool = require('../config/db');

async function logAudit(staffId, action, details) {
    try {
        await pool.query('INSERT INTO audit_logs (staff_id, action, details) VALUES (?, ?, ?)', [staffId, action, details]);
    } catch (err) {
        console.error('Audit log error:', err);
    }
}

module.exports = { logAudit };
