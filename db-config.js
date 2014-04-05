var mysql = require('mysql');

var host = process.env.DB_HOST || 'localhost';

var connection = mysql.createConnection({
  host: host,
  database: 'JNC8',
  user: 'root',
  password: ''
});

connection.connect();

connection.query('SELECT * FROM `test`', function(err, rows, fields) {
  if(err) throw err;

  console.log(rows);
};