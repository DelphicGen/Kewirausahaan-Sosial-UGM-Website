const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kewirausahaan_sosial_ugm'
});

module.exports = connection