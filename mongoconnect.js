var Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var server = new Server(conf.mongo.host, conf.mongo.port, conf.mongo.host_opts);
var mongo = new Db(conf.mongo.dbname, server, conf.mongo.opts);
mongo.open(function(err, p_client) {
  if (err) {
    console.log(err);
  }
});

module.exports = mongo;