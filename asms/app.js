global.conf = require('../config');

global.subscriber = require('../redisconnect').sub;

var io = require('socket.io').listen(9002, function() {
    console.log("HTTP server for ASMS listening on port " + '9002' + ' with mode ' + process.env.ENV_NODE);
});

io.set('log level', 2);

var checkpointsAsms = require('./checkpoints');
checkpointsAsms.subscribe();
checkpointsAsms.on(io.of('/checkpoints').on('connection', checkpointsAsms.onConnect));
