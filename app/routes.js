
module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	} 

	mongo.connect(MONGO_URI, function(err, db) {
		db.collection('fcc-nitelife', function (err, collection) {  
			assert.equal(null, err);
			console.log('Connected to MongoDB');
			
			app.get('/privacy', function(httpReq, httpRes){
				httpRes.render('privacy', { 'user': httpReq.user } );
			});
			
// -------------------------------------------------------------------------  Passport routes start	
	
		app.route('/login')
			.get(function (httpReq, httpRes) {
				if(httpReq.user){	
					httpRes.render('home', { user: httpReq.user } );
				} else {
					httpRes.redirect('/auth/facebook');
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

			app.get('/API',
				require('connect-ensure-login').ensureLoggedIn(),
				function (httpReq, httpRes) {
				if(httpReq.query.locationId){
					var mongoResults = collection.findOne({ 'locationId' : httpReq.query.locationId } );
					mongoResults.then(function(doc){
					if(!doc){
						console.log('no doc');
						var doc = {
							'locationId' : httpReq.query.locationId,
							'goingCount' : 1,
							'going' : [ httpReq.user.id.toString() ]
						};
						collection.insertOne( doc ).then(function(){
							httpRes.redirect('/?location=' + httpReq.query.location);
						});
					} else {
						// See if the user is going.					
						if(doc.going.indexOf(httpReq.user.id) != -1){
							console.log('already going');
							// If already going, remove.
							doc.goingCount--;
							console.log(doc.goingCount);
							doc.going.splice(doc.going.indexOf(httpReq.user.id),1);
							console.log(doc.going);
						} else {
							console.log('not already going');
							// If not going, add.
							doc.goingCount++;
							console.log(doc.goingCount);
							doc.going.push(httpReq.user.id.toString());
							console.log(doc.going);
						}
						collection.updateOne({ 'locationId' : httpReq.query.locationId }, doc ).then(function(){
							httpRes.redirect('/?location=' + httpReq.query.location);
						});
					}
						
						
						
					});
				}
				
				
			});


		// Main route	
			app.get('/*', function (httpReq, httpRes) {
				
				var yelpResults;
				if(httpReq.query.location) {
					// Set session return, in case of user log in.
					httpReq.session.returnTo = httpReq.originalUrl || httpReq.url
					
					// Get search results from Yelp.
					yelp.search('term=bars&location=' + httpReq.query.location ).then(function(results){
						yelpResults = results.businesses;
						// Build array for single DB query.
						var idArray = [];
						yelpResults.forEach(function(result){
							console.log(result);							
							result.fcc = {
								'goingCount' : 0,
								'going' : [ ]
								};
							idArray.push(result.id);
						});
						// Get all database entries from DB.
						var mongoResults = collection.find({ 'locationId' : { '$in' : idArray } } );		
						mongoResults.toArray(function(err,docs){
							
							if(docs.length > 0){
								var opCount = 1;
								// Find any matching locations and add my data to them.
								docs.forEach(function(doc){
									yelpResults.forEach(function(result){
										if(result.id == doc.locationId){
											result.fcc.goingCount = doc.goingCount;
											result.fcc.going = doc.going;
											
											if(httpReq.user){
												if(doc.going.indexOf(httpReq.user.id.toString()) != -1){
													result.fcc.imGoing = true;
												}
											}
											
																				
										}
									});
									// Only render the page when complete.
									if(opCount == docs.length){
										httpRes.render('home', { 'user': httpReq.user , 'reqLocation' : httpReq.query.location, 'yelpResults' : yelpResults } );
									} else {
										opCount++;
									}
									
								});
							} else {
								httpRes.render('home', { 'user': httpReq.user, 'reqLocation' : httpReq.query.location, 'yelpResults' : yelpResults } );
							}
						});
					});
					
				} else {
					httpRes.render('home', { 'user': httpReq.user, 'reqLocation' : httpReq.query.location, 'yelpResults' : null } );
				}
			});		
			
			
			
			
			
			
			
			
			
			
			
			
						  
		});
	});
	
	
	
	
	
	
	
	
	
	
	
};



























