var express = require('express');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 9001);
    app.use(express.bodyParser());
    app.use(express.favicon());
    app.use(express.static( __dirname + '/' ));
    app.use(express.cookieParser());
    app.use(app.router);
});

// all environments
app.set('title', 'dod webapp');

// development only
if ('development' == app.get('env')) {
// app.set('db uri', 'localhost/dev');
    app.use(express.errorHandler());
}

// production only
if ('production' == app.get('env')) {
// app.set('db uri', 'n.n.n.n/prod');
}

app.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
