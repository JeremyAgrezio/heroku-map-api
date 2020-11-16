const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

// const apiKey = process.env.API_KEY || 'NC';
// const apiKeyMap = process.env.API_KEY || 'NC';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  let urlMap = `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json?access_token=${apiKeyMap}`

  console.log("URL: "+url)
  request(url, function (err, response, body) {
    console.log("Status "+response.statusCode);

    if(response.statusCode === 401){
      res.render('index', {weather: null, error: 'Invalid API token'});
    }else if(response.statusCode === 404){
      res.render('index', {weather: null, error: 'City not found'});
    } else {
      let weather = JSON.parse(body)
      if(weather.main === undefined){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        res.render('index', {weather: weatherText, error: null});
      }
    }
  }),
      console.log("URL_MAP: "+urlMap)
  request(url, function (err, response, body) {
    console.log("Status "+response.statusCode);
    let map = JSON.parse(body)
    console.log(JSON.stringify("LON "+map.coord.lon));
    console.log(JSON.stringify("LAT "+map.coord.lat));
    res.render('index', {long: map.coord.lon, error: null});
  });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Example app listening on port 3000!')
})
