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
/*
 * CORS Support in Node.js web app written with Express
 */

// http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
app.all('/*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", 'Content-Type, X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        next();
});
// handle OPTIONS requests from the browser
app.options("*", function (req,res,next) { res.send(200); });

app.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port') + ' with mode ' + process.env.ENV_NODE);
});
