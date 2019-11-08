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
const Config = require("./models/config");
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
app.set("view engine", "ejs");
authController(app);

// index route
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/closed', function(req, res) {
  res.sendFile(__dirname + '/views/closed.html');
});
// register route
app.get('/register',async function(req, res) {
  var active= await Config.findOne({_id:"5dad9bded6ab701d57cab8ad"})
  // console.log(active.toJSON().active)
  if(!active.toJSON().active){
    // res.sendFile(__dirname + '/views/closed.html');
    return res.redirect("/closed");
  }
  if(req.cookies['email']){
    console.log(req.cookies['email']);
    res.sendFile(__dirname + '/views/register.html');
  }
  else{
    res.redirect("/");
  }
});

app.get("/starttimer",(req,res)=>{
  var now= Date.now();
  Config.findOneAndUpdate({_id:"5dad9bded6ab701d57cab8ad"},{start_time:now},{new:true},(err,doc)=>{
    if(err){
      console.log("Start Timer Error:", err)
      res.send("Error")
    }else{
      res.redirect("/")
    }
  })
});
app.get("/resettimer",(req,res)=>{
  // var now= Date.now();
  Config.findOneAndUpdate({_id:"5dad9bded6ab701d57cab8ad"},{start_time:""},{new:true},(err,doc)=>{
    if(err){
      console.log("Start Timer Error:", err)
      res.send("Error")
    }else{
      res.redirect("/")
    }
  })
});
app.get("/getStartTime",(req,res)=>{
  Config.findOne({_id:"5dad9bded6ab701d57cab8ad"},{start_time:1},(err,doc)=>{
    if(err){
      console.log(err)
    }
    else{
      res.json(doc);
    }
  })
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

