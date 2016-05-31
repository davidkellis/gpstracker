function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve([position.coords.latitude, position.coords.longitude]);
      });
    } else {
      reject();
    }
  });
}

function main() {
  // var mapboxAccessToken = 'pk.eyJ1IjoiZGF2aWRrZWxsaXMiLCJhIjoiY2lvdWc2bG5rMDBxZXR6bTV1aXI5OHFlZiJ9.kOTlbhlqNhJxIbTKZL0HMg';

  var washingtonDCLatLong = [38.913188059745586, -77.03238901390978];

  var map = L.map('map').setView(washingtonDCLatLong, 13);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    mapId: 'mapbox.streets',
    accessToken: mapboxAccessToken
  }).addTo(map);

  var popup = L.popup();

  function onMapClick(e) {
    popup
      .setLatLng(e.latlng)
      .setContent("You clicked the map at " + e.latlng.toString())
      .openOn(map);
  };

  map.on('click', onMapClick);

  getLocation().then(
    (coords) => {
      // var [lat, long] = coords;
      // console.log("Location:", lat, long);
      // console.log([long, lat]);
      // console.log([-98.34795229999999, 29.540380000000003]);
      map.setView(coords, 15);

      var currentLocation = L.marker(coords).addTo(map);
      var futureCurrentLocation = [29.538724, -98.342788];
      var destination = L.marker([29.552538, -98.348044]).addTo(map);   // hospital
      var futureDestination = [29.55282, -98.34378];                    // move marker across the street

      var route1 = L.Routing.control({
        waypoints: [
          currentLocation.getLatLng(),
          destination.getLatLng()
        ]
      }).addTo(map);
      // route1.removeFrom(map);

      setTimeout(() => {
        currentLocation.setLatLng(futureCurrentLocation);
        destination.setLatLng(futureDestination);
        route1.setWaypoints([
          currentLocation.getLatLng(),
          destination.getLatLng()
        ]);
      }, 5000);

      // var route2 = L.Routing.control({
      //   waypoints: [
      //     anotherLocation.getLatLng(),
      //     hospital.getLatLng()
      //   ]
      // }).addTo(map);
    },
    () => {
      console.log("Unable to query for location.");
    }
  );
}
