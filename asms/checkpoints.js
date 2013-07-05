var flow = require('flow'),
    pub = require('../redisconnect').pub,
    sub = require('../redisconnect').sub;

exports.publish = function(params) {
    flow.exec(
        function() {
            var collection = db.collection('activities');
            collection.insert(params, this);
        },
        function(err, result) {
            if (err) {
                cosole.log(err);
            }
            console.log('# publishing message to redis');
            pub.publish('checkpoints', JSON.stringify(result[0]));
        }
    );
};

exports.on = function(sockets) {
    flow.exec(
        function() {
            sub.on('message', function(channel, message) {
                console.log('# emitting message to socket');
                sockets.emit('checkpoints', message);
            });
        }
    );
};

exports.subscribe = function() {
    flow.exec(
        function() {
            console.log('# subscribing to redis');
            sub.subscribe('checkpoints');
        }
    );
};