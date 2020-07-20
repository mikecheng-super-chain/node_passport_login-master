const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');


// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if(req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
    //res.render('all_users/index')
    try {
      const newUser = await User.find(searchOptions)
      res.render('all_users/index', {
        newUsers: newUser,
        searchOptions: req.query
      })
    } catch {
      res.redirect('/')
    }
})

// New Author Route
//router.get('/new', (req, res) => {
//    res.render('all_users/new', { user: new User() })
//})

// Create Author Route
//router.post('/', async (req, res) => {
//    res.render('all_users/index')
//})

// Register Page
//router.get('/new', (req, res) => res.render('new'));
router.get('/new', forwardAuthenticated, (req, res) => {
  res.render('all_users/new')//, { newUsers: new User() })
})

// Register
//To verify the 'register' page.
router.post('/', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('all_users/new', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('all_users/new', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(async user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                //res.redirect('/all_users');

                try {
                  const newUsers = await newUser.save()
                  //res.redirect(`all_users/${newUsers.id}`)
                  res.redirect('/all_users')
                } catch {
                  res.render('all_users/new', {
                    newUser: name,
                    newUser: email,
                    newUser: password,
                    errorMessage: 'Error creating User'
                  })
                }

              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

module.exports = router