'use strict';

require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const express = require('express');
const app = express();
app.use(cors());
const superagent = require('superagent');
const pg = require('pg');
const { response } = require("express");
const dataBaseUrl = process.env.DATABASE_URL;
const GEOCODE_API_KEY=process.env.GEOCODE_API_KEY;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => {
  console.err(err);
});

// Server is listening
client.connect()
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  })

  
  app.get(`/location`, handleLocation);
  app.get(`/weather`, handleWeather);
  app.get(`/trails`, trailHandler);
  app.use('*', notFoundHandler);


// Route Handler Functions
function handleLocation(request, response) {
    let city = request.query.city;
    const sql = `SELECT * FROM city_data WHERE search_query=$1;`;
    const safeValues = [city];
    console.log('city', city);
    client.query(sql, safeValues)
      .then(resultsFromSql => {
        if(resultsFromSql.rowCount){
          console.log('found the city in the database');
          const chosenCity = resultsFromSql.rows[0];
          response.status(200).send(chosenCity);
        } else {
          console.log('did not find the city');


          key: process.env.GEOCODE_API_KEY;
          const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
          const queryObject = {
          city, 
          format: 'JSON',
          limit: 1
          }
          superagent
            .get(url)
            .query(queryObject)
            .then(data => {
              console.log('data.body[0]', data.body[0]);
              const place = new Location(city, data.body[0]);
              console.log('place', place);
              // save information in the database
              // then send it to the user
              const sql = 'INSERT INTO city_data (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

              const safeValues = [city, place.formatted_query, place.latitude, place.longitude];

              client.query(sql, safeValues)
                  response.status(200).send(place);

                })
            
        }
      })

      // constructor functions
      function Location(city, geodata) {
        this.search_query = city;
        this.formatted_query = geodata.display_name;
        this.latitude = geodata.lat;
        this.longitude = geodata.lon;
      }
      
      function City(city, locationData) {
      this.search_query = city;
      this.formatted_query = locationData.display_name;
      this.latitude = locationData.lat;
      this.longitude = locationData.lon;
    }
    
    function Trail(object) {
      this.name = object.name;
      this.location = object.location;
      this.length = object.length;
      this.stars = object.stars;
      this.summary = object.summary;
      this.trail_url = object.url;
      the.conditions = object.conditionDetails;
      this.condition_date =object.conditionDate.slice(0, 10);
      this.condition_time = object.conditionDate.slice(11, 19);
    }
    
    
    //constructor function for weather
    function Weather(day) {
      this.forecast = day.weather.description;
      this.time = day.valid_date;
    }
    
    app.get('/', (request, response) => {
  console.log('response body:', response.body);
  console.log('request method', request.method);
  response.send('Hello Funky Chicken!');
});



function handleWeather(request, response) {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const formattedQuery = request.query.formatted_query;
  let key = process.env.WEATHER_API_KEY
  const url =`http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
  const sql = `SELECT * FROM weather WHERE formatted_query=$1;`;
  const safeValues = [formattedQuery];

  client.query(sql, safeValues).then((resultsFromSql) => {
    const chosenweather = resultsFromSql[0];
    // console.log(resultsFromSql)
    if (resultsFromSql.rows.length === 0){

  superagent.get(url)
    .then(data => {
      console.log(data.body.data);
      var weatherUpdate = data.body.data;
      let handleWeather = weatherUpdate.map(weather => {
      
        return new Weather(weather);
         
      })
      response.send(handleWeather);
    })  
  try {
    const rawWeatherData = require('./data/weather.json');
    const weatherArray = rawWeatherData.data;
   
    
  } catch(error) {
    response.status(500).send('Shucks, it ain\'t working');
  }
};

app.get('/bad-request', (request, response) => {
  throw new Error('bad request!');
});

function trailHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    let key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
    superagent.get(url).then((results) => {
      let trailData = results.body.trails;
      response.send(trailData.map((value) => new Trail(value)));
    });

  } catch (error) {
    console.log('Error', error);
    response.status(500).send('Zoinks Batman, He got away.');
  }
}

function notFoundHandler(request, response) {
  response.status(404).send('Sorry, Not Found');
}

//server is listening
client
  .connect()
  .then(startServer)
  .catch((e) => console.log(e));

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is ALIVE and listening on port ${PORT}`);
  });

}
