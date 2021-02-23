const scanner = require('../utilities/scanner')

const controller = {}
module.exports = controller

let clients

controller.renderIndex = (req, res) => {
  res.render('index', { layout: 'main' })
}

controller.filesPosted = (req, res) => {
  console.log(req.body)
  console.log('files posted')
}

controller.renderScan = (req, res) => {
  res.render('scan', { layout: 'main' })
}

controller.scanFiles = (req, res) => {
  console.log('scan files')
  console.log(req.body)
  scanner.scan(req.body.path)
}

controller.renderHistory = (req, res) => {
  res.render('history', { layout: 'main' })
}

controller.renderStatistics = (req, res) => {
  res.render('statistics', { layout: 'main' })
}

controller.renderSettings = (req, res) => {
  res.render('settings', { layout: 'main' })
}

controller.addClientsReference = (clientsRef) => {
  clients = clientsRef
  console.log(clients)
}
