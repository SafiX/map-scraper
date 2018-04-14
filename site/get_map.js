(function() {
	// get api key from configuration file
	window.fetch('config.json')
	      .then( res => res.json())
	      .then( configJson => configJson.googleApiKey)
	      .then(getMap);

	function getMap(mapKey) {
		let mapScript = document.createElement('script');
		mapScript.setAttribute('async', '');
		mapScript.setAttribute('defer', '');
		mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=geometry&callback=initMap`;
		document.body.append(mapScript);
	}
})()



