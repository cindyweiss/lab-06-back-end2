'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3001;

//the police
app.use(cors());


//routes:


//locations

app.get('/location', (request, response) => {
  let city = request.query.city;
  const geoData = require('./data/geo.json');
  let geoDataResults = geoData[0];


  let location = new Location(city, geoDataResults);

  response.status(200).send(location);
})

function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}
//weather
const dailySummeries = [];
app.get('/weather', (request, response) => {
  let city = request.query.city;
  const geoWeather = require('./data/darksky.json');
  geoWeather.daily.data.forEach(day => {
    dailySummeries.push(new DailySummery(day));
  });
  response.status(200).send(dailySummeries);

});


function DailySummery(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  dailySummeries.push(this);
}









//turning it on
app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});

app.use(cors());


