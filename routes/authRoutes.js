const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const async = require("async");
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const [checkAuthenticated, checkNotAuthenticated] = require('../functions/functions');
const baseUrl = require('../variables/variables');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kewirausahaan_sosial_ugm'
});


router.get(`${baseUrl}login`, checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

router.post(`${baseUrl}login`, checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: `${baseUrl}adminDashboard`,
    failureRedirect: `${baseUrl}login`,
    failureFlash: true 
}));

router.get(`${baseUrl}register`, async (req, res) => {
    req.user.then (data => {
        if(data.role === 'super admin') res.render('register.ejs');
        else res.redirect(`${baseUrl}adminDashboard`);
    })
});

router.post(`${baseUrl}register`, async(req, res) => {
    req.user.then (async (data) => {
        if(data.role === 'super admin') {
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                connection.query("SELECT COUNT(*) AS cnt FROM users WHERE email = ? " , 
                    req.body.email , 
                    function(err , data){
                        if(err){
                            throw err;
                        }   
                        else{
                            if(data[0].cnt > 0) {  
                                res.render('register.ejs', { message: 'Email is registered' });
                            } else {
                                connection.query(
                                    "INSERT INTO users (email, username, password) VALUES ('" + req.body.email + "', '" + req.body.username + "', '" + hashedPassword + "')",
                                    (error, results) => {
                                        if(error) throw error;
                                        else res.redirect(`${baseUrl}adminDashboard`);
                                    }
                                );                  
                            }
                        }
                    })
        
            } catch {
                res.redirect(`${baseUrl}register`);
            }
        }
        else res.redirect(`${baseUrl}adminDashboard`);
    }) 
});

router.delete(`${baseUrl}logout`, (req, res) => {
    req.logOut();
    res.redirect(`${baseUrl}login`);
});

router.get(`${baseUrl}forgot`, function(req, res) {
    res.render('forgot');
});

router.post(`${baseUrl}forgot`, function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        connection.query("SELECT * FROM users WHERE email = ? " , 
            req.body.email , 
            function(err , user){
                var date;
                date = new Date();
                date = date.getUTCFullYear() + '-' +
                    ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
                    ('00' + date.getUTCDate()).slice(-2) + ' ' + 
                    ('00' + (date.getHours())).slice(-2) + ':' + 
                    ('00' + date.getMinutes()).slice(-2) + ':' + 
                    ('00' + date.getSeconds()).slice(-2);

                if (user.length === 0) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect(`${baseUrl}forgot`);
                }

                connection.query("UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?",
                    [ token, date, user[0].email ],
                    function(err) {
                        done(err, token, user);
                    }
                )

            });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'ksugm123',
            pass: 'ksjaya123'
          }
        });
        var mailOptions = {
          to: user[0].email,
          from: 'ksugm123',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('info', 'An e-mail has been sent to ' + user[0].email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect(`${baseUrl}forgot`);
    });
  });

router.get(`${baseUrl}reset/:token`, function(req, res) {
    connection.query("SELECT * FROM users WHERE resetPasswordToken = ? " ,
        req.params.token,
        function(err, user) {
            if (user.length === 0) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect(`${baseUrl}forgot`);
            }
            res.render('reset', {user: user[0]});
        });
});

router.post(`${baseUrl}reset/:token`, function(req, res) {
    async.waterfall([
    function(done) {
            connection.query("SELECT * FROM users WHERE resetPasswordToken = ? " ,
                req.params.token,
                async function(err, user) {
                    if (user.length === 0) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }

                    if (req.body.newPassword !== req.body.confirmPassword) {
                        req.flash('error', 'New Password did not match with Confirm Password');
                        return res.redirect('back');
                    }

                    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
                    connection.query("UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE email = ?",
                        [ hashedPassword, user[0].email ],
                        function(err) {
                            done(err, req.params.token, user);
                        }
                    )
                });
        
    },
    function(user, done) {
        var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'ksugm123',
            pass: 'ksjaya123'
        }
        });
        var mailOptions = {
        to: user.email,
        from: 'ksugm123',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user[0].email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        res.redirect(`${baseUrl}login`);
        });
    }
    ]);
});

// function checkAuthenticated(req, res, next) {
//     if(req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect(`${baseUrl}login`)
// }

// function checkNotAuthenticated(req, res, next) {
//     if(req.isAuthenticated()) {
//         return res.redirect(`${baseUrl}adminDashboard`)
//     }
//     return next();
// }

module.exports = router;