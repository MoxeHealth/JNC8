var mysql = require('mysql');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var ConnectionPool = require('tedious-connection-pool');



exports.config = {
	userName: 'ianlyyons@hjk6ivqh8d',
	password: '4nd1am0!!',
	server: 'hjk6ivqh8d.database.windows.net',
	port: 1433,
	options: {
		database: 'JNC8DB',
		encrypt: true,
		rowCollectionOnRequestCompletion: true,
		useColumnNames: true
	}
};

exports.poolconfig = {
	max: 10,
	min: 0,
	idleTimeoutMillis: 30000
}

var pool = new ConnectionPool(exports.poolconfig, exports.config);

var parseData = function(array) {
	for (var i = 0; i < array.length; i++) {
		for(key in array[i]) {
			console.log(array[i][key].value);
			if(key === 'encounter_date') { // it's the date
				array[i][key] = array[i][key].value;
			} else { // it's any of the others; parse
				array[i][key] = JSON.parse(array[i][key].value);
			}
		}
	};
	return array;
}

exports.queryHelper = function(query, callback) {

	pool.requestConnection(function (err, connection) {
		if(!err) {
			  var request = new Request(query, function(err, rowCount, rows) {
			    if (err) {
			      console.log('Request error: ' + err);
			      callback(err);
			    } else {
			      console.log('Successful request. Returning ' + rowCount + ' rows...');
			     	rows = parseData(rows);
			      callback(err, rows);
						connection.close();
			    }
			  });
		  	connection.execSql(request);
		} else {
			console.log(err);
		}
	});

};