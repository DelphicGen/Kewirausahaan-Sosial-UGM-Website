const baseUrl = require('../variables/variables');
const mysql = require('mysql');
const connection = require('../connection/connection');

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

function add(req, res, date, image) {
    switch(req.query.table) {
        case 'mentor':
            connection.query(
                'INSERT INTO ?? (name, title, facebook, twitter, instagram, linkedin, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'latest_event':
            connection.query(
                'INSERT INTO ?? (date, link) VALUES (?, ?)',
                [req.query.table, date, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'upcoming_event':
            connection.query(
                'INSERT INTO ?? (title, details, full_details, date, image, link) VALUES (?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.title, req.body.details, req.body.full_details, date, image, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'team_member':
            connection.query(
                'INSERT INTO ?? (name, title, facebook, twitter, instagram, linkedin, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;
        
        case 'article':
            connection.query(
                'INSERT INTO ?? (title, author, details, full_details, image, link) VALUES (?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.title, req.body.author, req.body.details, req.body.full_details, image, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'testimonial':
            connection.query(
                'INSERT INTO ?? (name, details, image) VALUES (?, ?, ?)',
                [req.query.table, req.body.name, req.body.details, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'leader_review':
            connection.query(
                'INSERT INTO ?? (name, title, details, image) VALUES (?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.details, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;
        case 'collaboration':
            connection.query(
                'INSERT INTO ?? (name, email, message) VALUES (?, ?, ?)',
                [req.query.table, req.body.email, req.body.email, req.body.message],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;
        default:
            res.redirect(`${baseUrl}adminDashboard`)
    }
}

function edit(req, res, date, image) {
    switch(req.query.table) {
        case 'mentor':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, facebook = ?, twitter = ?, instagram = ?, linkedin = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'latest_event':
            connection.query(
                'UPDATE (??) SET date = ?, link = ? WHERE id = ?',
                [req.query.table, date, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'upcoming_event':
            connection.query(
                'UPDATE (??) SET title = ?, details = ?, full_details = ?, date = ?, image = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.title, req.body.details, req.body.full_details, date, image, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'team_member':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, facebook = ?, twitter = ?, instagram = ?, linkedin = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;
        
        case 'article':
            connection.query(
                'UPDATE (??) SET title = ?, author = ?, details = ?, full_details = ?, image = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.title, req.body.author, req.body.details, req.body.full_details, image, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'testimonial':
            connection.query(
                'UPDATE (??) SET name = ?, details = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.details, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;

        case 'leader_review':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, details = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.details, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`)
                }
            );
            break;
        case 'collaboration':
            connection.query(
                'UPDATE ?? SET name = ?, email = ?, message = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.email, req.body.message, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect(`${baseUrl}adminDashboard`);
                }
            );
            break;
        default:
            res.redirect(`${baseUrl}adminDashboard`);
    }
}

module.exports = [checkAuthenticated, checkNotAuthenticated, add, edit]