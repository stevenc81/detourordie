var redis = require('redis');

exports.pub = redis.createClient(conf.redis.port, conf.redis.host),
exports.sub = redis.createClient(conf.redis.port, conf.redis.host);