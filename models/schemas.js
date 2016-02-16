var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
  kerberos: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  rating: Number,
  reviews: [{ type: ObjectId, ref: 'reviewSchema' }],
  rides: [{ type: ObjectId, ref: 'rideSchema' }]
});

userSchema.pre('save', function (next) {
  var user = this;
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var rideSchema = new Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departure_time: { type: Date, required: true },
  total_capacity: { type: Number, required: true },
  remaining_capacity: { type: Number, required: true },
  creator: {type: ObjectId, ref: 'userSchema'},
  riders: [{ type: ObjectId, ref: 'userSchema' }],
  transport: String
});

var reviewSchema = new Schema({
  ride: { type: ObjectId, ref: 'rideSchema', required: true },
  reviewer: { type: ObjectId, ref: 'userSchema', required: true },
  reviewee: { type: ObjectId, ref: 'userSchema', required: true },
  rating: { type: Number, required: true },
  comment: String
});

module.exports = {
  userModel: mongoose.model('User', userSchema),
  rideModel: mongoose.model('Ride', rideSchema),
  reviewModel: mongoose.model('Review', reviewSchema)
};
