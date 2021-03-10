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
 * Render login page.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.getLogin = (req, res) => {
  res.render('loginForm', { userID: req.session.userID }) // Andreas
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

/**
 * Handling posts to /crud/create.
 * 403 Access forbidden if not logged in.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.createSave = async (req, res) => {
  if (req.session.userID) {
    const formData = req.body
    // needs to add a check so that it does not add empty data.
    // add check if name already exists.
    const codeObject = new Code({ userID: req.session.userID, codeName: formData.codeName, code: formData.code, tags: _convertTagStringToArray(formData.codeTags) })
    await codeObject.save()
    res.redirect(`/crud/read/${formData.codeName}`)
  } else {
    return res.status(403).json({ access: 'Access forbidden' })
  }
}

/**
 * Render update page.
 * 403 Access forbidden if not logged in.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.updateForm = async (req, res) => {
  if (req.session.userID) {
    const data = await _getSafeDataByUser(req.session.userID)

    res.render('updateForm', { codeObjects: data, userID: req.session.userID })
  } else {
    return res.status(403).json({ access: 'Access forbidden' })
  }
}

/**
 * Handling posts to /crud/update.
 * 500 Internal server error if update data failed.
 * 403 Access forbidden if not logged in.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.updateSave = async (req, res) => {
  if (req.session.userID) {
    const formData = req.body
    const oldData = { userID: req.session.userID, codeName: formData.oldCodeName }
    const newData = { codeName: formData.newCodeName, code: formData.code, tags: _convertTagStringToArray(formData.codeTags) }
    await Code.findOneAndUpdate(oldData, newData).exec(async (err, doc) => {
      if (err) {
        res.status(500).json({ success: false, err })
      } else {
        const data = await _getSafeDataByUser(req.session.userID)
        res.render('updateForm', { codeObjects: data, successfulUpdate: true, userID: req.session.userID })
      }
    })
  } else {
    res.status(403).json({ access: 'Access forbidden' })
  }
}

/**
 * Render delete page.
 * 403 Access forbidden if not logged in.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.deleteForm = async (req, res) => {
  if (req.session.userID) {
    const data = await _getSafeDataByUser(req.session.userID)
    res.render('deleteForm', { codeObjects: data, successfulDelete: false, userID: req.session.userID })
  } else {
    res.status(403).json({ access: 'Access forbidden' })
  }
}

/**
 * Handling posts to /crud/delete.
 * 500 Internal server error if delete data failed.
 * 403 Access forbidden if not logged in.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.deleteSave = async (req, res) => {
  if (req.session.userID) {
    const formData = req.body
    Code.findOneAndDelete({ userID: req.session.userID, codeName: formData.codeName }).exec(async (err, doc) => {
      if (err) {
        return res.status(500).json({ success: false, err })
      } else {
        const data = await _getSafeDataByUser(req.session.userID)
        res.render('deleteForm', { codeObjects: data, successfulDelete: true, userID: req.session.userID })
      }
    })
  } else {
    return res.status(403).json({ access: 'Access forbidden' })
  }
}

/**
 * Handling posts to /logout.
 * Clears session.userID.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.logout = (req, res) => {
  req.session.userID = ''
  res.redirect('../')
}

/**
 * Handling get to /crud/.
 *
 * @param {object} req  request
 * @param {object} res  response
 * @returns {undefined} Nothing.
 */
controller.relocateToRead = (req, res) => {
  res.redirect('crud/read')
}

/**
 * Converts the tagstring returned by forms to array of tags.
 *
 * @param {string} tagString A string contraining all tags.
 * @returns {string[]} An array of tags.
 */
function _convertTagStringToArray (tagString) {
  const tags = []
  let tag = ''
  for (let i = 0; i < tagString.length; i++) {
    switch (tagString[i]) {
      case '(': {
        break
      }
      case ')': {
        tags.push(tag)
        tag = ''
        break
      }
      default: {
        tag += tagString[i]
      }
    }
  }
  return tags
}

/**
 * Imports all data related to a specified userID.
 * Escaped the code part, stringifies the data and returns it.
 *
 * @param {string} userID A specified userID.
 * @returns {string} Stringified data.
 */
async function _getSafeDataByUser (userID) {
  const userData = await Code.find({ userID: userID })

  for (const item of userData) {
    item.code = Handlebars.Utils.escapeExpression(item.code)
  }

  return new Handlebars.SafeString(JSON.stringify(userData, null, 2))
}
