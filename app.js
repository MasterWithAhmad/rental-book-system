const express = require('express');
const path = require('path');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');

require('dotenv').config();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session and flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'library_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Pass user info to all views
app.use((req, res, next) => {
  res.locals.staffId = req.session.staffId;
  res.locals.staffRole = req.session.staffRole;
  res.locals.staffName = req.session.staffName;
  next();
});

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.staffId && !req.path.startsWith('/auth')) {
    return res.redirect('/auth/login');
  }
  next();
}
app.use(requireLogin);

// Routes
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const booksRouter = require('./routes/books');
const staffRouter = require('./routes/staff');
const membersRouter = require('./routes/members');
const rentalsRouter = require('./routes/rentals');
const reportsRouter = require('./routes/reports');
const auditRouter = require('./routes/audit');
const settingsRouter = require('./routes/settings');
app.use('/auth', authRouter);
app.use('/', dashboardRouter);
app.use('/books', booksRouter);
app.use('/staff', staffRouter);
app.use('/members', membersRouter);
app.use('/rentals', rentalsRouter);
app.use('/reports', reportsRouter);
app.use('/audit', auditRouter);
app.use('/settings', settingsRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
