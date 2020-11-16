const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

const apiKey = process.env.API_KEY || 'NC';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let subject = req.body.subject;
  //let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  let url = `http://newsapi.org/v2/everything?q=${subject}&from=2020-10-16&sortBy=publishedAt&apiKey=${apiKey}`

  console.log("URL: "+url)
  request(url, function (err, response, body) {
    console.log("Status "+response.statusCode);

    if(response.statusCode == 401){
      res.render('index', {weather: null, error: 'Invalid API token'});
    }else if(response.statusCode == 404){
      res.render('index', {weather: null, error: 'City not found'});
    } else {
      let news = JSON.parse(body)
      if(news.totalResults == undefined){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let newsText = `There are ${news.totalResults} results for this subject!`;
        res.render('index', {news: newsText, error: null});
      }
    }
  });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Example app listening on port 3000!')
})
