'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT;

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

app.get('/location', handleLocation);

// constructor function for set of aggregated data
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function handleLocation(request, response) {
  try {
    const geoData = require('./data/location.json');
    const city = request.query.city;
    const locationData = new Location(city, geoData);
    // const locationData = new Location(city, geoData);
    response.send(locationData);
    } catch(error) {
      response.status(500).send('this shit ain\'t working');
    }
};
//constructor function for weather
function Weather(day) {
  this.forcast = day.weather.description;
  this.time = day.valid_date;
}

function handleWeather(request, response) {
  try {
    const rawWeatherData = require('./data/weather.json');
    const weatherData = new weatherData(rawWeatherData);
    
    response.send(weatherData);
  } catch(error) {
    response.status(500).send('Shucks, it a\'int working');
  }
};

app.get('/bad-request', (request, response) => {
  throw new Error('bad request!');
});