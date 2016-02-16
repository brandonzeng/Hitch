// Data model which represents a user
var mongoose = require("mongoose");
var schemas = require("./schemas");
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;

var User = (function User() {

  var that = Object.create(User.prototype);

  // Returns a user given their ID
  that.getUser = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else {
        if (user) {
          callback(null, user);
        } else {
          callback({ msg: 'No such user' });
        }
      }
    });
  };

  // Returns a user's kerberos given his ID
  that.getKerberos = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else {
        if (user) {
          callback(null, user.kerberos);
        } else {
          callback({ msg: 'No such user' });
        }
      }
    });
  };

  // Creates a new user with authentication logic
  that.createUser = function (currentKerberos, inputPass, callback){
    userModel.count( { kerberos: currentKerberos }, function (err, count) {
      if (currentKerberos === "") {
        callback(err);
      } else if (count > 0) {
        callback({ taken: true });
      } else {
        userModel.create({
          "kerberos": currentKerberos,
          "password": inputPass,
          rating: 5,
          reviews: [],
          rides: []
        }, function (err, user) {
          if (err) {
            callback(err);
          } else {
            callback(null, user);
          }
        });
      }
    });
  };

  // Verify password for login
  that.verifyPassword = function (kerberos, candidatepw, callback) {
    userModel.findOne({ 'kerberos' : kerberos }, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        user.comparePassword(candidatepw, function (err, isMatch) {
          if (err) {
            callback(err);
          } else {
            if (isMatch) {
              callback(null, user);
            } else{
              callback(null, false);
            }
          }
        });
      }
    });
  };

  // Give a list of all rides that a user is/was part of
  that.getRides = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        if (user.rides.length) {
          rideModel.find({ '_id' : { $in: user.rides } },
                         function (err, rides) {
            if (err) {
              callback(err);
            } else {
              callback(null, rides);
            }
          });
        } else {
          callback(null, []);
        }
      }
    });
  };

  // Give a list of all reviews given to a user
  that.getReviews = function (userId, callback) {
    userModel.findById(userId, function (err, user){
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        reviewModel.find({ _id: { $in: user.reviews}}, function(err, reviews) {
          var userReviews = reviews.slice(0);
          var index = 0;
          (function next() {
            if (!reviews.length) {
              return callback(null, userReviews);
            }
            var review = reviews.shift();
            userModel.findById(review.reviewer, function(err, user) {
              if (err) {
                return callback(err);
              } else {
                userReviews[index].kerberos = user.kerberos;
                index += 1;
                next();
              }
            })
          })();
        });
      }
    });
  };

  // Gives the user's average rating.
  that.getUserRating = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        callback(null, user.rating);
      }
    });
  };

  // Adds a review to a user given the user ID and review
  that.addReview = function (userId, review, callback) {
    userModel.findByIdAndUpdate(userId,
                                { $addToSet: {reviews: review._id } },
                                function (err, result) {
      if (err) {
        callback(err);
      } else {
        that.updateRating(userId, review, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, null);
          }
        });
      }
    });
  }; 

  // Updates a user's average rating given the user ID and review 
  that.updateRating = function (userId, review, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        var reviews = user.reviews;
        var index = reviews.indexOf(review._id);
        var num_reviews = reviews.length;
        if (index < 0) {
          callback( { msg: 'Invalid review'} );
        } else {
          var new_rating = (user.rating * (num_reviews - 1) + review.rating) /
                           num_reviews;
          userModel.findByIdAndUpdate(userId, 
                                      { $set: {rating: new_rating} },
                                      function (err, result) {
            if (err) {
              callback(err);
            } else {
              callback(null, null);
            }
          });
        }
      }
    });
  };

  Object.freeze(that);
  return that;
})();

module.exports = User;
