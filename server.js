'use strict';

//dotenv config
require('dotenv').config();

// application dependencies
const express = require('express');
const cors = require('cors');
const { response } = require('express');

// applicaiton setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// proof of life
app.get('/', (req, res) => {
  res.send('Home Page!');
});

// create API route
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.use('*', notFoundHandler);

// generate construction function for helper functions - location
function Location (city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

// create helper funcitons & include error messgage
function handleLocation(req, res) {
  try {
    const geoData = require('./data/locations.json');
    const city = req.query.city;
    const locationData = new Location(city, geoData);
    res.send(locationData);
  }
  catch (error) {
    res.status(500).send(`Sorry, I'm broke.`);
  }
}

// generate construction function for helper functions - weather
function Weather (entry) {
  this.description = entry.data.description;
  this.datetime = entry.data.datetime
}

function handleWeather(req, res) {
  try {
    const skyData = require('./weather.json');
    const weatherData = [];
    skyData.data.forEach( entry => {
      weatherData.push(new Weather(entry));
    });
    res.send(weatherData);
  }
  catch (error) {
    response.status(500).send('Sorry, cannot help with that!')
  }
}




function notFoundHandler(req, res) {
  res.status(404).send('Sorry, not available.');
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
