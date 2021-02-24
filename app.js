
const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
// const session = require('express-session')
const favicon = require('serve-favicon')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')

const expressApp = express()
const expressWs = require('express-ws')(expressApp) //eslint-disable-line

expressApp.ws('/', function (ws, req) {
  ws.on('message', function (msg) {
    const msgObject = JSON.parse(msg)
    mainRouter.send(msgObject)
  })
  console.log('socket', req.testing)
})

expressApp.set('view engine', 'hbs')
expressApp.engine('hbs', exphbs({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views', 'partials')
}))

expressApp.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
expressApp.use(express.static(path.join(__dirname, 'public')))

expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(cookieParser())

const mainRouter = require('./routes/router')
mainRouter.addClientsReference(expressWs.getWss().clients)

expressApp.use('/', mainRouter.router)

expressApp.use(function (req, res, next) {
  next(createError(404))
})

expressApp.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
})

expressApp.listen(PORT)
