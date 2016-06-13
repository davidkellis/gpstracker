var config = require('./config/config');
var express = require('express');
var _ = require('lodash');

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

var checkins = {};

app.get('/trackme', (req, res) => {
  var deviceId = uuid();
  console.log("trackme", deviceId);

  res.render('trackme/index', { deviceId: deviceId, mapboxAccessToken: config.mapbox.accessToken });
});

app.get('/track/:deviceId', (req, res) => {
  var deviceId = req.params.deviceId;
  console.log("tracking", deviceId);

  res.render('track/show', { deviceId: deviceId, mapboxAccessToken: config.mapbox.accessToken });
});

app.get('/checkin/:deviceId/:lat/:long', (req, res) => {
  var deviceId = req.params.deviceId;
  var lat = req.params.lat;
  var long = req.params.long;

  var checkinRecord = [getTimestamp(), lat, long];
  console.log("Device", deviceId, "checked in with [timestamp, lat, long]", checkinRecord);

  checkins[deviceId] = checkins[deviceId] || [];
  checkins[deviceId].push(checkinRecord);

  res.send("Device" + deviceId + "checked in with [timestamp, lat, long]" + checkinRecord);
});

app.get('/checkins/:deviceId/since/:timestamp', (req, res) => {
  var deviceId = req.params.deviceId;
  var timestamp = _.toInteger(req.params.timestamp);
  var recentCheckins = checkins[deviceId] || [];
  recentCheckins = _.filter(recentCheckins, (checkin) => { return checkin[0] > timestamp; });
  res.json(recentCheckins);
});

app.listen(config.web.port, function () {
  console.log('Example app listening on port ' + config.web.port + '!');
});

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

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
