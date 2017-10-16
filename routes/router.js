var express = require('express');

var User = require('../models/user');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var app     = express();
var router = express.Router();


var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

mailer = require("nodemailer");
var session = require('express-session');
app.use(session({secret: 'ssshhhhh'}));




//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/home');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
      
        req.session.userId = user._id;
        ////je mets le adresse mail et le username dans une sesiion
        req.session.email=user.email;
        req.session.username=user.username;

        return res.render('home.ejs',{username: user.username, email: user.email});
        
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/home', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.render('home.html');
        }
      }
    });
});
//////mailing////////////////////////////////////////////////
router.get('/mail', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.render('mail.ejs');
        }
      }
    });
});

//////searching////////////////////////////////////////////////
router.get('/search', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.render('search.ejs');
        }
      }
    });
});

//////////////recuperer les donne du formulaire///////////////////////////
app.use(bodyParser.urlencoded({ extended: true })); 

/////////////////////////////


router.post('/myaction', function (req, res) {
  var data=req.body;

  var smtpTransport = mailer.createTransport({
    service: "Gmail",
    auth: {
      user: "boudassothmane@gmail.com",
      pass: "Deadmau5."
    }
  });
  var mail = {
    from: "boudassothmane@gmail.com",
    to: req.body.email,
    subject: req.body.name,
    text: req.body.message
  }
  smtpTransport.sendMail(mail, function(error, response){
    if(error){
      return res.send("le mail n'est pas envoyer")
    }else{
      return res.render('home.ejs',{username: req.session.username, email: req.session.email});
    }
    smtpTransport.close();
  });
  }); 

///////////////////////////////////////////////////////////////////////////////////////
// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});
///////////////////////////////messaging//////////////////////////////

router.get('/chat', function(req, res){
  return res.sendFile(__dirname + '/index.html');
});




module.exports = router;