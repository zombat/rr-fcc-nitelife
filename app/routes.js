
module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}
		
	app.get('/get-user',
	  require('connect-ensure-login').ensureLoggedIn(),
	  function(httpReq, httpRes){
		httpRes.setHeader('Content-Type', 'application/json');
		httpRes.end(JSON.stringify(httpReq.user));
	 });		  
		
	app.route('/login')
		.get(function (httpReq, httpRes) {
			if(httpReq.user){	
				httpRes.render('home', { user: httpReq.user } );
			} else {
				httpRes.render('login', { user: httpReq.user });
			}
		});
		
	app.get('/auth/facebook',
	  passport.authenticate('facebook'));
	
	app.get('/logout', function(httpReq, httpRes){
	  httpReq.logout();
	  httpRes.redirect('/');
	});
	
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
		successReturnToOrRedirect: '/',	  
		failureRedirect: '/login',
		failureFlash: true }));
	  
	app.get('/yelpSearch',
	  function(httpReq, httpRes) {
			yelp.search('term=bars&location=' + httpReq.query.location ).then(function(result){
				httpRes.writeHead(200, { 'Content-Type': 'application/json' });
				httpRes.end(JSON.stringify(result.businesses));
			});
		});    
	
	app.get('/update',
	  function(httpReq, httpRes) {
			if(httpReq.query.location && httpReq.query.user){
				mongo.connect(MONGO_URI, function(err, db) {
						db.collection('fcc-nitelife', function (err, collection) {  
							collection.findOne({ 'locationId' : httpReq.query.location }).then(function(document) {
								if(document){
									httpRes.setHeader('Content-Type', 'application/json');
									httpRes.end(JSON.stringify(document));
								} else {
									document = {'zeroResults' : true }
									httpRes.setHeader('Content-Type', 'application/json');
									httpRes.end(JSON.stringify(document));
								}
								db.close();
						  });
						});
					});
			}
			
			
				/*
				
				console.log('atlas query for: ' + httpReq.query.location);
				mongo.connect(MONGO_URI, function(err, db) {
						db.collection('fcc-nitelife', function (err, collection) {  
							collection.findOne({ 'locationId' : httpReq.query.location }).then(function(document) {
								if(document){
									httpRes.setHeader('Content-Type', 'application/json');
									httpRes.end(JSON.stringify(document));
								} else {
									document = {'zeroResults' : true }
									httpRes.setHeader('Content-Type', 'application/json');
									httpRes.end(JSON.stringify(document));
								}
								db.close();
						  });
						});
					});
					
					*/
			});
	
	
	app.get('/checkGoing',
	  function(httpReq, httpRes) {
			if(httpReq.query.location){
				console.log('atlas query for: ' + httpReq.query.location);
				mongo.connect(MONGO_URI, function(err, db) {
						db.collection('fcc-nitelife', function (err, collection) {  
							collection.findOne({ 'locationId' : httpReq.query.location }).then(function(document) {
								if(document){
									httpRes.setHeader('Content-Type', 'application/json');
									httpRes.end(JSON.stringify(document));
								} else {
									document = {'zeroResults' : true }
									httpRes.setHeader('Content-Type', 'application/json');
									httpRes.end(JSON.stringify(document));
								}
								db.close();
						  });
						});
					});
			}
		});
		
	app.get('/*', function (httpReq, httpRes) {
		session.returnTo = httpReq.url;
		if(httpReq.query.location) {
			console.log('User location : ' + httpReq.query.location);
			yelp.search('term=bars&location=' + httpReq.query.location ).then(function(result){
				httpRes.render('home', { 'user': httpReq.user, 'reqLocation' : httpReq.query.location, 'yelpResults' : result.businesses } );
			});
		} else {
			httpRes.render('home', { user: httpReq.user, reqLocation : httpReq.query.location, 'yelpResults' : null } );
		}
		
	});	
};
