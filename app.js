if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mysql = require('mysql');
const mariadb = require('mariadb/callback');
const async = require("async");
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config.js');
const util = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kewirausahaan_sosial_ugm'
});

const connection2 = mariadb.createConnection({
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
        function(callback) { connection.query('SELECT * FROM article LIMIT 3', callback); },
        function(callback) { connection.query('SELECT * FROM testimonial LIMIT 6', callback); },
        function(callback) { connection.query('SELECT * FROM leader_review LIMIT 6', callback); },
    ], function(error, results) {
        if(error) throw error;
        else res.render('index.ejs', { mentors: results[0][0], teamMembers: results[1][0], latestEvents: results[2][0], upcomingEvents: results[3][0], articles: results[4][0], testimonials: results[5][0], leaderReviews: results[6][0] });
    });

});

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
})

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
                        if (error) throw error;
                        else res.render('./admin/edit.ejs', { data: results[0], table: req.query.table, id: req.query.id, columns: columns });
                    }
                );
            };
        }
    );
    
});

app.post('/edit', function(req, res) {
    switch(req.query.table) {
        case 'mentor':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, facebook = ?, twitter = ?, instagram = ?, linkedin = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, req.body.image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'latest_event':
            connection.query(
                'UPDATE (??) SET date = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.date, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'upcoming_event':
            connection.query(
                'UPDATE (??) SET title = ?, details = ?, date = ?, image = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.title, req.body.details, req.body.date, req.body.image, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'team_member':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, facebook = ?, twitter = ?, instagram = ?, linkedin = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, req.body.image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;
        
        case 'article':
            connection.query(
                'UPDATE (??) SET title = ?, details = ?, image = ?, link = ? WHERE id = ?',
                [req.query.table, req.body.title, req.body.details, req.body.image, req.body.link, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'testimonial':
            connection.query(
                'UPDATE (??) SET name = ?, details = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.details, req.body.image, req.query.id],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'leader_review':
            connection.query(
                'UPDATE (??) SET name = ?, title = ?, details = ?, image = ? WHERE id = ?',
                [req.query.table, req.body.name, req.body.title, req.body.details, req.body.image, req.query.id],
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
    switch(req.query.table) {
        case 'mentor':
            connection.query(
                'INSERT INTO ?? (name, title, facebook, twitter, instagram, linkedin, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, req.body.image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'latest_event':
            connection.query(
                'INSERT INTO ?? (date, link) VALUES (?, ?)',
                [req.query.table, req.body.date, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'upcoming_event':
            connection.query(
                'INSERT INTO ?? (title, details, date, image, link) VALUES (?, ?, ?, ?, ?)',
                [req.query.table, req.body.title, req.body.details, req.body.date, req.body.image, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'team_member':
            connection.query(
                'INSERT INTO ?? (name, title, facebook, twitter, instagram, linkedin, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.facebook, req.body.twitter, req.body.instagram, req.body.linkedin, req.body.image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;
        
        case 'article':
            connection.query(
                'INSERT INTO ?? (title, details, image, link) VALUES (?, ?, ?, ?)',
                [req.query.table, req.body.title, req.body.details, req.body.image, req.body.link],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'testimonial':
            connection.query(
                'INSERT INTO ?? (name, details, image) VALUES (?, ?, ?)',
                [req.query.table, req.body.name, req.body.details, req.body.image],
                (error, results) => {
                    if(error) throw error;
                    else res.redirect('/adminDashboard')
                }
            );
            break;

        case 'leader_review':
            connection.query(
                'INSERT INTO ?? (name, title, details, image) VALUES (?, ?, ?, ?)',
                [req.query.table, req.body.name, req.body.title, req.body.details, req.body.image],
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

app.listen(3000);