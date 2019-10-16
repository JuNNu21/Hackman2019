const path = require("path");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user-model');
// the process.env values are set in .env
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/redirect',
    scope: ['profile','email']
  }, function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  })
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

module.exports = function(app){
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // on clicking "logoff" the cookie is cleared
  app.get('/logoff',
    function(req, res) {
      req.logout();      
      res.clearCookie('email', {path:'/'});
      res.clearCookie('userid', {path:'/'});
      res.redirect('/');
    }
  );

  app.get('/auth/google', passport.authenticate('google'));

  app.get('/auth/google/redirect', 
    passport.authenticate('google', 
      { successRedirect: '/setcookie', failureRedirect: '/' }
    )
  );

  const cookieOptions = {
   // domain:'.glitch.me',
    maxAge: 900000,
  }
  
  // on successful auth, a cookie is set before redirecting
  // to the success view
  app.get('/setcookie', requireUser, checkUserInDB,
    function(req, res) {
      // if(true||req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
      if(true){
        //console.log(req.user);
        res.cookie('email', req.user.emails[0].value,cookieOptions);
        res.redirect('/register');
      } else {
         res.redirect('/');
      }
    }
  );

  // if cookie exists, success. otherwise, user is redirected to index
  app.get('/success', requireLogin,
    function(req, res) {
    res.redirect('/home');
    }
  );

  function requireLogin (req, res, next) {
    if (!req.cookies['email']) {
      res.redirect('/');
    } else {
      next();
    }
  };

  function requireUser (req, res, next) {
    if (!req.user) {
      res.redirect('/');
    } else {
      next();
    }
  };
  
  function checkUserInDB (req, res, next) {
    const userprofile = {
      email: req.user.emails[0].value,
      displayName: req.user.displayName
    }
    console.log(userprofile);
    User.findOne({email: userprofile.email}).then((currentUser) => {
        if(currentUser){
            // already have this user
            // console.log('user is: ', currentUser);
            console.log(currentUser);
            res.cookie('userid', currentUser.id, cookieOptions);
            next();
        }else {
          // if not, create user in our db
          new User(userprofile).save().then((newUser) => {
              // console.log('created new user: ', newUser);
              res.cookie('userid', newUser.id, cookieOptions);
              next();
          });
        }
    }).catch(err=>{
        console.error(err);
        res.redirect('/');
    });
    
  };
}