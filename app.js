var config = require('./config/config');
var express = require('express');
var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', (req, res) => {
  // res.send('Hello World!');
  // res.redirect('/app.html');
  res.render('app', { mapboxAccessToken: config.mapbox.accessToken });
});

app.listen(config.web.port, function () {
  console.log('Example app listening on port ' + config.web.port + '!');
});
