const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('fast-csv');

const URL = 'http://localhost:4200/';
const VIEW_WIDTH = 1280;


(async () => {
	let csvStream = csv.createWriteStream({headers: true}),
		writableStream = fs.createWriteStream("files_info.csv");

	writableStream.on("finish", function(){
		console.log("DONE writing to csv!");
	});

	csvStream.pipe(writableStream);

	const browser = await puppeteer.launch({headless: true});
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



	for (let i = 1 ; i < 5 ; i ++) {
		for (let j = 1 ; j < 5 ; j ++) {
			let cropInfo = await page.evaluate(getBoundsInfo);
			let fileName = `${i}_${j}`;
			csvStream.write({
				file_name: fileName,
				NE_lat: cropInfo.bounds.NE.lat,
				NE_lng: cropInfo.bounds.NE.lng,
				SE_lat: cropInfo.bounds.NE.lat,
				SE_lng: cropInfo.bounds.NE.lng,
				center_lat: cropInfo.center.lat,
				center_lng: cropInfo.center.lng,
			});

			await takeScreenShot(fileName);
			await page.evaluate(panByPixels, {x: VIEW_WIDTH, y: 0});
			await page.waitFor('#tilesLoaded');
		}
		await page.evaluate(panByPixels, {x: -VIEW_WIDTH * 4, y: VIEW_WIDTH});
		await page.waitFor('#tilesLoaded');
	}

	csvStream.end();

	async function takeScreenShot(fileName) {
		const screenshot = await page.screenshot({
			fullPage: true
		});

		fs.writeFileSync(`./results/${fileName}.png`, screenshot);
	}


//await browser.close();
})();



function panByPixels(pixels) {
	let elm = document.getElementById('tilesLoaded');
	if (elm) {
		elm.remove();
	}
	mapObj.panBy(pixels.x, pixels.y);
}


function getBoundsInfo() {
	return {
		bounds: {
			NE: {
				lat: mapObj.getBounds().getNorthEast().lat() || null,
				lng: mapObj.getBounds().getNorthEast().lng() || null,
			},
			SE: {
				lat: mapObj.getBounds().getSouthWest().lat() || null,
				lng: mapObj.getBounds().getSouthWest().lng() || null
			}
		},
		center: {
			lat: mapObj.getCenter().lat() || null,
			lng: mapObj.getCenter().lng() || null
		}
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






