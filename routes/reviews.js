var express = require('express');
var router = express.Router();
var Review = require('../models/Review');
var Ride = require('../models/Ride');
var utils = require('../utils/utils');
var validator = require('validator');

/*
  Require authentication on ALL access to /rides/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.session.currentUser) {
    res.render('error', {'message': 'Must be logged in to use this feature.', 'status': 500});
  } else {
    next();
  }
};

/*
  Require participation whenever accessing a particular ride
  This means that the client accessing the resource must be logged in
  as the user that originally created the ride. Clients who are not owners 
  of this particular resource will receive a 404.
  Why 404? We don't want to distinguish between rides that don't exist at all
  and rides that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information.
*/
var requireParticipation = function(req, res, next) {
  var ride_id = (req.body.ride_id || req.params.ride);
  Ride.inRide(req.session.currentUser._id, ride_id, function (err, result) {
    if (err || result < 0) {
      res.render('error', {'message': 'Resource not found.', 'status': 404});
    } else {
      next();
    }
  });
};
// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.get('/:ride', requireParticipation);
router.post('/:review', requireParticipation);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must be a participant in that ride
  3. Requests are well-formed
*/

// Get review page for a particular ride. Requires participation.
router.get('/:ride', function(req, res) {
  var user = req.session.currentUser;
  var ride_id = req.params.ride;
  Ride.getOtherRiders(ride_id, user._id, function(err, other_riders, other_riders_reviews) {
    res.render('reviews', { 'csrf': req.csrfToken(),
                            'user' : req.session.currentUser,
                            'ride_id' : ride_id,
                            'other_riders' : other_riders,
                            'other_riders_reviews' : other_riders_reviews});
  });
});

// Add or update review. Requires participation and ownership.
router.post('/:review', function(req, res) {
  if (req.session.currentUser._id === req.body.reviewee_id) {
    res.render('error', {'message': 'An unknown error occurred.', 'status': 500});
  } else if (!validator.toInt(req.body.rating) || validator.toInt(req.body.rating) < 1 || validator.toInt(req.body.rating) > 5) {
    res.render('error', {'message': 'Must submit rating between 1 and 5.', 'status' : 500});
  } else {
    Review.addReview(req.body.ride_id, req.session.currentUser._id, req.body.reviewee_id,
                       parseInt(req.body.rating), (validator.toString(req.body.comment)), function(err) { 
      if (err) {
        res.render('error', {'message': 'An unknown error occurred.', 'status': 500});
      } else {
        res.redirect(req.get('referer'));
      }
    });
  }
});

module.exports = router;
