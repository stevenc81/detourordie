var flow = require('flow'),
    FB = require('fb');

exports.exchangeFBToken = function(req, res, next) {
    flow.exec(
        function() {
            console.log('# Connecting to FB using app secret: ' +
                process.env['FB_SECRET']);
            FB.api('oauth/access_token', {
                'client_id': '247255068642322',
                'client_secret': process.env['FB_SECRET'],
                'grant_type': 'fb_exchange_token',
                'fb_exchange_token': req.body.access_token
            }, this);
        },
        function(token) {
            if(!token || token.error) {
                console.log(!token ? 'error occurred' : token.error);
                res.json(500, token.error);
            }

            req.body.access_token = token.access_token;
            req.body.expires = token.expires ? token.expires : 0;

            next();
        }
    );
};

exports.create = function(req, res, next) {
    flow.exec(
        function() {
            FB.setAccessToken(req.body.access_token);
            FB.api('me/', this);
        },
        function(user) {
            if(!user || user.error) {
                console.log(!user ? 'error occurred' : user.error);
                res.json(500, user.error);
            }
            var profilePicURL = 'https://graph.facebook.com/' + user.id +
            '/picture?type=large&width=600&height=600';

            db.collection('users').insert({
                '_id': user.id,
                'name': user.name,
                'ProfilePicURL': profilePicURL
            }, this);
        },
        function(err, user) {
            if (err) {
                res.json(500, err);
            }

            res.json(200, {'user': user[0]});
        }
    );
};