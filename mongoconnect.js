var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    url = require('url');

var connectionUri = url.parse(process.env.MONGODB_URL);

var server = new Server(connectionUri.hostname, connectionUri.port, conf.mongo.host_opts);
var db = new Db(connectionUri.pathname.substr(1), server, conf.mongo.opts);

db.open(function(err, db) {
    if(err) throw err;
    console.log("Connected to Database");

    if (connectionUri.auth) {
        creds = connectionUri.auth.split(':');
        db.authenticate(creds[0], creds[1], function(err, result) {
            if (err) throw err;
            console.log("Authenticated");
        });
    }
});

module.exports = db;