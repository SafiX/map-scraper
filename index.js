const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('fast-csv');

const URL = 'http://localhost:4200/';
const VIEW_WIDTH = 1280;


const STARTING_POINT_NORTH_WEST = {
	lat: 47.421746, // Y
	lng: 8.401886 // X
};

const ENDING_POINT_SOUTH_EAST = {
	lat: 47.377031, // Y
	lng: 8.541654 // X
};


(async () => {

	let resultsDir = './results';
	let resultsImageMatrixDir = './results/image_matrix';

	createDirIfNotExists(resultsDir);
	createDirIfNotExists(resultsImageMatrixDir);


	let csvStream = csv.createWriteStream({headers: true}),
		writableStream = fs.createWriteStream(`${resultsDir}/files_info.csv`);

	writableStream.on('finish', function () {
		console.log('DONE writing to csv!');
	});

	csvStream.pipe(writableStream);

	const browser = await puppeteer.launch({headless: true});
	const page = await browser.newPage();
	await page.setViewport({
		width: VIEW_WIDTH,
		height: VIEW_WIDTH
	});
	await page.goto(URL);

	// remove extra images
	await page.waitFor('.gmnoprint');
	await page.waitFor('.gm-style-cc');
	await page.waitFor('#map > div > div > div:nth-child(3)');
	await page.evaluate(removeExtraImages);

	await page.waitFor('#tilesLoaded');

	await goToStartPosition(STARTING_POINT_NORTH_WEST, page);

	let iterations = await page.evaluate(calculateIterations, STARTING_POINT_NORTH_WEST, ENDING_POINT_SOUTH_EAST);


	for (let i = 0; i < iterations.y + 1; i++) {
		for (let j = 0; j < iterations.x; j++) {
			let cropInfo = await page.evaluate(getBoundsInfo);
			let fileName = `${i}_${j}`;
			let logOjb = {
				file_name: fileName,
				NE_lat: cropInfo.bounds.NE.lat,
				NE_lng: cropInfo.bounds.NE.lng,
				SW_lat: cropInfo.bounds.SW.lat,
				SW_lng: cropInfo.bounds.SW.lng,
				center_lat: cropInfo.center.lat,
				center_lng: cropInfo.center.lng,
				length_distance_km: Math.round(cropInfo.length) / 1000
			};
			csvStream.write(logOjb);

			await takeScreenShot(fileName);
			console.log(
				`done ${fileName}, NE - ${logOjb.NE_lng} , ${logOjb.NE_lat} -> SE ${logOjb.SW_lng} , ${logOjb.SW_lat}`);
			await page.evaluate(panByPixels, {x: VIEW_WIDTH, y: 0});
			await page.waitFor('#tilesLoaded');
		}
		await page.evaluate(panByPixels, {x: -VIEW_WIDTH * iterations.x, y: VIEW_WIDTH});
		await page.waitFor('#tilesLoaded');
	}


	//for (let i = 1, y = 0 ; i === 0 ; i ++, y++) {
	//	for (let j = 1, x = 0 ; j === 0 ; j ++, x++) {
	//
	//		let cropInfo = await page.evaluate(getBoundsInfo);
	//		let fileName = `${y}_${x}`;
	//		let logOjb = {
	//			file_name: fileName,
	//			NE_lat: cropInfo.bounds.NE.lat,
	//			NE_lng: cropInfo.bounds.NE.lng,
	//			SW_lat: cropInfo.bounds.SW.lat,
	//			SW_lng: cropInfo.bounds.SW.lng,
	//			center_lat: cropInfo.center.lat,
	//			center_lng: cropInfo.center.lng,
	//			length_distance_km: Math.round(cropInfo.length) / 1000
	//		};
	//		csvStream.write(logOjb);
	//
	//		await takeScreenShot(fileName);
	//		console.log(`done ${fileName}, NE - ${logOjb.NE_lng} , ${logOjb.NE_lat} -> SE ${logOjb.SW_lng} ,
	// ${logOjb.SW_lat}`) await page.evaluate(panByPixels, {x: VIEW_WIDTH, y: 0}); await page.waitFor('#tilesLoaded');
	// let islastLng = await page.evaluate(getIslastLng, ENDING_POINT_SOUTH_EAST.lng); if (isLastLng) { j = -1; } }
	// islastPosition = await page.evaluate(getIslastPoint, ENDING_POINT_SOUTH_EAST);  await page.evaluate(panByPixels,
	// {x: -VIEW_WIDTH * 3, y: VIEW_WIDTH}); await page.waitFor('#tilesLoaded'); }

	csvStream.end();

	async function takeScreenShot(fileName) {
		const screenshot = await page.screenshot({
			fullPage: true
		});

		fs.writeFileSync(`${resultsImageMatrixDir}/${fileName}.png`, screenshot);
	}

	function createDirIfNotExists(dir) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	}


	await browser.close();
	process.exit();
})();


function calculateIterations(startNW, endSE) {
	startNW = new google.maps.LatLng(startNW);
	endSE = new google.maps.LatLng(endSE);
	let d = google.maps.geometry.spherical.computeDistanceBetween;
	let xCropDistance = d(mapObj.getBounds().getNorthEast(), new google.maps.LatLng({
		lat: mapObj.getBounds().getNorthEast().lat(),
		lng: mapObj.getBounds().getSouthWest().lng()
	}));
	let yCropDistance = d(mapObj.getBounds().getNorthEast(), new google.maps.LatLng({
		lat: mapObj.getBounds().getSouthWest().lat(),
		lng: mapObj.getBounds().getNorthEast().lng()
	}));
	let xEntirePicDistance = d(startNW, new google.maps.LatLng({
		lat: startNW.lat(),
		lng: endSE.lng()
	}));
	let yEntirePicDistance = d(startNW, new google.maps.LatLng({
		lat: endSE.lat(),
		lng: startNW.lng()
	}));
	let xIterations = xEntirePicDistance / xCropDistance;
	let yIterations = yEntirePicDistance / yCropDistance;
	let ret = {xEntirePicDistance, yEntirePicDistance, xCropDistance, yCropDistance};
	ret.x = Math.ceil(xIterations);
	ret.y = Math.ceil(yIterations);
	return ret;

}


function getIslastLng(endingPointLng) {
	let testPoint = {
		lng: endingPointLng,
		lat: mapObj.getBounds().getCenter().lat()
	};
	return mapObj.getBounds().contains(testPoint);
}

function getTestResult(endingPointLng) {
	let testPoint = {
		lng: endingPointLng,
		lat: mapObj.getBounds().getCenter().lat()
	};
	return {
		test: mapObj.getBounds().contains(testPoint),
		testPoint: testPoint
	};
}

function getIslastPoint(endingPoint) {
	return mapObj.getBounds().contains(endingPoint);
}


function panByPixels(pixels) {
	let elm = document.getElementById('tilesLoaded');
	if (elm) {
		elm.remove();
	}
	mapObj.panBy(pixels.x, pixels.y);
}

function panByCenterCoords(center) {
	let elm = document.getElementById('tilesLoaded');
	if (elm) {
		elm.remove();
	}
	mapObj.panTo(center);
}

//function panByBounds(bounds) {
//	let elm = document.getElementById('tilesLoaded');
//	if (elm) {
//		elm.remove();
//	}
//	mapObj.panToBounds(bounds);
//}


function getBoundsInfo() {
	return {
		bounds: {
			NE: {
				lat: mapObj.getBounds().getNorthEast().lat() || null,
				lng: mapObj.getBounds().getNorthEast().lng() || null
			},
			SW: {
				lat: mapObj.getBounds().getSouthWest().lat() || null,
				lng: mapObj.getBounds().getSouthWest().lng() || null
			}
		},
		center: {
			lat: mapObj.getCenter().lat() || null,
			lng: mapObj.getCenter().lng() || null
		},
		length: google.maps.geometry.spherical.computeDistanceBetween(mapObj.getBounds().getNorthEast(),
			mapObj.getBounds().getSouthWest()) * Math.sin(45)
	};
}


function removeExtraImages() {
	let elementsToRemove = [
		...document.getElementsByClassName('gmnoprint'),
		...document.getElementsByClassName('gm-style-cc')
	];
	elementsToRemove.push(document.querySelector('#map > div > div > div:nth-child(3)'));
	console.log(elementsToRemove);
	if (elementsToRemove) {
		elementsToRemove.forEach(elm => elm.remove());
	}
	return true;
}

async function goToStartPosition(STARTING_POINT_NORTH_WEST, page) {
	// get current map bounds
	let cropInfo = await page.evaluate(getBoundsInfo);

	// calculate center of starting point
	let center = {
		lat: STARTING_POINT_NORTH_WEST.lat += (cropInfo.bounds.SW.lat - cropInfo.bounds.NE.lat) / 2,
		lng: STARTING_POINT_NORTH_WEST.lng += (cropInfo.bounds.NE.lng - cropInfo.bounds.SW.lng) / 2
	};

	console.log(center);

	await page.evaluate(panByCenterCoords, center);
	await page.waitFor('#tilesLoaded');
}






