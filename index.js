const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('fast-csv');

const URL = 'http://localhost:4200/';
const VIEW_WIDTH = 1280;


const STARTING_POINT_NORTH_WEST = {
	lat: 47.421746,
	lng: 8.401886
};

const ENDING_POINT_SOUTH_EAST = {
	lat: 47.048451,
	lng: 9.311328
};




(async () => {

	let resultsDir = './results';
	let resultsImageMatrixDir = './results/image_matrix';

	createDirIfNotExists(resultsDir);
	createDirIfNotExists(resultsImageMatrixDir);


	let csvStream = csv.createWriteStream({headers: true}),
		writableStream = fs.createWriteStream(`${resultsDir}/files_info.csv`);

	writableStream.on("finish", function(){
		console.log("DONE writing to csv!");
	});

	csvStream.pipe(writableStream);

	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.setViewport({
		width: VIEW_WIDTH,
		height:VIEW_WIDTH
	});
	await page.goto(URL);

	// remove extra images
	await page.waitFor('.gmnoprint');
	await page.waitFor('.gm-style-cc');
	await page.waitFor('#map > div > div > div:nth-child(3)');
	await page.evaluate(removeExtraImages);

	await page.waitFor('#tilesLoaded');

	await goToStartPosition(STARTING_POINT_NORTH_WEST, page);



	for (let i = 0 ; i < 3 ; i ++) {
		for (let j = 0 ; j < 3 ; j ++) {
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
			}
			csvStream.write(logOjb);

			await takeScreenShot(fileName);
			console.log(`done ${fileName}, NE - ${logOjb.NE_lng} , ${logOjb.NE_lat} -> SE ${logOjb.SW_lng} , ${logOjb.SW_lat}`)
			await page.evaluate(panByPixels, {x: VIEW_WIDTH, y: 0});
			await page.waitFor('#tilesLoaded');
		}
		await page.evaluate(panByPixels, {x: -VIEW_WIDTH * 3, y: VIEW_WIDTH});
		await page.waitFor('#tilesLoaded');
	}

	csvStream.end();

	async function takeScreenShot(fileName) {
		const screenshot = await page.screenshot({
			fullPage: true
		});

		fs.writeFileSync(`${resultsImageMatrixDir}/${fileName}.png`, screenshot);
	}

	function createDirIfNotExists(dir) {
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
	}


	await browser.close();
	process.exit();
})();



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


function getBoundsInfo() {
	return {
		bounds: {
			NE: {
				lat: mapObj.getBounds().getNorthEast().lat() || null,
				lng: mapObj.getBounds().getNorthEast().lng() || null,
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
		length: google.maps.geometry.spherical.computeDistanceBetween (mapObj.getBounds().getNorthEast(), mapObj.getBounds().getSouthWest()) * Math.sin(45)
	}
}


function removeExtraImages() {
	let elementsToRemove = 	[
		...document.getElementsByClassName('gmnoprint'),
		...document.getElementsByClassName('gm-style-cc')
	];
	elementsToRemove.push(document.querySelector("#map > div > div > div:nth-child(3)"));
	console.log(elementsToRemove);
	if (elementsToRemove) {
		elementsToRemove.forEach( elm => elm.remove())
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






