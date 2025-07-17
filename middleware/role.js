// Middleware for role-based access
function requireRole(role) {
    return function (req, res, next) {
        if (req.session.staffRole !== role) {
            return res.status(403).render('error', { title: 'Forbidden', message: 'Access denied.' });
        }
        next();
    };
}

module.exports = { requireRole };
