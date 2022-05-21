const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const ejs = require('ejs');


let coordinates = [];

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {

  res.render('home', {
    cityName: coordinates[0],
    lat: coordinates[1],
    lon: coordinates[2]
  });
})



app.post('/result', (req, res) => {

  console.log(req.body);
  var units = req.body.units;
  var lat = req.body.lat;
  var lon = req.body.lon;
  const key = "cf86c771e3f3bab2092d4a21f7956df5"
  // JavaScript template literals require backticks => next to num1 (``), not straight quotation marks.
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=${units}`;

  //  IMPORTANT: how Node/js is reading URL which has written before the method!

  // nodeje.org https.get documentation .get and .on
  https.get(url, (response) => {
    console.log(response.statusCode);

    response.on("data", (data) => {
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const weatherDescription = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const iconUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      res.write("<p> The wather is currently " + weatherDescription + "<p>");
      res.write("<h1>The temperature in Jena is " + temp + " degrees Celcius.</h1>");
      res.write('<img src=' + iconUrl + '>');
      res.send();

    })

  });
});


// getting the geographical coordinates of the city to use for weather application

app.get('/cityData', (req, res) => {
  res.sendFile(__dirname + '/geofinder.html')

});

app.post('/cityData', (req, res) => {


  const cityName = capitalizeFirstLetter(req.body.cityName);
  const countryCode = req.body.countryCode;

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=1&appid=cf86c771e3f3bab2092d4a21f7956df5`

  https.get(url, (response) => {
    response.on('data', (data) => {
      cityData = JSON.parse(data);
      // console.log(cityData);
      // res.send(`<h1> the geographical coordinates of ${cityData[0].name} are : <br>Lat: ${cityData[0].lat}<br>Lon: ${cityData[0].lon} </h1>`);
      // throw new ERR_HTTP_HEADERS_SENT('set'); ==> when you wanna use res.send sendFile redirect more that once!
      coordinates.push(cityData[0].name, cityData[0].lat, cityData[0].lon);
      console.log(coordinates);
    })
    res.redirect('/');
  });
})


app.listen(3000, () => {
  console.log("Server is running on port: 3000");
})



// outside functions
function capitalizeFirstLetter(string) {

  return string.charAt(0).toUpperCase() + string.slice(1);
}



// //  We only can have one .send !
// // res.send(" Server is up and runnig");
// })
