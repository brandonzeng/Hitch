var express = require('express');
var router = express.Router();

var User = require('../models/User');
var validator = require('validator');

/*
  For both login and create user, we want to send an error code if the user
  is logged in, or if the client did not provide a username and password
  This function returns true if an error code was sent; the caller should return
  immediately in this case.
*/

var isLoggedInOrInvalidBody = function(req, res) {
  if (req.currentUser) {
    res.render('error', { 'message' : 'There is already a user logged in.',
                          'status' : 403 });
    return true;
  } else if (!(req.body.kerberos && req.body.password)) {
    res.render('error', { 'message' : 'kerberos or password not provided.',
                          'status' : 400 });
    return true;
  }
  return false;
};

/*
  View the reviews of a particular user.
*/
router.get('/user/:user', function(req, res) {
  // User.getUser(req.body.userID, function(err, user) {
  User.getUser(req.params.user, function(err, user) {
    if (err) {
      res.render('error', { 'message' : 'Resource not found.', 'status': 404});
    } else {
      User.getReviews(user._id, function(err, reviews) {
        if (err) {
          res.render('error', { 'message' : 'Resource not found.', 'status': 404});
        } else {
          if (req.session.currentUser) {
            res.render('user', { 'currentUser' : req.session.currentUser, 'user' : req.session.currentUser, 
              'reviewee' : user, 'reviews' : reviews});
          } else {
            res.render('error', { 'message' : 'Resource not found.', 'status': 404}); 
          }
        } 
      })
    }
  });
});

/*
  Go to register page
*/
router.get('/register', function(req, res) {
  if (req.session.currentUser) {
    res.redirect('/');
  } else {
    res.render('register', {'csrf': req.csrfToken()});
  }
});

// Gets list of all available rides after login
router.get('/', function(req, res, next) {
  var currentUser = req.session.currentUser;
  if (currentUser) {
    res.render('index', {'csrf': req.csrfToken(), 'user': currentUser});
  } else {
    res.redirect('/');
  }
});

/*
  Registers a new user based on kerberos and password.
*/
router.post('/', function(req, res) {
  if (isLoggedInOrInvalidBody(req, res)) {
    return;
  }
  var kerberos = validator.escape(validator.toString(req.body.kerberos.toLowerCase()));
  var password = validator.escape(validator.toString(req.body.password));
  if (!kerberos || kerberos.length < 8 || !(kerberos.slice(-8) === '@mit.edu')) {
    res.render('register', {'csrf': req.csrfToken(), 'e': 'Username must be a valid @mit.edu email.'});
  } else if (!password || password.length < 8) {
    res.render('register', {'csrf': req.csrfToken(), 'e': 'Password must be at least 8 characters long.'});
  } else {
    User.createUser(kerberos, password, 
                    function(err,user) {
      if (err) {
        console.log("error!!");
        if (err.taken) {
          res.render('register', {'csrf': req.csrfToken(), 'e' : "Kerberos already exists"});
        } else {
          res.send("error");
        }
      } else {
        req.session.currentUser = user;
        res.redirect('/');
      }
    });
  }
});

// Login page
router.get('/login', function(req, res) {
  if (req.session.currentUser) {
    res.redirect('/');
  } else {
    res.render('login', {'csrf': req.csrfToken()});
  }
});

// Allows a user to sign in
router.post('/login', function(req, res) {
  var password = validator.escape(validator.toString(req.body.password));
  var kerberos = validator.escape(validator.toString(req.body.kerberos));
  User.verifyPassword(kerberos, password, function(err, user) {
    if (user) {
      req.session.currentUser = user;
      res.redirect('/')
    } else {
      res.render('login', {'csrf': req.csrfToken(), 'e':"Incorrect Kerberos or Password"});
    }
  })
});

// Logs a user out
router.get('/logout', function(req, res) {
  req.session.currentUser = undefined;
  res.redirect('/');
});

// Get the rides of the current logged in user
router.get('/my_rides', function(req, res) {
  var currentTime = new Date();
  User.getRides(req.session.currentUser._id, function(err, rides) {
    res.render('my_rides', { 'csrf': req.csrfToken(),
                             'user' : req.session.currentUser,
                             'rides' : rides ,
                             'currentTime' : currentTime});
  });
});

module.exports = router;
