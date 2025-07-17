const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function seed() {
  // Seed staff
  const staff = [
    { username: 'admin', password: 'admin123', full_name: 'Admin User', role: 'admin' },
    { username: 'librarian1', password: 'lib123', full_name: 'Librarian One', role: 'librarian' },
    { username: 'librarian2', password: 'lib456', full_name: 'Librarian Two', role: 'librarian' }
  ];
  for (const s of staff) {
    const hash = await bcrypt.hash(s.password, 10);
    await pool.query('INSERT IGNORE INTO staff (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)', [s.username, hash, s.full_name, s.role]);
  }

  // Seed categories
  const categories = ['Fiction', 'Science', 'History', 'Technology', 'Children', 'Comics'];
  for (const name of categories) {
    await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name]);
  }

  // Seed books
  for (let i = 1; i <= 100; i++) {
    const catId = (i % categories.length) + 1;
    await pool.query('INSERT INTO books (title, author, isbn, category_id, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)', [
      `Book Title ${i}`,
      `Author ${i}`,
      `ISBN${10000 + i}`,
      catId,
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1
    ]);
  }

  // Seed members
  for (let i = 1; i <= 100; i++) {
    await pool.query('INSERT INTO members (full_name, email, phone, address) VALUES (?, ?, ?, ?)', [
      `Member ${i}`,
      `member${i}@example.com`,
      `555-010${i.toString().padStart(2, '0')}`,
      `Address ${i}`
    ]);
  }

  // Seed rentals
  for (let i = 1; i <= 50; i++) {
    const memberId = Math.floor(Math.random() * 100) + 1;
    const bookId = Math.floor(Math.random() * 100) + 1;
    const staffId = Math.floor(Math.random() * 3) + 1;
    const rentedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(rentedAt.getTime() + (7 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000);
    await pool.query('INSERT INTO rentals (member_id, book_id, staff_id, rented_at, due_date, status) VALUES (?, ?, ?, ?, ?, ?)', [
      memberId,
      bookId,
      staffId,
      rentedAt,
      dueDate,
      Math.random() > 0.7 ? 'returned' : 'rented'
    ]);
  }

  console.log('Sample data seeded.');
  process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });
