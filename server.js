const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()
const dotenv = require('dotenv');
const mailjet = require ('node-mailjet')
    .connect('151c57fa7b966969d58cc0c596e5b71f', '53e0ba68365a8e76df9dac7786bf5215')
dotenv.config();

const apiKey = process.env.API_KEY || 'NC';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, icon: null, iconInfo: null,long: null, lat: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

  console.log("URL: "+url)
  request(url, function (err, response, body) {
    console.log("Status "+response.statusCode);

    if(response.statusCode === 401){
      res.render('index', {weather: null, icon: null, iconInfo: null, long: null, lat: null, error: 'Invalid API token'});
    }else if(response.statusCode === 404){
      res.render('index', {weather: null, icon: null, iconInfo: null, long: null, lat: null, error: 'City not found'});
    } else {
      let weather = JSON.parse(body)
      if(weather.main === undefined){
        res.render('index', {weather: null, icon: null, iconInfo: null, long: null, lat: null, error: 'Error, please try again'});
      } else {
        let weatherText = `It's ${weather.main.temp} degrees C° in ${weather.name}!`;

        request(url, function (err, response, body) {
          console.log("Status "+response.statusCode);
          let map = JSON.parse(body)
          let mapLong = JSON.stringify(map.coord.lon)
          let mapLat = JSON.stringify(map.coord.lat)
          console.log(JSON.stringify(weather))
          sendMail(weather);
          res.render('index', {weather: weatherText, icon: weather.weather[0].icon, iconInfo: weather.weather[0].description , long: mapLong, lat: mapLat, error: null});
        });
      }
    }
  })
})

function sendMail(weather, weatherText){
  const req = mailjet
      .post("send", {'version': 'v3.1'})
      .request({
        "Messages":[
          {
            "From": {
              "Email": "maxime.ollivier-drolshagen@next-u.fr",
              "Name": "Maxime"
            },
            "To": [
              {
                "Email": "maxime.ollivier-drolshagen@next-u.fr",
                "Name": "Maxime"
              }
            ],
            "Subject": "Your weather infos",
            "TextPart": "Your weather infos",
            "HTMLPart": "<p>"+weather.main.temp+"</p>" +
                "<p>"+ weather.weather[0].description +"</p>",
            "CustomID": "AppGettingStartedTest"
          }
        ]
      })
  req
      .then((result) => {
        console.log(result.body)
      })
      .catch((err) => {
        console.log(err.statusCode)
      })
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Example app listening on port 3000!')
})
