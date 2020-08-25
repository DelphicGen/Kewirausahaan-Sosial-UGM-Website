require('dotenv').config();
const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('express-flash');
const session = require('cookie-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config.js');
const util = require('util');
const baseUrl = require('./variables/variables');

const clientRoutes = require("./routes/clientRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connection = require('./connection/connection');

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

app.use(baseUrl, [clientRoutes, authRoutes, adminRoutes]);

app.get('*', function(req, res){
    res.render('404.ejs');
});

app.listen(process.env.PORT || 3040);