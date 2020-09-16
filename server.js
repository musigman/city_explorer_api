'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT;

// Application Setup
app.listen(PORT, ()=> {
  console.log(`listening on port: ${PORT}`);
});

app.get('/', (request, response) => {
  console.log('response body:', response.body);
  console.log('request method', request.method);
  response.send('Hello Funky Chicken!');
});

app.get('/some-path', (request, response) => {
  response.json({ message: 'Hello from json land' });
});
// route definitions
app.get(`/location`, handleLocation);
app.get(`/weather`, handleWeather);
app.get('*', notFoundHandler);

// constructor function for set of aggregated data
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function handleLocation(request, response) {
    let city = request.query.city;
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

    superagent.get(url)
      .then(incomingLocationData => {
        let locationData = incomingLocationData.body[0];
        const cityData = new city(city, locationData);
        response.send(cityData);
      })
      .catch( (error) => {
        response.status(500).send('Sorry, Aliens ate my brain');
      });
    }

    function City(city, locationData) {
      this.search_query = city;
      this.formatted_query = locationData.display_name;
      this.latitude = locationData.lat;
      this.longitude = locationData.lon;
    }
//   try {
//     const geoData = require('./data/location.json');
//     const city = request.query.city;
//     const locationData = new Location(city, geoData);
//     // const locationData = new Location(city, geoData);
//     response.send(locationData);
//     } catch(error) {
//       response.status(500).send('this ain\'t working');
//     }
// };
//constructor function for weather
function Weather(day) {
  this.forecast = day.weather.description;
  this.time = day.valid_date;
}

function handleWeather(request, response) {
  var lat = request.query.latitude;
  var lon = request.query.longitude;
  let key = process.env.WEATHER_API_KEY
  const url =`http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
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