var config = require('./config/config');
var express = require('express');
var _ = require('lodash');

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

var checkins = {};

app.get('/track/:clientId', (req, res) => {
  // res.send('Hello World!');
  // res.redirect('/app.html');
  var clientId = req.params.clientId;
  console.log("tracking", clientId);

  res.render('app', { clientId: clientId, mapboxAccessToken: config.mapbox.accessToken });
});

app.get('/precheckin', (req, res) => {
  res.send("connect to localhost:9000");
});

app.get('/checkin/:clientId/:lat/:long', (req, res) => {
  var clientId = req.params.clientId;
  var lat = req.params.lat;
  var long = req.params.long;

  var checkinRecord = [getTimestamp(), lat, long];
  console.log("Client", clientId, "checked in with [timestamp, lat, long]", checkinRecord);

  checkins[clientId] = checkins[clientId] || [];
  checkins[clientId].push(checkinRecord);

  res.send("Client" + clientId + "checked in with [timestamp, lat, long]" + checkinRecord);
});

app.get('/checkins/:clientId/since/:timestamp', (req, res) => {
  var clientId = req.params.clientId;
  var timestamp = _.toInteger(req.params.timestamp);
  var recentCheckins = checkins[clientId] || [];
  recentCheckins = _.filter(recentCheckins, (checkin) => { return checkin[0] > timestamp; });
  res.json(recentCheckins);
});

app.listen(config.web.port, function () {
  console.log('Example app listening on port ' + config.web.port + '!');
});

function getTimestamp() {
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return _.toInteger(year + month + day + hour + min + sec);
}

// var net = require('net');
//
// var server = net.createServer(function(socket) {
// 	socket.write('Echo server\r\n');
// 	socket.pipe(socket);
// });
//
// server.listen(9000, '127.0.0.1');
