//Install all node_modules needed:
//npm install

//Save and update the local host:
//npm run devStart

//Upload to GitHub:
//git add .
//git commit -m "Testing"
//git push

//Update Heroku:
//git push heroku master

//Website:
//http://localhost:3000

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
//const adminpassport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser')
const methOverride = require('method-override')
const app = express();
var engines = require('consolidate')

// Passport Config
require('./config/passport.js')(passport);
//require('./config/adminpassport.js')(adminpassport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.engine('.ejs', engines.ejs)
// app.use(expressLayouts);
app.set('view engine', '.ejs');

//Method Override
app.use(methOverride('_method'))

//handlebars template engine
app.engine('.hbs', engines.handlebars)
app.set('view engine', '.hbs');

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.json())

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
//app.use(adminpassport.initialize());
//app.use(adminpassport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/all_users', require('./routes/all_users.js'));

// Routes for products
const productsRoute = require('./routes/products.js')
const searchRoute = require('./routes/search.js');
const exportRoute = require('./routes/export.js');
app.use('/products', productsRoute)
app.use('/search', searchRoute)
app.use('/export', exportRoute)

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
