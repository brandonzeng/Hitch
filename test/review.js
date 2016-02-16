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


describe('Review', function() {
  var user1;
  var user2;
  var user3;
  var the_ride;
  var the_review;

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
                Ride.addRide(user1._id, 'orig', 'dest', Date.now(), 4, 'Uber',
                             function(err, ride) {
                  the_ride = ride;
                  Review.addReview(ride._id, user1._id, user3._id, 5, 'nice',
                                   function(err) {
                    reviewModel.findOne({'comment': 'nice'}, function(err, review) {
                      the_review = review;
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('getReview', function() {
    it('should return review', function(done) {
      Review.getReview(the_review._id, function(err, review) {
        assert.deepEqual(the_review._id, review._id);
        done();
      });
    });
  });

  describe('addReview', function() {
    it('should return new review', function(done) {
      Review.addReview(the_ride._id, user2._id, user3._id, 2, 'bad',
                       function(err) {
        Review.existsReview(the_ride._id, user2._id, user3._id,
                            function(err, review) {
          assert.deepEqual(review.ride, the_ride._id);
          assert.deepEqual(review.reviewer, user2._id);
          assert.deepEqual(review.reviewee, user3._id);
          assert.equal(review.rating, 2);
          assert.equal(review.comment, 'bad');
          done();
        });
      });
    });
    it('should update average rating', function(done) {
      Review.addReview(the_ride._id, user2._id, user3._id, 2, 'bad',
                       function(err) {
        User.getUserRating(user3._id, function(err, rating) {
          assert.equal(rating, 3.5);
          done();
        });
      });
    });
    it('should set new average rating', function(done) {
      Review.addReview(the_ride._id, user2._id, user1._id, 2, 'bad',
                       function(err) {
        User.getUserRating(user1._id, function(err, rating) {
          assert.equal(rating, 2);
          done();
        });
      });
    });
  });
});
