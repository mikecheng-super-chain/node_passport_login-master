//To check the user 'email' and 'password' matches what they register or not.
//To verify the 'login' page.

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load Admin User model
const AdminUser = require('../models/AdminUser');

module.exports = function(adminpassport) {
  adminpassport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      AdminUser.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  adminpassport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  adminpassport.deserializeUser(function(id, done) {
    AdminUser.findById(id, function(err, user) {
      done(err, user);
    });
  });
};