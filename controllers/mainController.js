const { webContents } = require('electron')

const scanner = require('../utilities/scanner')
const nameFilter = require('../utilities/filters/namefilter')

const controller = {}
module.exports = controller

let clients

controller.renderIndex = (req, res) => {
  res.render('index', { layout: 'main', menuSelected: 'index' })
}

controller.filesPosted = (req, res) => {
  console.log(req.body)
  console.log('files posted')
}

controller.renderScan = (req, res) => {
  res.render('scan', { layout: 'main', menuSelected: 'scan' })
}

controller.renderScanResult = (req, res, next) => {
  const scanID = req.params.scanID
  console.log(scanID)

  res.render('history', { layout: 'main', menuSelected: 'history' })
}

controller.scanFiles = async (req, res) => {
  console.log('scan files')
  console.log(req.body)
  await nameFilter.initiate()
  scanner.scan(req.body, [nameFilter]).then((scanID) => {
    webContents.getFocusedWebContents().loadURL(`http://localhost:8080/history/${scanID}`) // manually loading redirect url into electron window
    // res.redirect(`/history/${scanID}`)
  }).catch(err => {
    console.log(err)
  })
}

controller.renderHistory = (req, res) => {
  res.render('history', { layout: 'main', menuSelected: 'history' })
}

controller.renderStatistics = (req, res) => {
  res.render('statistics', { layout: 'main', menuSelected: 'statistics' })
}

controller.renderSettings = (req, res) => {
  res.render('settings', { layout: 'main', menuSelected: 'settings' })
}

controller.addClientsReference = (clientsRef) => {
  clients = clientsRef
  console.log(clients)
}
