var flow = require('flow');

exports.latest = function(req, res, next) {
    flow.exec(
        function() {
            var collection = db.collection('activities');
            collection.find().sort({'timestamp': -1}).
                              limit(1).
                              toArray(this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            if (result.length === 0) {
                res.json(400, {'err': 'resource not found'});
            }

            res.json(200, result[0]);
        }
    );
};