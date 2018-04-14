const puppeteer = require('puppeteer');
const fs = require('fs');


(async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.setViewport({
		width: 1280,
		height:1280
	});
	await page.goto('https://localhost:4200/');



	await page.waitFor(10000);


	const screenshot = await page.screenshot({
		//fullPage: true
		//quality: 100,
		clip: {
			x: 213,
			y: 63,
			width: 974,
			height: 717

		}
	});
	//browser.close();
	fs.writeFileSync('./results/screenshot.png', screenshot);



//await browser.close();
})();

