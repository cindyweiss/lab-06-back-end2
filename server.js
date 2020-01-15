'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3001;

//the police
app.use(cors());


//routes:
let locations = {};

//locations

app.get('/location', (request, response) => {
  // try {
  let city = request.query.city;
  let key = process.env.LOCATION_IQ_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

  if (locations[url]) {
    response.send(locations[url]);
  } else {
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const location = new Location(city, geoData);
        response.status(200).send(location);
      })
      .catch((error) => {
        errorHandler('opps we made a boo boo', request, response);
      });
  }
})


function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}
//weather
//const dailySummeries = [];no longer need this.

app.get('/weather', (request, response) => {
  try {
    let city = request.query.city;
    const geoWeather = require('./data/darksky.json');

    response.status(200).send(geoWeather.daily.data.map(day => new DailySummery(day)));
  }
  catch (error) {
    errorHandler('opps we made a boo boo', request, response)
  }
});

function DailySummery(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}



function errorHandler(error, request, response) {
  response.status(500).send(error);
}




app.get('*', (request, response) => {
  response.status(404).send('this route does not exist');
})



//turning it on
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});

app.use(cors());
