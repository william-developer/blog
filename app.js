
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash= require('connect-flash');

var fs=require('fs');
var accessLog= fs.createWriteStream('access.log',{flags:'a'});
var errorLog= fs.createWriteStream('error.log',{flags:'a'});
var app = express();
var passport =require('passport'),
    GithubStrategy= require('passport-github').Strategy;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
//app.use(express.favicon());
app.use(express.favicon(__dirname+'/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.logger({stream:accessLog}));
app.use(express.bodyParser({keepExtensions:true,uploadDir:'./public/images'}));
app.use(express.methodOverride());
app.use(express.cookieParser());
/*
app.use(express.session({
  secret:settings.cookieSecret,
  key:settings.db,
  cookie:{maxAge:1000*60*60*24*30},
  store:new MongoStore({
    db:settings.db
  })
}));*/
app.use(express.session({
  secret:settings.cookieSecret,
  cookie:{maxAge:1000*60*60*24*30},
  url:settings.url
}));
app.use(passport.initialize());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err,req,res,next){
  var meta='['+new Date()+']'+req.url+'\n';
  errorLog.write(meta+err.stack+'\n');
  next();
});
passport.use(new GithubStrategy({
  clientID:"c100218fa34773980251",
  clientSecret:"39dbb58fb9f03a60fd03c3650040dcdb517cc86f",
  callbackURL:"http://olive-blog.herokuapp.com/login/github/callback"
},function(accessToken,refreshToken,profile,done){
  done(null,profile);
}));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
/*
app.get('/', routes.index);
app.get('/users', user.list);
*/
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
routes(app);