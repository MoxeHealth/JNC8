var mysql = require('mysql');

var host = process.env.DB_HOST || 'localhost';

exports.connection = mysql.createConnection({
  host: host,
  database: 'JNC8',
  user: 'root',
  password: ''
});

exports.connection.connect();