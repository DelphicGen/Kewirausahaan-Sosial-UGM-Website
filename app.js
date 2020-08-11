if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mysql = require('mysql');
const async = require("async");
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config.js');
const util = require('util');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kewirausahaan_sosial_ugm'
});

const query = util.promisify(connection.query).bind(connection);

initializePassport(passport, async (email) => {
    let selectedUser = await query("SELECT * FROM users WHERE email = '" + email + "'");
    return selectedUser[0];
}, async(id) => {
    let selectedUser = await query("SELECT * FROM users WHERE id = '" + id + "'");
    return selectedUser[0];
});


app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 3600000 },
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', (req, res) => {

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

app.get("/events", (req, res) => {
    connection.query(
        'SELECT * FROM upcoming_event WHERE (date >= CURRENT_TIMESTAMP()) OR (date >= CURRENT_TIMESTAMP() AND HOUR(date) >= HOUR(CURRENT_TIMESTAMP())) ORDER BY date',
        (error, results) => {
            res.render('events.ejs', { upcomingEvents: results });
        }
    )
})

app.get("/articles", (req, res) => {
    connection.query(
        'SELECT * FROM article ORDER BY created DESC',
        (error, results) => {
            res.render('articles.ejs', { articles: results });
        }
    )
})


app.get("/article", (req, res) => {
    connection.query(
        'SELECT * FROM article WHERE id = ?',
        req.query.id,
        (error, results) => {
            console.log(results);
            console.log(results[0].full_details.toString());
            res.render('article.ejs', { article: results[0] });
        }
    )
})

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/adminDashboard',
    failureRedirect: '/login',
    failureFlash: true 
}));

app.get("/register", async (req, res) => {
    req.user.then (data => {
        if(data.role === 'super admin') res.render('register.ejs');
        else res.redirect('/adminDashboard');
    })
});

app.post('/register', async(req, res) => {
    req.user.then (async (data) => {
        if(data.role === 'super admin') {
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                connection.query("SELECT COUNT(*) AS cnt FROM users WHERE email = ? " , 
                    req.body.email , 
                    function(err , data){
                        if(err){
                            console.log(err);
                        }   
                        else{
                            if(data[0].cnt > 0) {  
                                res.render('register.ejs', { message: 'Email is registered' });
                            } else {
                                connection.query(
                                    "INSERT INTO users (email, username, password) VALUES ('" + req.body.email + "', '" + req.body.username + "', '" + hashedPassword + "')",
                                    (error, results) => {
                                        if(error) throw error;
                                        else res.redirect('/adminDashboard');
                                    }
                                );                  
                            }
                        }
                    })
        
            } catch {
                res.redirect('/register');
            }
        }
        else res.redirect('/adminDashboard');
    }) 
});

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

app.get('/forgot', function(req, res) {
    res.render('forgot');
});

app.post('/forgot', function(req, res, next) {
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
                    ('00' + (date.getHours() + 1)).slice(-2) + ':' + 
                    ('00' + date.getMinutes()).slice(-2) + ':' + 
                    ('00' + date.getSeconds()).slice(-2);
                console.log(date)

                if (user.length === 0) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
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
      res.redirect('/forgot');
    });
  });

app.get('/reset/:token', function(req, res) {
    connection.query("SELECT * FROM users WHERE resetPasswordToken = ? " ,
        req.params.token,
        function(err, user) {
            if (user.length === 0) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
            res.render('reset', {user: user[0]});
        });
});

app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
            connection.query("SELECT * FROM users WHERE resetPasswordToken = ? " ,
                req.params.token,
                async function(err, user) {
                    console.log(user)
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
          res.redirect('/login');
        });
      }
    ]);
  });

app.get('/adminDashboard', checkAuthenticated, async function(req, res){
    
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

app.get('/userList', async function(req, res){
    req.user.then (data => {
        if(data.role === "super admin") {
            connection.query(
                'SELECT * FROM users WHERE role = "admin"',
                function(error, results) {
                    if(error) throw error;
                    else res.render('./admin/userList.ejs', { users: results });
                }
            );
        } else res.redirect('/adminDashboard');
    })
})

app.get('/edit', function(req, res) {
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

app.post('/edit', function(req, res) {
    let date, image;
    if(req.body.date) {
        date = req.body.date.replace('T', ' ');
    }
    if(req.body.image) {
        image = `./assets/images/${req.query.table}/${req.body.image}`;
    }
    console.log(req.body)
    switch(req.query.table) {
        case 'mentor':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, facebook = ?, twitter = ?, instagram = ?, linkedin = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'latest_event':
            connection.query(
                'UPDATE (??) SET date = ?, link = ? WHERE id = ?',
                [req.query.table, date, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'upcoming_event':
            connection.query(
                'UPDATE (??) SET title = ?, details = ?, date = ?, image = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.title, req.body.details, date, image, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'team_member':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, facebook = ?, twitter = ?, instagram = ?, linkedin = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;
        
        case 'article':
            connection.query(
                'UPDATE (??) SET title = ?, author = ?, details = ?, full_details = ?, image = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.title, req.body.author, req.body.details, req.body.full_details, image, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'testimonial':
            connection.query(
                'UPDATE (??) SET name = ?, details = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.details, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'leader_review':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, details = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.details, image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;
        default:
            res.redirect('/adminDashboard')
    }
});

app.post('/delete', function(req, res) {
    connection.query(
        'DELETE FROM ?? WHERE id = (?)',
        [req.query.table, req.query.id],
        (error, results) => {
            if(error) throw error;
            else res.redirect('/adminDashboard');
        }
    );
            
});

app.get('/new', function(req, res) {
    connection.query(
        "SHOW COLUMNS FROM ??",
        [req.query.table],
        (error, results) => {
            if (error) throw error;
            else res.render('./admin/new.ejs', { table: req.query.table, columns: results });
        }
    );
});

app.post('/new', function(req, res) {
    console.log(req.body)
    let date, image;
    if(req.body.date) {
        date = req.body.date.replace('T', ' ');
    }
    if(req.body.image) {
        image = `./assets/images/${req.query.table}/${req.body.image}`;
    }
    switch(req.query.table) {
        case 'mentor':
            connection.query(
                'INSERT INTO ?? (name, title, facebook, twitter, instagram, linkedin, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'latest_event':
            connection.query(
                'INSERT INTO ?? (date, link) VALUES (?, ?)',
                [req.query.table, date, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'upcoming_event':
            connection.query(
                'INSERT INTO ?? (title, details, date, image, link) VALUES (?, ?, ?, ?, ?)',
                [req.query.table, req.body.title, req.body.details, date, image, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'team_member':
            connection.query(
                'INSERT INTO ?? (name, title, facebook, twitter, instagram, linkedin, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;
        
        case 'article':
            connection.query(
                'INSERT INTO ?? (title, author, details, full_details, image, link) VALUES (?, ?, ? ?, ?)',
                [req.query.table, req.body.title, req.body.author, req.body.details, req.body.full_details, image, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'testimonial':
            connection.query(
                'INSERT INTO ?? (name, details, image) VALUES (?, ?, ?)',
                [req.query.table, req.body.name, req.body.details, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'leader_review':
            connection.query(
                'INSERT INTO ?? (name, title, details, image) VALUES (?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.details, image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;
        default:
            res.redirect('/adminDashboard')
    }
});


app.get('*', function(req, res){
    res.render('404.ejs');
});

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/adminDashboard')
    }
    return next();
}

app.listen(process.env.PORT || 3000);