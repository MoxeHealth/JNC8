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

exports.msString = function(target) {
  if(typeof target === 'string') {
    console.log('target string', target );
    return '\'' + target + '\'';
  } else if(target instanceof Date) {
    console.log('target Date', target );
    return '\'' + target.toISOString().slice(0, 19).replace('T', ' ') + '\'';
    //without the following conditional, the target will be stringified to 'undefined'
  } else if(!target) {
    return 'NULL';
  } else {
    return '\'' + JSON.stringify(target) + '\'';
  }
};

var pool = new ConnectionPool(exports.poolconfig, exports.config);

//strips off metadata and unnests the object from inside the value key 
var parseData = function(array) {
	for (var i = 0; i < array.length; i++) {
		for(key in array[i]) {
			if(array[i][key].value !== 'undefined'){
				if(key === 'encounterDate' || key === 'emailHash' || key === 'ptId' || key === 'race') { // it's the date
					array[i][key] = array[i][key].value;
				} else { // it's any of the others; parse
					array[i][key] = JSON.parse(array[i][key].value);
				}
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
			      console.log(rows);
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

// takes a UID and constructs a db query with it
exports.makeUserQuery = function(uid) {
	if(uid.indexOf(' ') > -1) {
		throw new Error('There can\'t be spaces in the uid.');
	} else {
		return 'SELECT * FROM dbo.Encounters WHERE emailHash= \'' + uid + '\'';
	}
};
