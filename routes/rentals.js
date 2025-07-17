const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Helper to check admin
function isAdmin(req) {
    return req.session.staffRole === 'admin';
}

// List all rentals
router.get('/', async (req, res) => {
    let rentals;
    if (isAdmin(req)) {
        [rentals] = await pool.query(`
            SELECT rentals.*, 
                   members.full_name AS member_name, 
                   books.title AS book_title, 
                   staff.full_name AS staff_name
            FROM rentals
            JOIN members ON rentals.member_id = members.id
            JOIN books ON rentals.book_id = books.id
            JOIN staff ON rentals.staff_id = staff.id
            ORDER BY rentals.rented_at DESC
        `);
    } else {
        [rentals] = await pool.query(`
            SELECT rentals.*, 
                   members.full_name AS member_name, 
                   books.title AS book_title, 
                   staff.full_name AS staff_name
            FROM rentals
            JOIN members ON rentals.member_id = members.id
            JOIN books ON rentals.book_id = books.id
            JOIN staff ON rentals.staff_id = staff.id
            WHERE rentals.staff_id = ?
            ORDER BY rentals.rented_at DESC
        `, [req.session.staffId]);
    }
    res.render('rentals/list', { title: 'Rentals & Returns', rentals });
});

// Show form to issue a book
router.get('/issue', async (req, res) => {
    const [members] = await pool.query('SELECT * FROM members');
    const [books] = await pool.query('SELECT * FROM books WHERE available_copies > 0');
    res.render('rentals/issue', { title: 'Issue Book', members, books });
});

// Handle book issue (already uses staff_id)
router.post('/issue', async (req, res) => {
    const { member_id, book_id, due_date } = req.body;
    try {
        // Insert rental
        await pool.query(
            'INSERT INTO rentals (member_id, book_id, staff_id, due_date) VALUES (?, ?, ?, ?)',
            [member_id, book_id, req.session.staffId, due_date]
        );
        // Decrement available copies
        await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'issue_book', `Issued book ${book_id} to member ${member_id}`);
        res.redirect('/rentals');
    } catch (err) {
        res.status(500).send('Error issuing book');
    }
});

// Show form to return a book
router.get('/return/:id', async (req, res) => {
    let rows;
    if (isAdmin(req)) {
        [rows] = await pool.query(
            `SELECT rentals.*, books.title AS book_title, members.full_name AS member_name
             FROM rentals
             JOIN books ON rentals.book_id = books.id
             JOIN members ON rentals.member_id = members.id
             WHERE rentals.id = ? AND rentals.status = 'rented'`,
            [req.params.id]
        );
    } else {
        [rows] = await pool.query(
            `SELECT rentals.*, books.title AS book_title, members.full_name AS member_name
             FROM rentals
             JOIN books ON rentals.book_id = books.id
             JOIN members ON rentals.member_id = members.id
             WHERE rentals.id = ? AND rentals.status = 'rented' AND rentals.staff_id = ?`,
            [req.params.id, req.session.staffId]
        );
    }
    if (!rows.length) return res.status(404).send('Rental not found or already returned');
    res.render('rentals/return', { title: 'Return Book', rental: rows[0] });
});

// Handle book return
router.post('/return/:id', async (req, res) => {
    try {
        // Only allow if admin or owner
        let rentalRows;
        if (isAdmin(req)) {
            [rentalRows] = await pool.query('SELECT book_id FROM rentals WHERE id = ?', [req.params.id]);
        } else {
            [rentalRows] = await pool.query('SELECT book_id FROM rentals WHERE id = ? AND staff_id = ?', [req.params.id, req.session.staffId]);
        }
        if (!rentalRows.length) return res.status(404).send('Rental not found or not permitted');
        // Mark as returned
        await pool.query('UPDATE rentals SET status = "returned", returned_at = NOW() WHERE id = ?', [req.params.id]);
        // Increment available copies
        await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [rentalRows[0].book_id]);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'return_book', `Returned rental ${req.params.id}`);
        res.redirect('/rentals');
    } catch (err) {
        res.status(500).send('Error returning book');
    }
});

module.exports = router;
