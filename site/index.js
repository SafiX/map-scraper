Math.avg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
landmarks = landmarks.map( landMark => {
	let coords = landMark.location.coordinates[0].map( coord => ({
		lng: coord[0],
		lat: coord[1]
	}));
	landMark.centerOfArea = {
		lng: Math.avg(coords.map( coord => coord.lng )),
		lat: Math.avg(coords.map( coord => coord.lat ))
	};
	return landMark
});

function initMap() {
	initMapMarker();

	// Create a map object and specify the DOM element for display.
	window.mapObj = new google.maps.Map(document.getElementById('map'), {
		//tignes center: {lat: 45.468599, lng: 6.870467},
		center: {lat: 46.214884, lng:6.081947}, //geneva
		//center: {lat: 45.981198, lng:22.474881},
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
	//	mapTypeId: google.maps.MapTypeId.SATELLITE,
		//mapTypeId: google.maps.MapTypeId.HYBRID,
		//mapTypeId: google.maps.MapTypeId.MAP,
		fullscreenControl: false,
		mapTypeControl: false,
		panControl: false,
		rotateControl: false,
		scaleControl: false,
		zoomControl: false,
		streetViewControl: false
	});

	window.mapObj.set('styles', window.mapStyles);

	// Draw on map
	drawOnMap();

	google.maps.event.addListener(mapObj, 'tilesloaded', function(evt) {
		let tilesLoadedElm = document.getElementById('tilesLoaded');
		if (!tilesLoadedElm) {
			let elm = document.createElement('div');
			elm.id = "tilesLoaded";
			document.body.appendChild(elm);
		}
	});



	function drawOnMap() {
		window.landmarks = window.landmarks.filter( landmark => landmark.typeInteger === 3);

		let polyLinesArray = window.landmarks.map( landmark => {
			let coords = landmark.location.coordinates[0].map( coord => ({
				lng: coord[0],
				lat: coord[1]
			}));
			return new google.maps.Polyline(createPolyLine(coords));
		});


		polyLinesArray.forEach(poly => {
			poly.setMap(window.mapObj);
		});

		landmarks.forEach(site => {
			createLabel(site);
		});


		function createPolyLine(coords) {
			return {
				path: coords,
				geodesic: true,
				strokeColor: '#000000',
				strokeOpacity: 0.6,
				strokeWeight: 7
			}
		}

		function createLabel(site) {
			return new MapLabel({
				text: site.name,
				position: new google.maps.LatLng(site.centerOfArea),
				map: mapObj,
				fontSize: 19,
				align: 'center'
			});
		}

	}
}