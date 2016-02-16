var assert = require('assert');
var http = require('http');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:/test');

var schemas = require('../models/schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;

var User = require('../models/User');
var Ride = require('../models/Ride');
var Review = require('../models/Review');


describe('Ride', function() {
  var user1;
  var user2;
  var user3;
  var the_ride;
  var date = new Date("December 12, 2015 11:00:00");

  beforeEach(function(done) {
    userModel.remove({}, function() {
      rideModel.remove({}, function() {
        reviewModel.remove({}, function() {
          userModel.create({
            kerberos: 'user1@mit.edu',
            password: 'password1',
            rating: 5,
            reviews: [],
            rides: []
          }, function(err, returned_user1) {
            userModel.create({
              kerberos: 'user2@mit.edu',
              password: 'password2',
              rating: 5,
              reviews: [],
              rides: []
            }, function(err, returned_user2) {
              userModel.create({
                kerberos: 'user3@mit.edu',
                password: 'password3',
                rating: 5,
                reviews: [],
                rides: []
              }, function(err, returned_user3) {
                user1 = returned_user1;
                user2 = returned_user2;
                user3 = returned_user3;
                Ride.addRide(user1._id, 'MIT', 'Logan Airport', date, 2, 'Uber',
                             function(err, ride) {
                  the_ride = ride;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#getAllRides', function() {
    it('should return all the rides', function(done) {
      Ride.getAllRides(function(err, rides) {
        assert.equal(rides.length, 1);
        assert.deepEqual(rides[0]._id, the_ride._id);
        done();
      });
    });
  });

  describe('#getAllOpenRides', function() {
    it('should return the 1 open ride', function(done) {
      Ride.getAllOpenRides(function(err, rides) {
        assert.equal(rides.length, 1);
        assert.deepEqual(rides[0]._id, the_ride._id);
        done();
      });
      it('should get 0 rides', function(done) {
        Ride.addRider(the_ride._id, user2._id, function(err, result){
          Ride.getAllOpenRides(function(err, rides) {
            assert.equal(rides.length, 0);
            done();
          });
        });
      });
    });
  });

  describe('#inRide', function() {
    it('should return 0', function(done) {
      Ride.inRide(user1._id, the_ride._id, function(err, result) {
        assert.equal(result, 0);
        done();
      });
    });
    it('should return -1', function(done) {
      Ride.inRide(user2._id, the_ride._id, function(err, result) {
        assert.equal(result, -1);
        done();
      });
    });
  });

  describe('#findRidesByOrigin', function() {
    it('should return the 1 ride', function(done) {
      Ride.findRidesByOrigin('MIT', function(err, rides) {
        assert.deepEqual(rides[0]._id, the_ride._id);
        done();
      });
    });
  });

  describe('#findRidesByDestination', function() {
    it('should find the 1 ride',  function(done) {
      Ride.findRidesByDestination('Logan Airport', function(err, rides) {
        assert.deepEqual(rides[0]._id, the_ride._id);
        done();
      });
    });
  });

  describe('#findRidesByDate', function() {
    it('should find the 1 ride', function(done) {
      var search_date = new Date("December 12, 2015");
      Ride.findRidesByDate(date, function(err, rides) {
        assert.deepEqual(rides[0]._id, the_ride._id);
        done();
      });
    });
  });

  describe('#getRide', function() {
    it('should return the one ride', function(done) {
      Ride.getRide(the_ride._id, function(err, ride) {
        assert.deepEqual(ride._id, the_ride._id);
        done();
      });
    });
  });

  describe('#addRide', function() {
    it('should add the ride to the db', function(done) {
      rideModel.find({ '_id': the_ride._id }, function(err, rides) {
        assert.equal(rides.length, 1);
        assert.deepEqual(rides[0]._id, the_ride._id);
        assert.deepEqual(rides[0].destination, the_ride.destination);
        done();
      })
    })
  })

  describe('#getRiders', function() {
    it('should return user1', function(done) {
      Ride.getRiders(the_ride._id, function(err, riders) {
        assert.equal(riders.length, 1);
        assert.deepEqual(riders[0]._id, user1._id);
        done();
      });
    });
  });

  describe('#addRider', function() {
    it('should add user2 to the ride', function(done) {
      Ride.addRider(the_ride._id, user2._id, function(err, result){
        Ride.getRide(the_ride._id, function(err, ride) {
          assert.equal(ride.riders.length, 2);
          assert.deepEqual(ride.riders[1], user2._id);
          done();
        });
      });
    });
  });

  describe('#getOtherRiders', function() {
    it('should get no riders', function(done) {
      Ride.getOtherRiders(the_ride._id, user1._id, function(err, riders, rider_reviews) {
        assert.equal(riders.length, 0);
        done();
      });
    });

    it('should get user2', function(done) {
      Ride.addRider(the_ride._id, user2._id, function(err, result){
        Ride.getOtherRiders(the_ride._id, user1._id, function(err, riders, rider_reviews) {
          assert.equal(riders.length, 1);
          assert.deepEqual(riders[0]._id, user2._id);
          done();
        });
      });
    });
  });

  describe('#removeRider', function() {
    it('should remove user1 and delete the ride', function(done) {
      Ride.removeRider(the_ride._id, user1._id, function(err, result) {
        Ride.getRide(the_ride._id, function(err, result) {
          assert.equal(err.msg, 'Invalid ride.');
          done();
        });
      });
    });
  });

  describe('#deleteRide', function() {
    it('should remove the ride', function(done) {
      Ride.deleteRide(the_ride._id, function(err,result) {
        Ride.getRide(the_ride._id, function(err, result) {
          assert.equal(err.msg, 'Invalid ride.');
          done();
        });
      });
    });
  });
});
