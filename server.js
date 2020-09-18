'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

app.use(cors());

const PORT = process.env.PORT || 3001;

const databaseUrl = process.env.DATABASE_URL;
const client = new pg.Client(databaseUrl);
client.on('error', (err) => {
  console.error(err);
});

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);

function locationHandler(req, res) {
  const city = req.query.city;

  //do we have the city in the database?
  const sql = `SELECT * FROM locations WHERE search_query=$1;`;
  const safeValues = [city];
  client.query(sql, safeValues)
    .then(resultsFromSql => {
      if(resultsFromSql.rowCount){
        const chosenCity = resultsFromSql.rows[0];
        console.log('found the city in the database')
        res.status(200).send(chosenCity);
      }else {
        console.log('didnt find the city - going to API');
        // if we dont, then lets go to the API, get the info

        const url = 'https://us1.locationiq.com/v1/search.php';
        const queryObject = {
          key: process.env.GEOCODE_API_KEY,
          city,
          format: 'JSON',
          limit: 1
        }
        superagent
          .get(url)
          .query(queryObject)
          .then(data => {
            console.log(data.body);
            const place = new Location(city, data.body[0]);
            // save the information in the database
            // then send it to the user
            const sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            const safeValues = [city, place.formatted_query, place.latitude, place.longitude];
            console.log(safeValues);
            client.query(sql, safeValues);
            res.status(200).send(place);
          })
          .catch (error =>
            res.status(500).send('Unable to process request, please try again.'));
      }
    })
}

function Location(city, geodata){
  console.log('in the constructor: ', geodata)
  this.search_query = city;
  this.formatted_query = geodata.display_name;
  this.latitude = geodata.lat;
  this.longitude = geodata.lon;
}

function weatherHandler(req, res) {
  const city = req.query.city;

  //do we have the city in the database?
  const sql = `SELECT * FROM locations WHERE search_query=$1;`;
  const safeValues = [city];
  client.query(sql, safeValues)
    .then (weatherFromSql => {
      if(weatherFromSql.rowcount) {
        const cityWeather = weatherFromSql.row[0];
        console.log('weather found in database')
        res.status(200).send(cityWeather);
      } else {
        console.log('weather was not found in database')
        const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
        const queryObject = {
          key: process.env.WEATHER_API_KEY,
          lat,
          lon
        }

      }
    })
}

function Weather (entry) {
  this.forecast = entry.weather.description;
  this.time_stamp = entry.datetime;
}

client.connect()
  .then(() => {
    app.listen(PORT, ()=> {
      console.log(`listening on ${PORT}`);
    })
  })
  .catch(error => console.error(error));
