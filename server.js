'use strict';

//dotenv config
require('dotenv').config();

// application dependencies
const express = require('express');
const cors = require('cors');
const { response } = require('express');
const superagent = require('superagent');

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
// app.get('/hiking', handleHiking);
app.use('*', notFoundHandler);


// generate construction function for helper functions - location
function Location (city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

// create helper funcitons & include error messgage
function handleLocation(req, res) {
  try {
    let city = req.query.city;
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const location = new Location(city, geoData);
        res.status(200).send(location);
      })
  }
  catch(error) {
    res.status(500).send(`Sorry, I'm broke.`);
  }
}

// generate construction function for helper functions - weather
function Weather (entry) {
  this.forecast = entry.weather.description;
  this.time = entry.datetime;
}

function handleWeather(req, res) {
  try {
    const skyData = require('./data/weather.json');
    const weatherData = [];
    skyData.data.maps( entry => {
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
