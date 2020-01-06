var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');



var app = express();
mongoose.connect('mongodb://127.0.0.1:27017/shopping', { useNewUrlParser: true, useUnifiedTopology: true })
require('./config/passport');

// view engine setup

const handlebarHelpers = expressHbs.create({
  helpers: require('./config/handlebars').helpers,
  defaultLayout: 'layout',
  extname: '.hbs'
})
app.engine('.hbs', handlebarHelpers.engine);
app.set('view engine', '.hbs');

//uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


//! Order is important!
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(validator());
app.use(session(
  {
    secret: 'mySuperSecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    cookie: {
      maxAge: 1800 * 60 * 1000
    }

  }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  // the login variable will be available in all our views from now on.
  res.locals.session = req.session; // sessions will be available too.
  next();
})


//! Order matters;
app.use('/user', userRoutes);
app.use('/', routes);
app.use('/admin', adminRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
