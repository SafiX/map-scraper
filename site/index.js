

function initMap() {

	// Create a map object and specify the DOM element for display.
	window.mapObj = new google.maps.Map(document.getElementById('map'), {
		//tignes center: {lat: 45.468599, lng: 6.870467},
		center: {lat: 46.214884, lng:6.081947}, //geneva
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		//mapTypeId: google.maps.MapTypeId.SATELLITE,
		fullscreenControl: false,
		mapTypeControl: false,
		panControl: false,
		rotateControl: false,
		scaleControl: false,
		zoomControl: false,
		streetViewControl: false
	});

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

	document.addEventListener('loaded', () => console.log("load"));

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


		function createPolyLine(coords) {
			return {
				path: coords,
				geodesic: true,
				strokeColor: '#000000',
				strokeOpacity: 0.6,
				strokeWeight: 15
			}
		}
	}
}