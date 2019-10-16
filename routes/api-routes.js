const router = require('express').Router();
const User = require('../models/user-model');
const Register = require('../models/register-model');

const fs = require('fs');
const xlsx = require('better-xlsx');
const path = require("path");

const Insta = require('instamojo-nodejs');
const url = require('url');

router.post('/register_team', (req, res) => {
    // console.log(req.cookies['email']);
    // console.log(req.body);
    Register.findOne({email: req.cookies['email']}).then((reg) => {
        if(reg){
            // already have this user
            // console.log('user is: ', currentUser);
            Register.updateOne({email:req.cookies['email']},req.body,{upsert:true}, function(err, data){
                if (err) return res.status(500).send({ error: err });
                Register.findOneAndUpdate( { email: req.cookies['email'] }, { $set: {registered: true} })
                .then( ( user ) => res.send("successfully updated registration: "+user) )
                .catch( ( errors ) => res.send("error occurred during registration: "+errors)  );
            });
        }else {
          // if not, create user in our db
          new Register(req.body).save().then((newReg) => {
              Register.findOneAndUpdate( { email: req.cookies['email'] }, { $set: {registered: true}},{new: true})
                .then( ( user ) => res.send("successfully updated registration: "+user) )
                .catch( ( errors ) => res.send("error occurred during registration: "+errors)  );
          });
        }
    }).catch(err=>{
        console.error(err);
        res.redirect('/register');
    });
});

router.get('/getRegistration', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Register.findOne({email: req.cookies['email']})
    .then(reg => {
      res.json(reg);
    })
    .catch(err => {
      console.error(err)
      res.json({error:err});
    })
});

//instamojo payment api
router.post('/pay', (req, res) => {
  Insta.setKeys("d4ba643ca3f99ac0d211ce801a4d66ca", "73f031f74521de87fab21b318848b823");
  
  const data = new Insta.PaymentData();
  // Insta.isSandboxMode(true);
  
  data.purpose = req.body.purpose;
  data.amount = req.body.amount;
  data.buyer_name = req.body.buyer_name;
  data.redirect_url = req.body.redirect_url;
  data.email = req.body.email;
  data.phone = req.body.phone;
  data.send_email = true;
  data.webhook = 'http://www.example.com/webhook/';
  data.send_sms = true;
  data.allow_repeated_payments = false;
  
  Insta.createPayment(data, function(error, response) {
    if (error) {
      // some error
    } else {
      // Payment redirection link at response.payment_request.longurl
      const responseData = JSON.parse(response);
      const redirectUrl = responseData.payment_request.longurl;
      console.log(redirectUrl);
      res.status(200).json(redirectUrl);
    }
  });
});

router.get( '/callback/', ( req, res ) => {
	let url_parts = url.parse( req.url, true),
		responseData = url_parts.query;
  
  console.log(responseData);

	if ( responseData.payment_id ) {
		let user_email = responseData.email;

		// Save the info that user has purchased the ticket.
		const appendData = {};
		appendData.payment_id = responseData.payment_id;
    appendData.payment_request_id = responseData.payment_request_id;
    appendData.payment = true;
    

		Register.findOneAndUpdate( { email: user_email }, { $set: appendData }, {new: true} )
			.then( ( user ) => console.log( user ) )
			.catch( ( errors ) => console.log( errors ) );

		// Redirect the user to payment complete page.
		// return res.redirect('https://hackman3.glitch.me/register' );
    return res.redirect('https://hackman.in/register' );
	}

} );



router.get('/getAllRegistration', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    Register.find({payment:true})
    .then(regs=>{
      regs=JSON.stringify(regs);
			regs=JSON.parse(regs);
      export_xlsx(res,regs);
    })
    .catch(err => console.error(err))
});

module.exports = router;

const export_xlsx = (response, registrations) => {
  let file = new xlsx.File();
  let sheet = file.addSheet('Sheet1');
  const headers=['payment_id','payment_request_id','team-name','team-size','email','team-leader-name','team-leader-email','team-leader-phone','team-leader-college','team-member-2-name','team-member-2-email','team-member-2-phone','team-member-2-college','team-member-3-name','team-member-3-email','team-member-3-phone','team-member-3-college','team-member-4-name','team-member-4-email','team-member-4-phone','team-member-4-college'];
  let header = sheet.addRow(); //headers for the columns
  for (let column of headers) {
      let heading = header.addCell();
      heading.value = column;
  }

  for (let registration of registrations) {
      let row = sheet.addRow();
      for (let item of headers) {
          let cell = row.addCell();           
          if(registration.hasOwnProperty(item)){
            cell.value = registration[item];
          }
      }
  }


  file
      .saveAs()
      .pipe(fs.createWriteStream(path.join(__dirname, '../exports/registrations.xlsx')))
      .on('finish', () => {
          console.log('Done.');
          response.redirect('/exports/registrations.xlsx');
      });

};
