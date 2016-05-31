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
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRrZWxsaXMiLCJhIjoiY2lvdWc2bG5rMDBxZXR6bTV1aXI5OHFlZiJ9.kOTlbhlqNhJxIbTKZL0HMg';
  window.map = new mapboxgl.Map({
      container: 'map',
      center: [-77.03238901390978, 38.913188059745586],
      zoom: 10,
      style: 'mapbox://styles/mapbox/streets-v9'
  });

  getLocation().then(
    (coords) => {
      var [lat, long] = coords;
      // console.log("Location:", lat, long);
      // console.log([long, lat]);
      // console.log([-98.34795229999999, 29.540380000000003]);

      map.setZoom(18);
      map.setCenter([long, lat]);
    },
    () => {
      console.log("Unable to query for location.");
    }
  );

  map.on('load', function () {
    map.addSource("markers", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [
              {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-77.03238901390978, 38.913188059745586]
                },
                "properties": {
                    "title": "Mapbox DC",
                    "marker-symbol": "monument"
                }
              },
              {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-122.414, 37.776]
                },
                "properties": {
                    "title": "Mapbox SF",
                    "marker-symbol": "harbor"
                }
              },
              {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-98.34795229999999, 29.540380000000003]
                },
                "properties": {
                    "title": "Home",
                    "marker-symbol": "monument"
                }
              }
            ]
        }
    });

    map.addLayer({
        "id": "markers",
        "type": "symbol",
        "source": "markers",
        "layout": {
            "icon-image": "{marker-symbol}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });
  });
}
