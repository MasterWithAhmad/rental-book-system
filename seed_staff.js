require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seedStaff() {
    const users = [
        {
            username: 'admin',
            password: 'admin123',
            full_name: 'Admin User',
            role: 'admin'
        },
        {
            username: 'librarian',
            password: 'lib123',
            full_name: 'Librarian User',
            role: 'librarian'
        }
    ];

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        try {
            await pool.query(
                'INSERT INTO staff (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
                [user.username, hash, user.full_name, user.role]
            );
            console.log(`Inserted user: ${user.username}`);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log(`User already exists: ${user.username}`);
            } else {
                console.error(`Error inserting ${user.username}:`, err);
            }
        }
    }
    process.exit();
}

seedStaff();
