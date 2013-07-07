global.conf = require('../config');

var http = require('http');

global.subscriber = require('../redisconnect').sub;

var server = http.createServer();
var io = require('socket.io').listen(server);
io.set('log level', 1);

server.listen(9002, function() {
    console.log("HTTP server for ASMS listening on port " + '9002' + ' with mode ' + process.env.ENV_NODE);
});

var checkpointsAsms = require('./checkpoints');
checkpointsAsms.subscribe();
checkpointsAsms.on(io.of('/checkpoints').on('connection', checkpointsAsms.onConnect));
