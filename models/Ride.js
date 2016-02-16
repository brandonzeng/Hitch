// Data model which represents a ride
var mongoose = require('mongoose');
var schemas = require('./schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;
var ObjectId = mongoose.Types.ObjectId;

var Ride = (function Ride() {

  var that = Object.create(Ride.prototype);

  // Returns all rides in the ride schema
  that.getAllRides = function(callback) {
    rideModel.find({}, function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // Checks if a user exists in a ride given IDs
  that.inRide = function(userId, rideId, callback) {
    rideModel.findById(rideId, function (err, ride) {
      if (err) {
        callback(err, null);
      } else if (!ride) {
        callback( {msg: 'Invalid ride'} );
      } else {
        var riders = ride.riders;
        callback(null, riders.indexOf(userId));
      }
    });
  };

  // Gets all rides with remaining capacity
  that.getAllOpenRides = function(callback) {
    var now = new Date();
    rideModel.find({})
      .where('remaining_capacity').gte(1)
      .where('departure_time').gte(now)
      .exec(function(err, rides) {
        if (err) {
          callback(err);
        } else {
          callback(null, rides);
        }
      });
  };
  
  // Returns a ride given the id
  that.getRide = function(rideId, callback) {
    rideModel.findById(rideId, function (err, ride) {
      if (err) {
        callback(err);
      } else if (!ride) {
        callback({ msg: 'Invalid ride.' });
      } else {
        callback(null, ride);
      }
    });
  };

  // Adds a ride given the user inputs
  that.addRide = function(userId, origin, destination, departure_time,
                          total_capacity, transport,
                          callback) {
    rideModel.create({
      'origin': origin,
      'destination': destination,
      'departure_time': departure_time,
      'total_capacity': total_capacity,
      'remaining_capacity': total_capacity - 1,
      'riders': [userId],
      'creator': userId,
      'transport': transport,
    }, function(err, ride) {
       if (err) {
         callback(err);
       } else {
        userModel.findByIdAndUpdate(userId,
                                    {$push: {rides: ride._id} },
                                    function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null,ride);
          };
        });
      }       
    });
  };

  // Gets the riders in a ride given the ride ID
  that.getRiders = function(rideId, callback) {
    rideModel.findById(rideId, function (err, ride) {
      if (err) {
        callback(err, null);
      } else {
        var riderIds = ride.riders;
        userModel.find({ '_id' : { $in : riderIds } }, function(err, riders) {
          callback(err, riders);
        });
      }
    });
  };

  // gets the other rides in a ride besides the user
  that.getOtherRiders = function(rideId, userId, callback) {
    that.getRiders(rideId, function(err, riders) {
      var user_id = ObjectId(userId);
      var other_riders = riders.filter(function(rider) {
        return !user_id.equals(rider._id);
      });
      var other_riders_copy = other_riders.slice(0);
      var other_riders_reviews = [];
      (function next(){
        if (!other_riders_copy.length) {
          return callback(null, other_riders, other_riders_reviews);
        }
        var other_rider = other_riders_copy.shift();
        reviewModel.find({ride: rideId, reviewer: userId, reviewee: other_rider._id}, function(err, review) {
          if (err) {
            return callback(err);
          } else {
            if (review.length > 0) {
              other_riders_reviews.push(review[0]);
            } else {
              other_riders_reviews.push(null);
            }
            next();
          }
        })
      })();
    });
  };

  // Adds a rider to a ride given their respective IDs
  that.addRider = function(rideId, riderId, callback) {
    // checks if ride is full
    rideModel.findById(rideId, function(err, ride) {
      if (!ride) {
        callback({ msg: 'Invalid ride.' });
      } else if (ride.remaining_capacity === 0) {
        callback( { msg: "ride full" } );
      } else {
        rideModel.findByIdAndUpdate(rideId, { $inc: {'remaining_capacity' : -1} }, function(err, result) {
          rideModel.findByIdAndUpdate(rideId, { $push: { riders: riderId } }, function(err, result) {
            if (err) {
              callback(err);
            } else{
              userModel.findByIdAndUpdate(riderId,
                                          { $push: {rides: rideId } },
                                          function (err, result) {
                if (err) {
                  callback(err,null);
                } else {
                  callback(null,null);
                }
              });
            }
          });
        });
      }
    });
  };

  // Removes a rider from a ride given their respective IDs
  that.removeRider = function(rideId, riderId, callback) {
    var ObjectId = mongoose.Types.ObjectId;
    rideModel.findByIdAndUpdate(rideId,
                                 { $inc: { 'remaining_capacity' : 1 } },
                                 function (err, result) {
      if (err) {
        callback(err, null);
      } else {
        rideModel.findByIdAndUpdate(rideId,
                                    { $pull: { riders: ObjectId(riderId) } },
                                    function(err, result) {
          if (err) {
            callback(err)
          } else {
            userModel.findByIdAndUpdate(riderId,
                                        { $pull: {rides: ObjectId(rideId) } },
                                        function (err, result) {
              if (err) {
                callback(err,null);
              } else {
                //delete ride if no more riders
                rideModel.findById(rideId, function (err, ride) {
                  if (ride.remaining_capacity === ride.total_capacity) {
                    that.deleteRide(rideId, function(err) {
                      if (err) {
                        callback(err, null);
                      } else {
                        callback(null, null);
                      }
                    });
                  } else {
                    if (ride.creator === riderId) {
                      rideModel.findByIdAndUpdate(rideId, { $set: {creator: undefined } },
                                                  function (err, result) {
                        if (err) {
                          callback(err, null);
                        } else {
                          callback(null, null);
                        }
                      });
                    } else {
                      callback(null, null);
                    }
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  // Deletes a ride from the ride schema
  that.deleteRide = function(rideId, callback) {
    rideModel.findByIdAndRemove(rideId, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  };

  Object.freeze(that);
  return that;
})();
 
module.exports = Ride;
