var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var cors = require('cors')

var routes = require('./routes/index')
var app = express()

app.enable('trust proxy')
if (app.get('env') === 'development') {
  app.use(cors({credentials: true, origin: true}))
}


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser('super-secret-password'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(require('./middleware/user'))
app.use('/', routes)
app.use('/users', require('./routes/users'))
app.use('/msgs', require('./routes/msgs'))

app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
