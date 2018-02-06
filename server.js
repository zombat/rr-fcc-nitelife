require('dotenv').load();

const express = require('express'),
	passport = require('passport'),
	request = require('request'),
	FacebookStrategy = require('passport-facebook').Strategy;
	httpPort = process.env.PORT || 80,
	routes = require('./app/routes.js'),
	app = express(),
	mongo = require('mongodb').MongoClient,
	assert = require('assert'),
	MONGO_USER = process.env.MONGO_USER,
	MONGO_PASSWORD = process.env.MONGO_PASSWORD,
	MONGO_STRING = process.env.MONGO_STRING,
	MONGO_URI = 'mongodb://' + MONGO_USER + ':' + MONGO_PASSWORD + '@' + process.env.MONGO_STRING;
	FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID,
	FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET,
	SITE_URL = process.env.SITE_URL,
	Yelp = require('node-yelp-fusion'),
	yelp = new Yelp({ id: process.env.YELP_APP_ID , secret: process.env.YELP_APP_SECRET });


// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Allow access to /public
app.use('/public', express.static(process.cwd() + '/public'));

// Passport bits... May move these to a separate file to keep it clean.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: SITE_URL +'/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
	return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SECRET_SESSION , resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Set routes and start server.	
routes(app, passport, mongo, MONGO_URI, assert);	
app.listen(httpPort);
console.log('HTTP listening on port ' + httpPort);