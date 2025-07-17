const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const pool = require('../config/db');
  // Card counts
  const [[{ booksCount }]] = await pool.query('SELECT COUNT(*) AS booksCount FROM books');
  const [[{ membersCount }]] = await pool.query('SELECT COUNT(*) AS membersCount FROM members');
  const [[{ booksOut }]] = await pool.query("SELECT COUNT(*) AS booksOut FROM rentals WHERE status = 'rented'");
  const [[{ overdueCount }]] = await pool.query("SELECT COUNT(*) AS overdueCount FROM rentals WHERE status = 'rented' AND due_date < CURDATE() ");

  // Low inventory
  const [lowInventory] = await pool.query(`SELECT title, available_copies FROM books WHERE available_copies <= 3`);
  // Expiring memberships (if expiry_date exists)
  let expiringMembers = [];
  try {
    const [expMembers] = await pool.query(`SELECT full_name, expiry_date FROM members WHERE expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date >= CURDATE()`);
    expiringMembers = expMembers;
  } catch (e) {
    expiringMembers = [];
  }
  // Recent activity (last 5 rentals/returns/overdue)
  const [activityRaw] = await pool.query(`
    SELECT r.*, m.full_name AS member_name, b.title AS book_title
    FROM rentals r
    JOIN members m ON r.member_id = m.id
    JOIN books b ON r.book_id = b.id
    ORDER BY GREATEST(IFNULL(r.returned_at, '1970-01-01'), r.rented_at, r.due_date) DESC
    LIMIT 5
  `);
  function timeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return diff + ' seconds ago';
    if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    return Math.floor(diff / 86400) + ' days ago';
  }
  const activity = activityRaw.map(item => {
    let date = item.rented_at;
    if (item.status === 'returned') date = item.returned_at;
    else if (item.status === 'rented' && item.due_date && new Date(item.due_date) < new Date()) date = item.due_date;
    return { ...item, timeAgo: timeAgo(date) };
  });
  res.render('dashboard', {
    title: 'Dashboard',
    booksCount,
    membersCount,
    booksOut,
    overdueCount,
    lowInventory,
    expiringMembers,
    activity
  });
});

module.exports = router;
