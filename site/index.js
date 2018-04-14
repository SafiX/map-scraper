

function initMap() {

	// Create a map object and specify the DOM element for display.
	window.mapObj = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 44.07105, lng: 7.22092},
		zoom: 14,
		mapTypeId: 'terrain',
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


	window.setTimeout(()=> {
		[
			...document.getElementsByClassName('gmnoprint'),
			...document.getElementsByClassName('gm-style-cc')
		].forEach( elm => elm.remove());

		document.querySelector("#map > div > div > div:nth-child(3)").remove();
	},2000);



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
				strokeWeight: 2
			}
		}
	}
}