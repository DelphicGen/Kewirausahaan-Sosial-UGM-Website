const express = require('express');
const router = express.Router();
const async = require("async");
const nodemailer = require('nodemailer');
const baseUrl = require('../variables/variables');

const connection = require('../connection/connection');

router.get(baseUrl, (req, res) => {

    async.parallel([
        function(callback) { connection.query('SELECT * FROM mentor', callback); },
        function(callback) { connection.query('SELECT * FROM team_member', callback); },
        function(callback) { connection.query('SELECT * FROM latest_event WHERE date <= CURDATE() ORDER BY date DESC LIMIT 2', callback); },
        function(callback) { connection.query('SELECT * FROM upcoming_event WHERE (date >= CURRENT_TIMESTAMP()) OR (date >= CURRENT_TIMESTAMP() AND HOUR(date) >= HOUR(CURRENT_TIMESTAMP())) ORDER BY date', callback); },
        function(callback) { connection.query('SELECT * FROM article ORDER BY created DESC LIMIT 3', callback); },
        function(callback) { connection.query('SELECT * FROM testimonial LIMIT 6', callback); },
        function(callback) { connection.query('SELECT * FROM leader_review LIMIT 6', callback); },
    ], function(error, results) {
        if(error) throw error;
        else res.render('index.ejs', { mentors: results[0][0], teamMembers: results[1][0], latestEvents: results[2][0], upcomingEvents: results[3][0], articles: results[4][0], testimonials: results[5][0], leaderReviews: results[6][0] });
    });

});

router.get(`${baseUrl}events`, (req, res) => {
    connection.query(
        'SELECT * FROM upcoming_event WHERE (date >= CURRENT_TIMESTAMP()) OR (date >= CURRENT_TIMESTAMP() AND HOUR(date) >= HOUR(CURRENT_TIMESTAMP())) ORDER BY date',
        (error, results) => {
            res.render('events.ejs', { upcomingEvents: results });
        }
    )
})

router.get(`${baseUrl}event`, (req, res) => {
    connection.query(
        'SELECT * FROM upcoming_event WHERE id = ?',
        req.query.id,
        (error, results) => {
            res.render('event.ejs', { event: results[0] });
        }
    )
})

router.get(`${baseUrl}articles`, (req, res) => {
    connection.query(
        'SELECT * FROM article ORDER BY created DESC',
        (error, results) => {
            res.render('articles.ejs', { articles: results });
        }
    )
})


router.get(`${baseUrl}article`, (req, res) => {
    connection.query(
        'SELECT * FROM article WHERE id = ?',
        req.query.id,
        (error, results) => {
            res.render('article.ejs', { article: results[0] });
        }
    )
})

router.post(`${baseUrl}collab`, (req, res, next) => {
    async.waterfall([
        (done) => {
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ksugm123',
                    pass: 'ksjaya123'
                }
            });
              
            let mailOptions = {
                from: 'ksugm123',
                // to: 'gennardo@mail.ugm.ac.id',
                to: 'brian@kewirausahaansosial.com',
                subject: `Ajakan Kolaborasi dari ${req.body.name}, email: ${req.body.email}`,
                text: req.body.message
            };
            transporter.sendMail(mailOptions, (error, info) => {
                done(error, info)
            });
        },
        (info) => {
            connection.query(
                'INSERT INTO collaboration (name, email, message) VALUES (?, ?, ?)',
                [req.body.name, req.body.email, req.body.message],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/')
                }
            )
        }
    ], (error) => {
        if(error) return next(err);
        res.redirect(`${baseUrl}`)
    })

})

module.exports = router;