var flow = require('flow'),
    moment = require('moment'),
    asms = require('../asms/checkpoints');

exports.list = function(req, res, next) {
    var maxResults = req.query.maxResults? req.query.maxResults : 10;
    var pageToken = req.query.pageToken? req.query.pageToken : 1;
    var totalItems = 0;

    flow.exec(
        function() {
            var collection = db.collection('checkpoints');
            totalItems = collection.count(function(err, count) {
                totalItems = count;
            });

            collection.find().sort({'timestamp': -1}).
                              skip((pageToken - 1) * maxResults).
                              limit(maxResults).
                              toArray(this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            resp = {
                'totalItems': totalItems,
                'items': result
            };

            if (totalItems > pageToken * maxResults ) {
                resp.nextPageToken = ++pageToken;
            }

            res.json(200, resp);
        }
    );
};

exports.create = function(req, res, next) {
    flow.exec(
        function() {
            var collection = db.collection('checkpoints');
            collection.insert({
                'lat': req.body.lat,
                'lon': req.body.lon,
                'address': req.body.address,
                'timestamp': moment().utc().format()}, this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            res.json(200, {'checkpoint': result[0]});

            asms.publish(result[0]);
        }
    );
};