// returns the rendered Leaflet map object
function renderMap(initialCoords, mapboxAccessToken) {
  var map = L.map('map').setView(initialCoords, 13);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    mapId: 'mapbox.streets',
    accessToken: mapboxAccessToken
  }).addTo(map);

  return map;
}

// returns the popup object
function addMapPopup(map) {
  var popup = L.popup();

  map.on('click', (e) => {
    popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(map);
  });

  return popup;
}

// returns [startMarker, endMarker, route]
// function renderDirectionsFromUserToTarget(map, userCoords, targetCoords) {
//   var startMarker = L.marker(userCoords).addTo(map);
//   var endMarker = L.marker(targetCoords).addTo(map);
//
//   var route = L.Routing.control({
//     waypoints: [
//       startMarker.getLatLng(),
//       endMarker.getLatLng()
//     ]
//   }).addTo(map);
//
//   return [startMarker, endMarker, route];
// }

function renderLiveTrackingInfo(map) {
  var startMarker = L.marker([50.5, 30.5]);
  var endMarker = L.marker([50.5, 30.5]);
  var route = L.Routing.control({
    serviceUrl: "https://router.project-osrm.org/route/v1",
    waypoints: [
      startMarker.getLatLng(),
      endMarker.getLatLng()
    ]
  });
  route.isVisible = false;

  updateTrackingInfo(map, startMarker, endMarker, route).then((triple) => {
    var [currentPollingTimestamp, currentUserCoords, currentTargetCoords] = triple;
    var recursiveUpdateTrackingInfo = () => {
      updateTrackingInfo(map, startMarker, endMarker, route, currentPollingTimestamp, currentUserCoords, currentTargetCoords).then((triple) => {
        [currentPollingTimestamp, currentUserCoords, currentTargetCoords] = triple;
        setTimeout(recursiveUpdateTrackingInfo, 15000);
      });
    }
    setTimeout(recursiveUpdateTrackingInfo, 15000);
  });
}

// params:
// map - map object
// startMarker - L.marker object
// endMarker - L.marker  object
// route - L.Routing.Control  object
// lastPollingTimestamp - optional - timestamp
// lastUserCoords - optional - [lat, long] coordinate pair
// lastTargetCoords - optional - [lat, long] coordinate pair
//
// returns:
//   Promise[ [currentPollingTimestamp, currentUserCoords, currentTargetCoords] ]
function updateTrackingInfo(map, startMarker, endMarker, route, lastPollingTimestamp, lastUserCoords, lastTargetCoords) {
  console.log("updateTrackingInfo");
  lastPollingTimestamp = lastPollingTimestamp || 20160101000000;
  var currentTimestamp = getTimestamp();

  return Promise.all([
    getClientCheckinsSince(lastPollingTimestamp),
    getLocation()
  ]).then((values) => {
    var [checkins, userCoords] = values;
    console.log("checkins=", checkins);
    console.log("userCoords=", userCoords);

    var [timestamp, lat, long] = _.last(checkins) || [null, null, null];
    var targetCoords = lat && long ? [lat, long] : lastTargetCoords;
    userCoords = userCoords || lastUserCoords;

    if (!_.isNil(targetCoords) && !_.isNil(userCoords)) {           // both userCoords and targetCoords are defined
      // zoom in as much as possible such that the user's location and the target's location are visible on the map
      map.fitBounds(L.latLngBounds([targetCoords, userCoords]));

      startMarker.setLatLng(userCoords);
      endMarker.setLatLng(targetCoords);
      route.setWaypoints([
        startMarker.getLatLng(),
        endMarker.getLatLng()
      ]);
      hideOrShowLayers(map, startMarker, endMarker, route, true, true, true);

    } else if (_.isNil(targetCoords) && !_.isNil(userCoords)) {     // only userCoords is defined
      map.setView(userCoords, 15);
      startMarker.setLatLng(userCoords);
      hideOrShowLayers(map, startMarker, endMarker, route, true, false, false);

    } else if (!_.isNil(targetCoords) && _.isNil(userCoords)) {     // only targetCoords is defined
      map.setView(targetCoords, 15);
      endMarker.setLatLng(targetCoords);
      hideOrShowLayers(map, startMarker, endMarker, route, false, true, false);

    } else if (_.isNil(targetCoords) && _.isNil(userCoords)) {      // neither userCoords nor targetCoords are defined
      hideOrShowLayers(map, startMarker, endMarker, route, false, false, false);
      console.log("No coordinates to render. Target coordinates unavailable. Tracker coordinates unavailable.");
    }

    return [currentTimestamp, userCoords, targetCoords];
  });
}

function hideOrShowLayers(map, startMarker, endMarker, route, showStartMarker, showEndMarker, showRoute) {
  // console.log("hideOrShowLayers", map.hasLayer(startMarker), map.hasLayer(endMarker), map.hasLayer(route), route.isVisible);
  if (map.hasLayer(startMarker)) {
    if (!showStartMarker) {
      startMarker.remove();
    }
  } else {
    if (showStartMarker) {
      startMarker.addTo(map);
    }
  }

  if (map.hasLayer(endMarker)) {
    if (!showEndMarker) {
      endMarker.remove();
    }
  } else {
    if (showEndMarker) {
      endMarker.addTo(map);
    }
  }

  // if (map.hasLayer(route)) {
  if (route.isVisible) {
    if (!showRoute) {
      route.remove();
      route.isVisible = false;
    }
  } else {
    if (showRoute) {
      route.addTo(map);
      route.isVisible = true;
    }
  }
}

function getLocation() {
  console.log("getLocation");
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve([position.coords.latitude, position.coords.longitude]);
      });
    } else {
      resolve(null);
    }
  });
}

function getClientCheckinsSince(timestamp) {
  console.log("getClientCheckinsSince", timestamp);
  // since this app is served from {trackerProjectRootPath}/track/{deviceId},
  // we can make a request to ../checkins/{deviceId}/since/{timestamp} to request {trackerProjectRootPath}/checkins/...
  return jQuery.getJSON("../checkins/" + window.clientId + "/since/" + timestamp);
  // .done((checkins) => {
  //   console.log("checkins for " + window.clientId);
  //   console.log(checkins);
  // });
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

function main() {
  jQuery.noConflict();

  var washingtonDCLatLong = [38.913188059745586, -77.03238901390978];

  var map = renderMap(washingtonDCLatLong, window.mapboxAccessToken);
  addMapPopup(map);

  renderLiveTrackingInfo(map);
}
