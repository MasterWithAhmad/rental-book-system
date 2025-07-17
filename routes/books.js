const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper to check admin
function isAdmin(req) {
    return req.session.staffRole === 'admin';
}

// List all books
router.get('/', async (req, res) => {
    try {
        let books;
        if (isAdmin(req)) {
            [books] = await pool.query('SELECT books.*, categories.name AS category FROM books LEFT JOIN categories ON books.category_id = categories.id');
        } else {
            [books] = await pool.query('SELECT books.*, categories.name AS category FROM books LEFT JOIN categories ON books.category_id = categories.id WHERE books.staff_id = ?', [req.session.staffId]);
        }
        res.render('books/list', { title: 'Books', books });
    } catch (err) {
        res.status(500).send('Error fetching books');
    }
});

// Show add book form
router.get('/add', async (req, res) => {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.render('books/add', { title: 'Add Book', categories });
});

// Handle add book
router.post('/add', async (req, res) => {
    const { title, author, isbn, category_id, total_copies } = req.body;
    try {
        await pool.query('INSERT INTO books (title, author, isbn, category_id, total_copies, available_copies, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, author, isbn, category_id, total_copies, total_copies, req.session.staffId]);
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'add_book', `Added book: ${title}`);
        res.redirect('/books');
    } catch (err) {
        res.status(500).send('Error adding book');
    }
});

// Show edit book form
router.get('/edit/:id', async (req, res) => {
    let bookRows;
    if (isAdmin(req)) {
        [bookRows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    } else {
        [bookRows] = await pool.query('SELECT * FROM books WHERE id = ? AND staff_id = ?', [req.params.id, req.session.staffId]);
    }
    const [categories] = await pool.query('SELECT * FROM categories');
    if (!bookRows.length) return res.status(404).send('Book not found');
    res.render('books/edit', { title: 'Edit Book', book: bookRows[0], categories });
});

// Handle edit book
router.post('/edit/:id', async (req, res) => {
    const { title, author, isbn, category_id, total_copies, available_copies } = req.body;
    try {
        let result;
        if (isAdmin(req)) {
            result = await pool.query('UPDATE books SET title=?, author=?, isbn=?, category_id=?, total_copies=?, available_copies=? WHERE id=?', [title, author, isbn, category_id, total_copies, available_copies, req.params.id]);
        } else {
            result = await pool.query('UPDATE books SET title=?, author=?, isbn=?, category_id=?, total_copies=?, available_copies=? WHERE id=? AND staff_id=?', [title, author, isbn, category_id, total_copies, available_copies, req.params.id, req.session.staffId]);
        }
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'edit_book', `Edited book: ${req.params.id}`);
        res.redirect('/books');
    } catch (err) {
        res.status(500).send('Error updating book');
    }
});

// Handle delete book
router.post('/delete/:id', async (req, res) => {
    try {
        let result;
        if (isAdmin(req)) {
            result = await pool.query('DELETE FROM books WHERE id=?', [req.params.id]);
        } else {
            result = await pool.query('DELETE FROM books WHERE id=? AND staff_id=?', [req.params.id, req.session.staffId]);
        }
        const { logAudit } = require('../middleware/audit');
        await logAudit(req.session.staffId, 'delete_book', `Deleted book: ${req.params.id}`);
        res.redirect('/books');
    } catch (err) {
        res.status(500).send('Error deleting book');
    }
});

module.exports = router;
