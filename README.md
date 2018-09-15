# Shmoogle Maps Scraper

Create a photo out of a map. Use Shmoogle api to paint any kind of map or landmark you wish. Simply input a start and end point, and you're all set!


Here's an [example](https://preview.ibb.co/kU2qnT/IMG_9417.jpg) of a 600 Mega Pixel output of the program.
The current state of the project has the configuration of this example photo. It's the European Alps with more than 2000 landmarks of Ski resorts.

9 TeraPixel photo? no sweat!  :) :)

How it works - 

There are 3 parts to the application

1. Run a local server with Shmoogle Maps API (static website hosted locally with Node http-server)
2. Run an application that systematically takes screen shots (Node using Puppeteer)
3. Glue all images together (Go application)


### Run a local server with Shmoogle Maps API
First ```npm install```

Obtain an API key and set it in config.json file.

In the root directory run - 


```gulp```

This will create a local server running at localhost:4200/

The sites code is in "site" directory. Feel free to modify the site however you want the picture to be.


### Run an application that systematically takes screen shots
I used puppeteer to run headless Chrome. The scraper code is in "index.js" file at the root of the project.

Set the boundaries variables (STARTING_POINT_NORTH_WEST, ENDING_POINT_SOUTH_EAST).

Run ```npm start```

This will start the scraping. You may set headless:false to see it in action. The scripting will be done as follows - 

![](https://preview.ibb.co/hoBVMo/Screen_Shot_2018_07_13_at_15_21_38.png)

The results will be placed in "results" folder.

### Glue all images together

The application for this in in "glue_images" folder. It is a Go application which puts the pieces together to one big picture.

Enjoy!
