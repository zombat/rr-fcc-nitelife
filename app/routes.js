
module.exports = function (app, passport) {

	var test = true;

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}
	
/*	
	app.get('/get-user',
	  require('connect-ensure-login').ensureLoggedIn(),
	  function(httpReq, httpRes){
		httpRes.setHeader('Content-Type', 'application/json');
		httpRes.end(JSON.stringify(httpReq.user));
	 });		  
*/
	

	  
	
	// Depreciated 	
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
	
	
	
	// Depreciated
	
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
		
		
	
	
	
	
	
	mongo.connect(MONGO_URI, function(err, db) {
		db.collection('fcc-nitelife', function (err, collection) {  
			assert.equal(null, err);
			console.log('Connected to MongoDB');
			
// -------------------------------------------------------------------------  Passport routes start	
	
		app.route('/login')
			.get(function (httpReq, httpRes) {
				if(httpReq.user){	
					httpRes.render('home', { user: httpReq.user } );
				} else {
					httpRes.render('login', { user: httpReq.user });
				}
			});
	
	
	app.get('/auth/facebook', passport.authenticate('facebook'));
	
	app.get('/logout', function(httpReq, httpRes){
	  httpReq.logout();
	  httpRes.redirect( httpReq.session.returnTo || '/');
	});
	
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
		successReturnToOrRedirect: '/',	  
		failureRedirect: '/login',
		failureFlash: true }));	
			
// -------------------------------------------------------------------------  Passport routes end

		// Main route	
			app.get('/*', function (httpReq, httpRes) {
				var yelpResults;
				if(test){
							console.log(httpReq.user);
						}
				if(httpReq.query.location) {
					// Set session return, in case of user log in.
					httpReq.session.returnTo = httpReq.originalUrl || httpReq.url
					
					// Get search results from Yelp.
					yelp.search('term=bars&location=' + httpReq.query.location ).then(function(results){
					
						yelpResults = results.businesses;
						
						if(test){
							console.log(yelpResults);
						}
					
						// Build array for single DB query.
						var idArray = [];
						yelpResults.forEach(function(result){	
							result.fcc = { 'goingCount' : 0 };
							idArray.push(result.id);
						});
					
						if(test){
							console.log(idArray);
						}
					
						// Get all database entries from DB.
						var mongoResults = collection.find({ 'locationId' : { '$in' : idArray } } );		
						mongoResults.toArray(function(err,docs){
							
							if(docs.length > 0){
								var opCount = 1;
								if(test){
									console.log(docs);
								}
								// Find any matching locations and add my data to them.
								docs.forEach(function(doc){
									yelpResults.forEach(function(result){
										if(result.id == doc.locationId){
											result.fcc.goingCount = doc.goingCount;
										}
									});
									// Only render the page when complete.
									if(opCount == docs.length){
										httpRes.render('home', { user: httpReq.user, reqLocation : httpReq.query.location, 'yelpResults' : yelpResults } );
									} else {
										opCount++;
									}
															
								});
							} else {
								httpRes.render('home', { user: httpReq.user, reqLocation : httpReq.query.location, 'yelpResults' : yelpResults } );
							}
						});
					});
					
				} else {
					httpRes.render('home', { user: httpReq.user, reqLocation : httpReq.query.location, 'yelpResults' : null } );
				}
			});		
			
			
			
			
			
			
			
			
			
			
			
			
						  
		});
	});
	
	
	
	
	
	
	
	
	
	
	
};



























