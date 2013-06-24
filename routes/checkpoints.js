var flow = require('flow'),
    moment = require('moment');

exports.list = function(req, res, next) {
    flow.exec(
        function() {
            var collection = db.collection('checkpoints');
            collection.find().toArray(this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            var sorted = result.sort({'timestamp': -1});

            var maxResults = req.query.maxResults? req.query.maxResults : 10;
            var pageToken = req.query.pageToken? req.query.pageToken : 1;

            resp = {
                'totalItems': sorted.length,
                'items': sorted.slice(
                    (pageToken - 1) * maxResults,
                    pageToken * maxResults)
            };

            if (pageToken * maxResults <  sorted.length) {
                resp.nextPageToken = pageToken++;
            }

            res.json(200, resp);
        }
    );
};

exports.create = function(req, res, next) {
    flow.exec(
        function() {
            var lat = req.body.lat;
            var lon = req.body.lon;
            var collection = db.collection('checkpoints');
            collection.insert({
                'lat': lat,
                'lon': lon,
                'timestamp': moment().utc()}, this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            res.json(200, {'checkpoint': result[0]});
        }
    );
};