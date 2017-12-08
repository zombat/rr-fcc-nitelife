var siteURL = 'https://rr-fcc-nitelife.herokuapp.com';
var userObject = { 'id' : 'test123'};
var runningProcesses = 0;

$( document ).ready(function() {
	
	$('#nav-logout').hover(function() {
		$('#nav-text').html('Sign Out');
	}, function() {
		$('#nav-text').text('');
	});
	
	$('#nav-login').hover(function() {
		$('#nav-text').html('Sign In');
	}, function() {
		$('#nav-text').text('');
	});
	
	$('#nav-fcc-vote').hover(function() {
		$('#nav-text').html('Free Code Camp Voting App');
	}, function() {
		$('#nav-text').text('');
	});
	
	$(document).on('click','.resultButton', function() {
		$.getJSON( siteURL + '/update?location=' + $('#searchBox').val().toString() + '&user=' + userObject.id, function(data) {
			var countGoing = data.goingCount || 0;
			$('#' + this.id).html('Going <span class="badge">' + goingCount + '</span>');
		});
	});	
	
	$('#searchButton').click(function() {
		$('#resultArea').empty();
		$('body').append('<div id="loading-div" class="center-block"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>');
		$.getJSON( siteURL + '/yelpSearch?location=' + $('#searchBox').val().toString(), function(searchData) {
				console.log("Search Complete");
				searchData.forEach(function(result){
					runningProcesses++;
					$.getJSON( siteURL + '/checkGoing?location=' + result.id).done(function(data) {
						var countGoing = data.goingCount || 0;
						runningProcesses--;
						if(runningProcesses === 0) {	
							$('#loading-div').remove();
						}
						$('#resultArea').append('<div><div class="location-image pull-left img-thumbnail"><a href="' + result.url + '"><img src="' + result.image_url + '" /></a></div><div class="location-details"><div class="location-name">' + result.name + '</div><button class="btn btn-primary resultButton" id="' + result.id + '" type="button">Going <span class="badge">' + countGoing + '</span></button></div></div>');
					});
				});
			});
	});
	
	
	
	// Use localhost if detected.
	if(window.location.href.match(/127.0.0.1/) || window.location.href.match(/localhost/)){
		siteURL = 'http://127.0.0.1';
		userObject = {};
	}

	// Grab user info if available.
	$.getJSON(siteURL + '/get-user').done(function(user) {
		userObject = user
	});


	//	$('body').append('<div id="loading-div" class="center-block"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>');
		
	console.log('Document Ready');
});



