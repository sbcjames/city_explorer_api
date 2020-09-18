'use strict';


// ALL MY OLD CODE, BEFORE STARTING NEW SERVER.JS(USED BEFORE 9-17-20)


//dotenv config
require('dotenv').config();

// application dependencies
const express = require('express');
const cors = require('cors');
const { response } = require('express');
const superagent = require('superagent');
const pg = require('pg');

// applicaiton setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// Initialize Postgres
const client = new pg.Client(process.env.DATABASE_URL);

// proof of life
app.get('/', (req, res) => {
  res.send('Home Page!');
});

// create API route
app.get('/trails', handleHiking);
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
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
    const city = req.query.search_query;
    let key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}&days=8`;
    superagent.get(url)
      .then(value => {
        let weatherData = value.body.data.map(entry => {
          return new Weather(entry);
        })
        res.status(200).send(weatherData);
      })
  }
  catch (error) {
    response.status(500).send('Sorry, cannot help with that!')
  }
}

//trails section
function OutDoors (trails) {
  this.name = trails.name;
  this.location = trails.location;
  this.length = trails.length;
  this.stars = trails.stars;
  this.starVotes = trails.starVotes;
  this.summary = trails.summary;
  this.trail_url = trails.url;
  this.conditions = trails.conditionDetails;
  this.condition_date = trails.conditionDate.slice(0,9);
  this.condition_time = trails.conditionDate.slice(11,19);
}

function handleHiking(req, res) {
  console.log('im here')
  try {
    const lat = req.query.latitude;
    const lon = req.query.longitude;
    console.log(lat)
    console.log(lon)
    let key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
    superagent.get(url)
      .then(hike => {
        const hikingData = hike.body.trails;
        const hikeArray = [];
        hikingData.forEach(trails => {
          hikeArray.push(new OutDoors(trails));
        })
        res.status(200).send(hikeArray);
      }).catch(err => console.log('error', err))
  }
  catch (error) {
    response.status(500).send('Sorry, having issues with that.');
  }
}

function notFoundHandler(req, res) {
  res.status(404).send('Sorry, not available.');
}

function startServer() {
  app.listen(PORT, () => {
    console.log('Server is listening on port', PORT);
  });
}

client.connect()
  .then(startServer)
  .catch(err => console.log(err))

// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`);
// });
