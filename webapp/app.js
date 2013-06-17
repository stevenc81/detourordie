var express = require('express');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.favicon());
    app.use(express.static( __dirname + '/' ));
    app.use(express.cookieParser());
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.listen(8089);
