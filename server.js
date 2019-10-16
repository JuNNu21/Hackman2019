// server.js
// where your node app starts
require('dotenv').load();
require("./controllers/db-controller");
const authController = require("./controllers/auth-controller");
const apiRoutes = require("./routes/api-routes");
// init project
const express = require('express');
const app = express();
const expressSession = require('express-session');

// cookies are used to save authentication
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());
app.use(expressSession({ secret:process.env.SESSION_SECRET, resave: true, saveUninitialized: true, maxAge: (90 * 24 * 3600000) }));
app.use(express.static('assets'));
app.use('/exports', express.static('exports'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Origin", "https://skillmithra-home.glitch.me");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api', apiRoutes);

authController(app);

// index route
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// register route
app.get('/register', function(req, res) {
  if(req.cookies['email']){
    console.log(req.cookies['email']);
    res.sendFile(__dirname + '/views/register.html');
  }
  else{
    res.redirect("/");
  }
});

// coc route
app.get('/coc', function(req, res) {
  res.sendFile(__dirname + '/views/coc.html');
});

// timer route
app.get('/timer', function(req, res) {
  res.sendFile(__dirname + '/views/timer.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

