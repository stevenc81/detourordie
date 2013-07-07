var flow = require('flow');

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
            console.log('# publishing %s to redis', JSON.stringify(result[0]));
            publisher.publish('checkpoints', JSON.stringify(result[0]));
        }
    );
};

exports.on = function(sockets) {
    flow.exec(
        function() {
            subscriber.on('message', function(channel, message) {
                console.log('# emitting %s to socket %s', message, sockets.name);
                sockets.emit('checkpoints', message);
            });
        }
    );
};

exports.subscribe = function() {
    flow.exec(
        function() {
            console.log('# subscribing to redis');
            subscriber.subscribe('checkpoints');
        }
    );
};

exports.onConnect = function(socket) {
    flow.exec(
        function() {
            console.log('# new socket connected: id = %s, namespoace = %s',
                socket.id, socket.namespace.name);
        }
    );
};