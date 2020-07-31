const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer')
var upload = multer()
const fs = require('fs')
const mongoose = require('mongoose')
// Load User model
const AdminUser = require('../models/AdminUser');
const Product = require('../models/Product')
const {
  ensureAuthenticated,
  forwardAuthenticated
} = require('../config/auth');
const {
  json
} = require('body-parser');


// Login Page
router.get('/adminlogin', forwardAuthenticated, (req, res) => res.render('adminlogin.ejs'));

// Register Page
router.get('/adminregister', forwardAuthenticated, (req, res) => res.render('adminregister.ejs'));

// Register
//To verify the 'register' page.
router.post('/adminregister', (req, res) => {
  const {
    name,
    email,
    password,
    password2
  } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  if (password != password2) {
    errors.push({
      msg: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'Password must be at least 6 characters'
    });
  }

  if (errors.length > 0) {
    res.render('adminregister.ejs', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    AdminUser.findOne({
      email: email
    }).then(user => {
      if (user) {
        errors.push({
          msg: 'Email already exists'
        });
        res.render('adminregister.ejs', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newAdminUser = new AdminUser({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newAdminUser.password, salt, (err, hash) => {
            if (err) throw err;
            newAdminUser.password = hash;
            newAdminUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/adminlogin');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/adminlogin', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/adminlogin',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/adminlogin');
});


//show user profile product list
router.get('/profile', ensureAuthenticated, async (req, res) => {
  try {
		if (!req.user.listOfProducts){
			console.log('no products in the user product list')
			res.redirect('/')
    }

    const productArr = []
    for (pid of req.user.listOfProducts) {
      var pt = await Product.findOne({
        '_id': pid.productId
      })
      if (!(pt instanceof Product)){
        console.log('error in user product list')
        return res.redirect('/')
      }
      pt = pt.toObject()
			// console.log(pt)
			productArr.push(pt)
    }
		
    res.render('profile.ejs', {
      titleName: 'Profile',
      listOfProducts: productArr,
      productNum: productArr.length,
    })

  } catch (error) {
    res.json({
      message: error
    })
  }
})

//remove button on the export page
router.post('/profile/remove/:pid', async (req, res) => {
  try {
    await User.updateOne({
      _id: req.user._id
    }, {
      $pull: {
        listOfProducts: {
          'productId': mongoose.Types.ObjectId(req.params.pid)
        }
      }
    }, (err, result) =>{
      if (err){
        console.log('updateOne error')
        return console.log(err)
      }
      // console.log(result)
    })
    req.user.save(function (err) {
      if (err){
        console.log('req user save error')
        return console.log(err)
      }
    })
    res.redirect('/users/profile')
  } catch (error) {
    res.json({
      message: error
    })
  }
})

//export button of the profile page
router.post('/profile', upload.none(), async (req, res) => {
    try {
        if(!req.body.id){
          return res.redirect('./profile')
        }
        const chosenProductIds = req.body.id
        const markupPercent = req.body.markup
        const exportArr = []
        
        for (var i = 0; i < chosenProductIds.length; ++i) {
            var pid = chosenProductIds[i]
            console.log(pid)    
            var pt = await Product.findById(mongoose.Types.ObjectId(pid))
            pt.price *= (1 + markupPercent[i]/100)
            console.log(pt)
            exportArr.push(pt)
        }
      
        var outputJson = JSON.stringify(exportArr)
        const file = './download/output.json'
        fs.writeFileSync(file, outputJson, (err) => {
            if (err) throw err
            console.log('saved file')
        })
        res.download(file)
    } catch (error) {
        res.json({
            message: error
        })
    }
})



module.exports = router;
