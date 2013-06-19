
/**
 * Module dependencies.
 */
global.conf = require('./config');
global.mongo = require('./mongoconnect');

var express = require('express')
  // , routes = require('./routes')
  // , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , checkpoints = require('./routes/checkpoints');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

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


// app.get('/', routes.index);
// app.get('/users', user.list);
app.get('/checkpoints', checkpoints.list);
app.post('/checkpoints', checkpoints.create);

app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
