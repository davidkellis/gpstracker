function sendLocationUpdates(deviceId) {
  var recursiveSendLocationUpdates = () => {
    sendLocationUpdate(deviceId).then((checkinResponse) => {
      setTimeout(recursiveSendLocationUpdates, 10000);
    });
  }
  recursiveSendLocationUpdates();
}

function sendLocationUpdate(deviceId) {
  return getLocation().then((coords) => {
    if (coords) {
      var [lat, long] = coords;
      return checkin(deviceId, lat, long);
    } else {
      return null;
    }
  });
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

function checkin(deviceId, lat, long) {
  console.log("checkin", deviceId, lat, long);
  // since this app is served from {trackerProjectRootPath}/trackme,
  // we can make a request to checkin/{deviceId}/{lat}/{long} to request {trackerProjectRootPath}/checkin/...
  return new Promise((resolve, reject) => {
    jQuery.get("checkin/" + deviceId + "/" + lat + "/" + long).then(resolve, reject);
  });
}

function main() {
  jQuery.noConflict();

  var deviceId = window.deviceId;

  sendLocationUpdates(deviceId);
}
