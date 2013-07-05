module.exports = {
    mongo: {
        host : '127.0.0.1',
        port : 27017,
        opts : {
          safe : false
        },
        host_opts : {
          auto_reconnect : true
        },
        dbname : 'detourordie'
    },

    redis: {
        host : '127.0.0.1',
        port : 6379
    }
};