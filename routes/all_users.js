const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');
const { ensureAdminAuthenticated, forwardAdminAuthenticated } = require('../config/adminauth');
const adminpassport = require('passport');
const app = express();

//vvv ERROR vvv
//Can't apply both 'passport.js' and 'adminpassport.js' at the time.
//From the 'passport.js' file, it should redirect to the 'auth.js' to check the user's authentication, but it redirected to the 'adminauth.js' file instead.

require('../config/adminpassport.js')(adminpassport);
app.use(adminpassport.initialize());
app.use(adminpassport.session());

//^^^ ERROR ^^^


// All Authors Route
router.get('/', forwardAdminAuthenticated, async (req, res) => {
  let searchOptions = {}
  if(req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
    //res.render('all_users/index')
    try {
      const newUser = await User.find(searchOptions)
      res.render('all_users/index.ejs', {
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
router.get('/new', (req, res) => {
  res.render('all_users/new.ejs')//, { newUsers: new User() })
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
    res.render('all_users/new.ejs', {
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
        res.render('all_users/new.ejs', {
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
                res.redirect('/all_users');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

router.get('/:id', async (req, res) => {
  //res.send('Show User ' + req.params.id)
  res.redirect('/all_users')
})

router.get('/:id/edit', async (req, res) => {
  try {
    const newUser = await User.findById(req.params.id)
    res.render('all_users/edit.ejs', { newUser: newUser })
  } catch {
    res.redirect('/all_users')
  }
})

router.get('/:id/view', async (req, res) => {
  try {
    const newUser = await User.findById(req.params.id)
    res.render('all_users/view.ejs', { newUser: newUser })
  } catch {
    res.redirect('/all_users')
  }
})

router.put('/:id', async (req, res) => {
  let newUser
  //const { name, email, password, password2 } = req.body;
   
  //vvv ERRORS vvv
  let errors = [];

  if (!req.body.name || !req.body.email || !req.body.password || !req.body.password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (req.body.password != req.body.password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (req.body.password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
    //res.redirect('/')
  }
    newUser = await User.findById(req.params.id)
    newUser.name = req.body.name
    newUser.email = req.body.email
    newUser.password = req.body.password
    newUser.password2 = req.body.password2

  if (errors.length > 0) {
    res.render('all_users/edit.ejs', { 
      errors,
      newUser
    });
    return;
  } 

  else {
    try{
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      newUser.save();

      req.flash(
        'success_msg',
        'You are now registered and can log in'
      );
      res.redirect('/all_users');
      return;
    }catch(err){
      console.log(err);
    }
  }
  /*
  else {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('all_users/edit.ejs', {
          errors,
          newUser
        })
      } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              if (err) throw err;
              req.body.password = hash;
              
            })
            .catch(err => console.log(err));
          })
      }
    })
  }
  */

  await newUser.save()
  res.redirect(`/all_users/${newUser.id}`)


  // ^^^ ERRORS ^^^
  

  /*
  try {
    newUser = await User.findById(req.params.id)
    newUser.name = req.body.name
    newUser.email = req.body.email
    newUser.password = req.body.password
    newUser.password2 = req.body.password2

    await newUser.save()
    res.redirect(`/all_users/${newUser.id}`)
  } catch {
    if (newUser == null) {
      res.redirect('/')
    } else {
      res.render('all_users/edit.ejs', {
        newUser: newUser,
        errorMessage: 'Error updating User'
      })
    }
  }
*/

})

router.delete('/:id', async (req, res) => {
  let newUser
  try {
    newUser = await User.findById(req.params.id)
    await newUser.remove()
    res.redirect('/all_users')
  } catch {
    if (newUser == null) {
      res.redirect('/')
    } else {
      res.redirect(`/all_users/${newUser.id}`)
    }
  }
})

module.exports = router