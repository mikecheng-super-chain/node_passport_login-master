const express = require('express');
const router = express.Router();
//To check user authentication by 'auth.js'
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
//Set the index page into the 'welcome.ejs' page.
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
//Bring 'user: req.user' into the 'dashboard.ejs' page.
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

module.exports = router;
