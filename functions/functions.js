const baseUrl = require('../variables/variables');

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect(`${baseUrl}login`)
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect(`${baseUrl}adminDashboard`)
    }
    return next();
}

module.exports = [checkAuthenticated, checkNotAuthenticated]