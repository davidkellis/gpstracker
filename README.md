# gpstracker

A proof of concept GPS tracker app intended to be used in conjunction with https://github.com/davidkellis/arduinotracker.

This app is the server side location tracking app, and https://github.com/davidkellis/arduinotracker is the GPS coordinate updater app.

## Setup

1. Install node.js
  ```
  brew install node
  ```

2. Install dependencies
  ```
  npm install
  ```

3. Configure the application by setting the appropriate values in the config/config.js file.
  
  Using config/config.sample.js as a template, save a copy as config/config.js, and then replace the config.web.port with the desired server port, and replace the config.mapbox.accessToken with a mapbox.com access token that belongs to you (you need to go register for an account at mapbox.com in order to get an API access token).

4. Run server application
  ```
  node app.js
  ```

5. Configure your tracking device (i.e. the device that the target carries in order to track their GPS coordinates) to periodically make a GET request to your server at the URL: http://yourserverIP:3000/checkin/[target ID]/[LATITUDE]/[LONGITUDE]

  For example, the tracker device might publish to http://yourserverIP:3000/checkin/123/[LATITUDE]/[LONGITUDE]
  
6. Open the webapp in a web browser that supports location tracking (e.g. on your phone).

  For example, in Chrome or Firefox, navigate to http://yourserverIP:3000/track/123, to track the location of target 123.

