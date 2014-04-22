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