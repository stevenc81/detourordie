var flow = require('flow');

exports.list = function(req, res, next) {
    flow.exec(
        function() {
            var collection = mongo.collection('checkpoints');
            collection.find().toArray(this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            var maxResults = req.query.maxResults? req.query.maxResults : 10;
            var pageToken = req.query.pageToken? req.query.pageToken : 1;

            resp = {
                'totalItems': result.length,
                'items': result.slice(
                    (pageToken - 1) * maxResults,
                    pageToken * maxResults)
            };

            if (pageToken * maxResults <  result.length) {
                resp.nextPageToken =  pageToken++;
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
            var collection = mongo.collection('checkpoints');
            collection.insert({'lat': lat, 'lon': lon}, this);
        },
        function(err, result) {
            if (err) {
                res.json(500, err);
            }

            res.json(200, {'checkopint': result[0]});
        }
    );
};