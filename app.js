var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet');
const compression = require('compression');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api.js');

var app = express();

require('dotenv').config();

const mongoDb = process.env.DATABASE_KEY;
mongoose.connect(mongoDb, {useUnifiedTopology: true, useNewUrlParser:true})
const db=mongoose.connection;
db.on('error', console.error.bind(console,'mongo connection error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors({
  credentials: true,
  origin:true,
}));
app.use(helmet())
app.use(compression())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      errors:
        [{
          authorized:false,
          msg:'Not authorized. Please login to visit this route'
        }]
    });
  }
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
