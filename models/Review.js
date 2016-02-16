// Data model which represents a review
var mongoose = require('mongoose');
var schemas = require('./schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;
var User = require('./User');

var Review = (function Review() {

  var that = Object.create(Review.prototype);

  // Checks if a review exists
  that.existsReview = function(rideId, reviewerId, revieweeId, callback) {
    reviewModel.findOne({ride: rideId, reviewer: reviewerId, reviewee: revieweeId}, function(err, review) {
      if (err) {
      	console.log('err');
        callback(err, null);
      } else {
	    callback(null, review);
      }
    });
  };

  // Returns a review given an ID
  that.getReview = function(reviewId, callback){
    reviewModel.findById(reviewId, function(err, review) {
      if (err) {
        callback(err);
      } else if (!review) {
        callback({ msg: 'Invalid review' });
      } else {
        callback(null, review);
      }
    });
  };

  // Adds a review to both the review schema and user schema
  that.addReview = function(rideId, reviewerId, revieweeId, 
                            rating, comment, callback) {
    reviewModel.find({ride: rideId, reviewer: reviewerId, reviewee: revieweeId}, function(err, review) {
      if (err) {
        callback(err, null);
      } else {
        if (review.length > 0) {
          reviewModel.findByIdAndUpdate(review[0]._id, { $set: { "rating": rating } },
                                        function(err, result) {
            if (err) {
              callback(err, null);
            } else {
              User.updateRating(revieweeId, review[0], function (err, result) {
                if (err) {
                  callback(err, null);
                } else {
                  reviewModel.findByIdAndUpdate(review[0]._id, { $set: { "comment": comment } }, 
                                                function(err) {
                    if (err) {
                      callback(err, null);
                    } else {
                      callback(null, null);
                    }
                  });
                }
              });
            }
          });
        } else {
          reviewModel.create({
            "ride": rideId,
            "reviewer": reviewerId,
            "reviewee": revieweeId,
            "rating": rating,
            "comment": comment
          }, function(err, review) {
            User.addReview(revieweeId, review, function(err, result) {
              if (err) {
                callback(err, null);
              } else {
                callback(null,null);
              }
            });
          });
        }
      }
    });
  };

  Object.freeze(that);
  return that;
})();
   
module.exports = Review;
