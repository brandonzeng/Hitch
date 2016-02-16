var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');
var utils = require('../utils/utils');
var GoogleMapsAPI = require('googlemaps');
var config = require('../googleConfig');

var gmAPI = new GoogleMapsAPI(config);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must be a participant in that ride
  3. Requests are well-formed
*/

/* GET home page. */
router.get('/', function(req, res, next) {
  var currentUser = req.session.currentUser;
  var sortByDate = function (a, b) {
    if (a.departure_time < b.departure_time) {
      return -1;
    } else if (a.departure_time > b.departure_time) {
      return 1;
    } else {
      return 0;
    }
  }

  Ride.getAllOpenRides(function(err, rides) {
    if (err) {
      res.render('error', { 'message': 'An unknown error occured',
                            'status': 500 });
    } else {
      rides.sort(sortByDate);
      var logged_in = (currentUser) ? true : false;

      var params = {
        origin: 'New York, NY, US',
        destination: 'Los Angeles, CA, US'
      };

      gmAPI.directions(params, function(err, result) {
        res.render('index', { 'csrf': req.csrfToken(),
                              'user' : currentUser,
                              'rides' : rides,
                              'loggedIn' : logged_in });
      });
    }
  });
});

module.exports = router;
