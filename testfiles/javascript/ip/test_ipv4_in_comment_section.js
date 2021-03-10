const controller = {}
module.exports = controller

const mongoose = require('mongoose')
const Handlebars = require('handlebars')
mongoose.Promise = global.Promise

mongoose.connect('mongodb://db/test', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const Code = require('../model/code')
const User = require('../model/user')

if (User.collection.countDocuments() === 0) {
  const admin = new User({ userID: 'admin' })
  admin.setPassword('admin')
  admin.save()
}

/**
 * Render index page.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.index = async (req, res) => {
  res.render('index', { userID: req.session.userID })
}

/**
 * Render 192.168.0.1 login page.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.getLogin = (req, res) => {
  res.render('loginForm', { userID: req.session.userID })
}

/**
 * Handles login from a user posting to /login.
 * Matches username/password with database.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.tryLogin = async (req, res) => {
  const userID = req.body.userID
  const password = req.body.password

  const userExists = await User.findOne({ userID: userID }).exec()

  if (userExists && userExists.validPassword(password)) {
    req.session.userID = userID
    res.redirect('../crud/read')
  } else {
    res.render('loginForm', { error: 'the username or password is incorrect.' })
  }
}

/**
 * Render signup page.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.getSignup = (req, res) => {
  res.render('signup', [])
}

/**
 * Handles a post request to /signup.
 * Checks if the posted username already exists in the database.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.saveSignup = async (req, res) => {
  const userID = req.body.userID
  const password = req.body.password

  const userExists = await User.findOne({ userID: userID }).exec()
  if (userExists) {
    res.render('signup', { error: 'Username already exists!' })
  } else {
    const newUser = new User({ userID: Handlebars.Utils.escapeExpression(userID) })
    newUser.setPassword(password)
    await newUser.save()
    req.session.userID = userID
    res.redirect('../crud')
  }
}

/**
 * Render read page.
 * Handles both with and without a specified /:codename by rendering read.hbs with the selectedCodeName.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.read = async (req, res) => {
  const result = await Code.find()
  let selectedCodeName = ''
  for (const r of result) {
    if (r.codeName === req.params.codeName) {
      selectedCodeName = r.codeName
    }

    r.code = Handlebars.Utils.escapeExpression(r.code)
  }

  let data = JSON.stringify(result, null, 2)
  data = new Handlebars.SafeString(data)
  res.render('read', { codeObjects: data, userID: req.session.userID, selectedCodeName: selectedCodeName })
}

/**
 * Render create page.
 * 403 Access forbidden if not logged in.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.createForm = (req, res) => {
  if (req.session.userID) {
    res.render('createForm', { userID: req.session.userID })
  } else {
    res.status(403).json({ access: 'Access forbidden' })
  }
}
