const express = require('express');
const mysql = require('mysql');
const async = require("async");
const router = express.Router();
const [checkAuthenticated, checkNotAuthenticated, add, edit] = require('../functions/functions');
const baseUrl = require('../variables/variables');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kewirausahaan_sosial_ugm'
});

router.get(`${baseUrl}adminDashboard`, checkAuthenticated, async function(req, res){
    
    req.user.then (data => {
        let username = data.username;
        let role = data.role;
        async.parallel([
            function(callback) { connection.query('SELECT * FROM mentor', callback); },
            function(callback) { connection.query('SELECT * FROM team_member', callback); },
            function(callback) { connection.query('SELECT * FROM latest_event', callback); },
            function(callback) { connection.query('SELECT * FROM upcoming_event', callback); },
            function(callback) { connection.query('SELECT * FROM article', callback); },
            function(callback) { connection.query('SELECT * FROM testimonial', callback); },
            function(callback) { connection.query('SELECT * FROM leader_review', callback); },
        ], function(error, results) {
            if(error) throw error;
            else res.render('./admin/adminDashboard.ejs', { username: username, role: role, mentors: results[0][0], teamMembers: results[1][0], latestEvents: results[2][0], upcomingEvents: results[3][0], articles: results[4][0], testimonials: results[5][0], leaderReviews: results[6][0] });
        });
    })

    
});

router.get(`${baseUrl}userList`, async function(req, res){
    req.user.then (data => {
        if(data.role === "super admin") {
            connection.query(
                'SELECT * FROM users WHERE role = "admin"',
                function(error, results) {
                    if(error) throw error;
                    else res.render('./admin/userList.ejs', { users: results });
                }
            );
        } else res.redirect(`${baseUrl}adminDashboard`);
    })
})

router.get(`${baseUrl}edit`, function(req, res) {
    connection.query(
        "SHOW COLUMNS FROM ??",
        [req.query.table],
        (error, results) => {
            if (error) throw error;
            else {
                let columns = results;
                connection.query(
                    "SELECT * FROM (??) WHERE id = (?)",
                    [req.query.table, req.query.id],
                    (error, results) => {
                        if('date' in results[0]){
                            let mm = results[0].date.getMonth() + 1 < 9 ? `0${results[0].date.getMonth() + 1}` : results[0].date.getMonth() + 1;
                            let dd = results[0].date.getDate() < 9 ? `0${results[0].date.getDate()}` : results[0].date.getDate();
                            let yyyy = results[0].date.getFullYear();
                            let hh = results[0].date.getHours() < 9 ? `0${results[0].date.getHours()}` : results[0].date.getHours();
                            let m = results[0].date.getMinutes() < 9 ? `0${results[0].date.getMinutes()}` : results[0].date.getMinutes();
                            results[0].date = `${yyyy}-${mm}-${dd}T${hh}:${m}`;
                        }
                        if (error) throw error;
                        else res.render('./admin/edit.ejs', { data: results[0], table: req.query.table, id: req.query.id, columns: columns });
                    }
                );
            };
        }
    );
    
});

router.post(`${baseUrl}edit`, async function(req, res) {
    let date, image;
    if(req.body.date) {
        date = req.body.date.replace('T', ' ');
    }

    if (req.body.cropped_image) {
        image = req.body.cropped_image
        edit(req, res, date, image)
    } else if(req.body.image) {
        image = `/assets/images/${req.query.table}/${req.body.image}`;
        edit(req, res, date, image)
    } else if(!req.body.image) {
        connection.query(
            'SELECT * FROM (??) WHERE id = ?',
            [req.query.table, req.query.id],
            (error, results) => {
                if(error) throw error;
                else {
                    if(results[0].image) image = results[0].image
                    edit(req, res, date, image)
                }
            }
        );
    }
});

router.post(`${baseUrl}delete`, function(req, res) {
    connection.query(
        'DELETE FROM ?? WHERE id = (?)',
        [req.query.table, req.query.id],
        (error, results) => {
            if(error) throw error;
            else res.redirect('back');
        }
    );
            
});

router.get(`${baseUrl}new`, function(req, res) {
    connection.query(
        "SHOW COLUMNS FROM ??",
        [req.query.table],
        (error, results) => {
            if (error) throw error;
            else res.render('./admin/new.ejs', { table: req.query.table, columns: results });
        }
    );
});

router.post(`${baseUrl}new`, function(req, res) {
    let date, image;
    if(req.body.date) {
        date = req.body.date.replace('T', ' ');
    }

    if (req.body.cropped_image) {
        image = req.body.cropped_image
    } else if(req.body.image) {
        image = `/assets/images/${req.query.table}/${req.body.image}`;
    } else {
        image = '/assets/images/default/avatar.svg';
    }
    add(req, res, date, image)
});

module.exports = router;