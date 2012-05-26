
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , Instagram = require('instagram-node-lib')
  , mongoose = require('mongoose');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set("jsonp callback")
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// API Config
Instagram.set('client_id', 'a96a954d0536420cbd676bd3775b2661');
Instagram.set('client_secret', '104108fe0a9a47768a8e85388bc8eb94');
Instagram.set('callback_url', 'http://localhost:3000/callback');
Instagram.set('redirect_uri', 'http://localhost:3000/redirect');

// Mongo
mongoose.connect(process.env.MONGOLAB_URI);

console.log(process.env.MONGOLAB_URI)

// Models
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var UserModel = new Schema({
    username         : String
  , access_token     : String
  , user_id          : String
});

var User = mongoose.model('UserModel', UserModel);

// Routes

app.get('/', function(req,res,next){
  res.render('index',{title:'index'});
});

app.get('/auth', function(req,res,next){
  url = Instagram.oauth.authorization_url({
    scope: 'basic', // use a space when specifying a scope; it will be encoded into a plus
    display: 'touch'
  });
  console.log(url);
  res.redirect(url);
})

app.get('/done', function(req,res,next){
  //console.log(res);
  res.redirect('done!');
  res.end()
})

app.get('/feed/:user.jsonp', function(req,res,next){
  console.log('axx');
  User.findOne({ username: req.params.user}, function (err, doc){
    if(doc) {
      var feed = Instagram.users.recent({
        'access_token':doc.access_token,
        'user_id':doc.user_id,
        complete: function(data, pagination){
            // data is a javascript object/array/null matching that shipped Instagram
            // when available (mostly /recent), pagination is a javascript object with the pagination information
            res.json(data);
          },
        error: function(errorMessage, errorObject, caller){
            // errorMessage is the raised error message
            // errorObject is either the object that caused the issue, or the nearest neighbor
            // caller is the method in which the error occurred
            console.error(errorObject);
            console.error(errorMessage);
            res.json(errorMessage);
          }
      });
    } else if(err) {
      res.json({status:'error',message:'an error has occured, please try again later'});
      console.error(err);
    } else {
      res.json({status:'not found',message:'a user by that name was not found in the database. maybe go to /auth?'});
      console.error('An error has occured in /feed');
    }
  });
})

app.get('/redirect', function(request, response){
  Instagram.oauth.ask_for_access_token({
    request: request,
    response: response,
    redirect: 'http://localhost:3000/done', // optional
    complete: function(params, response){
      // params['access_token']
      // params['user']
      console.log(params);
      var user = new User({username:params.user.username,access_token:params.access_token,user_id:params.user.id})
      user.save();

      response.redirect('/done');
      //response.writeHead(200, {'Content-Type': 'text/plain'});
      // or some other response ended with
      response.end();
    },
    error: function(errorMessage, errorObject, caller, response){
      // errorMessage is the raised error message
      // errorObject is either the object that caused the issue, or the nearest neighbor
      // caller is the method in which the error occurred
      console.log(errorMessage);
      console.log(errorObject);
      response.writeHead(406, {'Content-Type': 'text/plain'});
      // or some other response ended with
      response.end();
    }
  });
  return null;
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});