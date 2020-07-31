//To check whether the user is login before entering the dashboard page.
//If the user haven't login, redirect him back to login page.

module.exports = {
    ensureAdminAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource()');
      res.redirect('/users/adminlogin');
    },
    forwardAdminAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/all_users');      
    }
  
  };
  