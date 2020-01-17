'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const cors = require('cors');

const pg = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
//the police
app.use(cors());


//database conection setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));



//routes:
let locations = {};
//console.log(locations)

//locations

app.get('/location', (request, response) => {

  let city = request.query.city;

  let sql1 = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];


  client.query(sql1, safeValues)
    .then(results => {
      if (results.rowCount > 0) {
        response.status(200).json(results.rows[0])
      }


      // if (locations[url]) {
      //   response.send(locations[url]);
      else {
        let key = process.env.LOCATION_IQ_KEY;
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

        superagent.get(url)
          .then(data => {
            const geoData = data.body[0];
            const location = new Location(city, geoData);
            // locations[url] = location;

            let sql2 = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

            let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];

            client.query(sql2, safeValues);

            response.status(200).send(location);
          })
          .catch(error => {
            errorHandler('opps you broke it!', request, response);
          })

      }
    })
})


function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}
//weather

app.get('/weather', (request, response) => {
  try {
    let { search_query, latitude, longitude } = request.query;

    let key = process.env.DARK_SKY_API_KEY;

    const url = `https://api.darksky.net/forecast/${key}/${latitude},${longitude}`;

    superagent.get(url)
      .then(superagentResults => {
        // console.log(superagentResults)
        const weatherArray = superagentResults.body.daily.data.map(day => {
          //console.log(day)
          return new DailySummery(day);
        })
        response.status(200).send(weatherArray);
      })
  }
  catch (error) {
    errorHandler('opps we made a boo boo', request, response)
  }
});

function DailySummery(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}


const eventHandler = (request, response) => {
  //try {
  let eventKey = process.env.EVENTFUL_API_KEY;
  //console.log(request.query);
  let { search_query } = request.query

  let url = `http://api.eventful.com/json/events/search?location=${search_query}&app_key=${eventKey}`;

  //console.log(url)

  superagent.get(url)
    .then(result => {
      let parseData = JSON.parse(result.text)
      let eventFul = parseData.events.event
      // console.log('eventFul', eventFul);
      let eventList = eventFul.map(value => {
        // console.log('inside superagent map()')
        return new Event(value)
      })
      //console.log('eventList: ', eventList);
      response.status(200).send(eventList)
    }).catch((error) => console.log('this doesnt work here is why: ', error));
}
app.get('/events', eventHandler)

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

function Event(obj) {
  this.name = obj.title;
  this.event_date = obj.start_time;
  this.link = obj.url;
  this.summary = obj.description;
}




app.get('*', (request, response) => {
  response.status(404).send('this route does not exist');
})

//conect to database and start the web server

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server up on', PORT);
    });
  })
  .catch(error => {
    throw `PG Startup Error: ${error.message}`;
  });

//turning it on
//app.listen(PORT, () => { console.log(`listen on ${PORT}`); });


