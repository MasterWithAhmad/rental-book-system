const express = require('express');
const pool = require('../config/db');
const { Parser } = require('json2csv');
const router = express.Router();

// Helper to check admin
function isAdmin(req) {
    return req.session.staffRole === 'admin';
}

// Overdue books report
router.get('/overdue', async (req, res) => {
    let overdue;
    if (isAdmin(req)) {
        [overdue] = await pool.query(`
            SELECT rentals.id, books.title, members.full_name AS member, rentals.due_date, rentals.rented_at
            FROM rentals
            JOIN books ON rentals.book_id = books.id
            JOIN members ON rentals.member_id = members.id
            WHERE rentals.status = 'rented' AND rentals.due_date < CURDATE()
            ORDER BY rentals.due_date ASC
        `);
    } else {
        [overdue] = await pool.query(`
            SELECT rentals.id, books.title, members.full_name AS member, rentals.due_date, rentals.rented_at
            FROM rentals
            JOIN books ON rentals.book_id = books.id
            JOIN members ON rentals.member_id = members.id
            WHERE rentals.status = 'rented' AND rentals.due_date < CURDATE() AND rentals.staff_id = ?
            ORDER BY rentals.due_date ASC
        `, [req.session.staffId]);
    }
    res.render('reports/overdue', { title: 'Overdue Books', overdue });
});

// Rental history report
router.get('/history', async (req, res) => {
    let history;
    let rentalsPerMonth = [];
    let months = [];
    if (isAdmin(req)) {
        [history] = await pool.query(`
            SELECT rentals.id, books.title, members.full_name AS member, rentals.rented_at, rentals.due_date, rentals.returned_at, rentals.status
            FROM rentals
            JOIN books ON rentals.book_id = books.id
            JOIN members ON rentals.member_id = members.id
            ORDER BY rentals.rented_at DESC
        `);
        // Aggregate rentals per month (last 12 months)
        const [monthly] = await pool.query(`
            SELECT DATE_FORMAT(rented_at, '%Y-%m') AS month, COUNT(*) AS count
            FROM rentals
            WHERE rented_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month ASC
        `);
        months = monthly.map(row => row.month);
        rentalsPerMonth = monthly.map(row => row.count);
    } else {
        [history] = await pool.query(`
            SELECT rentals.id, books.title, members.full_name AS member, rentals.rented_at, rentals.due_date, rentals.returned_at, rentals.status
            FROM rentals
            JOIN books ON rentals.book_id = books.id
            JOIN members ON rentals.member_id = members.id
            WHERE rentals.staff_id = ?
            ORDER BY rentals.rented_at DESC
        `, [req.session.staffId]);
        // Aggregate rentals per month (last 12 months) for this staff
        const [monthly] = await pool.query(`
            SELECT DATE_FORMAT(rented_at, '%Y-%m') AS month, COUNT(*) AS count
            FROM rentals
            WHERE rented_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND staff_id = ?
            GROUP BY month
            ORDER BY month ASC
        `, [req.session.staffId]);
        months = monthly.map(row => row.month);
        rentalsPerMonth = monthly.map(row => row.count);
    }
    res.render('reports/history', { title: 'Rental History', history, rentalsPerMonth, months });
});

// Inventory status report
router.get('/inventory', async (req, res) => {
    let inventory;
    if (isAdmin(req)) {
        [inventory] = await pool.query(`
            SELECT books.id, books.title, books.author, books.total_copies, books.available_copies, categories.name AS category
            FROM books
            LEFT JOIN categories ON books.category_id = categories.id
            ORDER BY books.title ASC
        `);
    } else {
        [inventory] = await pool.query(`
            SELECT books.id, books.title, books.author, books.total_copies, books.available_copies, categories.name AS category
            FROM books
            LEFT JOIN categories ON books.category_id = categories.id
            WHERE books.staff_id = ?
            ORDER BY books.title ASC
        `, [req.session.staffId]);
    }
    res.render('reports/inventory', { title: 'Inventory Status', inventory });
});

// CSV Export endpoints
router.get('/:type/export', async (req, res) => {
    let data, fields, filename;
    if (req.params.type === 'overdue') {
        if (isAdmin(req)) {
            [data] = await pool.query(`
                SELECT rentals.id, books.title, members.full_name AS member, rentals.due_date, rentals.rented_at
                FROM rentals
                JOIN books ON rentals.book_id = books.id
                JOIN members ON rentals.member_id = members.id
                WHERE rentals.status = 'rented' AND rentals.due_date < CURDATE()
                ORDER BY rentals.due_date ASC
            `);
        } else {
            [data] = await pool.query(`
                SELECT rentals.id, books.title, members.full_name AS member, rentals.due_date, rentals.rented_at
                FROM rentals
                JOIN books ON rentals.book_id = books.id
                JOIN members ON rentals.member_id = members.id
                WHERE rentals.status = 'rented' AND rentals.due_date < CURDATE() AND rentals.staff_id = ?
                ORDER BY rentals.due_date ASC
            `, [req.session.staffId]);
        }
        fields = ['id', 'title', 'member', 'due_date', 'rented_at'];
        filename = 'overdue_books.csv';
    } else if (req.params.type === 'history') {
        if (isAdmin(req)) {
            [data] = await pool.query(`
                SELECT rentals.id, books.title, members.full_name AS member, rentals.rented_at, rentals.due_date, rentals.returned_at, rentals.status
                FROM rentals
                JOIN books ON rentals.book_id = books.id
                JOIN members ON rentals.member_id = members.id
                ORDER BY rentals.rented_at DESC
            `);
        } else {
            [data] = await pool.query(`
                SELECT rentals.id, books.title, members.full_name AS member, rentals.rented_at, rentals.due_date, rentals.returned_at, rentals.status
                FROM rentals
                JOIN books ON rentals.book_id = books.id
                JOIN members ON rentals.member_id = members.id
                WHERE rentals.staff_id = ?
                ORDER BY rentals.rented_at DESC
            `, [req.session.staffId]);
        }
        fields = ['id', 'title', 'member', 'rented_at', 'due_date', 'returned_at', 'status'];
        filename = 'rental_history.csv';
    } else if (req.params.type === 'inventory') {
        if (isAdmin(req)) {
            [data] = await pool.query(`
                SELECT books.id, books.title, books.author, books.total_copies, books.available_copies, categories.name AS category
                FROM books
                LEFT JOIN categories ON books.category_id = categories.id
                ORDER BY books.title ASC
            `);
        } else {
            [data] = await pool.query(`
                SELECT books.id, books.title, books.author, books.total_copies, books.available_copies, categories.name AS category
                FROM books
                LEFT JOIN categories ON books.category_id = categories.id
                WHERE books.staff_id = ?
                ORDER BY books.title ASC
            `, [req.session.staffId]);
        }
        fields = ['id', 'title', 'author', 'category', 'total_copies', 'available_copies'];
        filename = 'inventory.csv';
    } else {
        return res.status(404).send('Invalid report type');
    }
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);
});

module.exports = router;
