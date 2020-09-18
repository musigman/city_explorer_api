'use strict';

// Load Environment Variables from the .env file
// Application Dependencies
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
app.use(cors());
const PORT = process.env.PORT || 3001;
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
  // .catch(error => console.error(error));
  
  
  // route definitions
  // Route Handler Functions
  // let locations = [];
  
  app.get('/some-path', (request, response) => {
    response.json({ message: 'Hello from json land' });
  });
  app.get(`/weather`, handleWeather);
  app.get(`/trails`, trailHandler);
  app.get(`/location`, handleLocation);
  app.get('*', notFoundHandler);

function handleLocation(request, response) {
    const city = request.query.city;

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


          const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
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
              console.log('data.body[0]', data.body[0]);
              const place = new Location(city, data.body[0]);
              console.log('place', place);
              // save information in the database
              // then send it to the user
              const sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

              const safeValues = [city, place.formatted_query, place.latitude, place.longitude];

              client.query(sql, safeValues)
                  response.status(200).send(place);

                })
            
        }
      })

      // constructor function for set of aggregated data

      // const locationData = data.body[0];
      // const cityData = new city(city, locationData);
      // response.send(cityData);
    }
    
    //     .catch( (error) => {
      //     response.status(500).send('Sorry, Aliens ate my brain');
      //   ;
      // }
      
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
    
    
    
    
    app.get('/', (request, response) => {
  console.log('response body:', response.body);
  console.log('request method', request.method);
  response.send('Hello Funky Chicken!');
});




function Trail(object) {
  this.name = object.name;
  this.length = object.length;
  this.stars = object.starVotes;
  this.summary = object.summary;
  this.trail_url = object.url;
  the.conditions = object.conditionDetails;
  this.condition_date =object.conditionDate.slice(0, 10);
  this.condition_time = object.conditionDate.slice(11, 19);
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

function trailHandler(request, response) {
  try {
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    let key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
    superagent.get(url)
      .then(results => {
        let trailData = results.body.trails;
        response.send(trailData.map(value => new Trail(value)));
      })

  }
  catch (error) {
    console.log('Error', error);
    response.status(500).send('Zoinks Batman, He got away.');
  }
}
function notFoundHandler(req, res) {
  throw new Error("Whoopsie");
}

// app.listen (PORT, ()=> {
//   console.log(`server is running on port ${PORT}`);

// })