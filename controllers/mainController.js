const { webContents } = require('electron')
const fileService = require('fs')

const scanner = require('../utilities/scanner')
const nameFilter = require('../utilities/filters/namefilter')
const ipFilter = require('../utilities/filters/ipfilter')

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
  fileService.readFile(`resources/history/${req.params.scanID}`, 'utf8', async (err, data) => {
    if (err) {
      console.error(err)
      // render error
    } else {
      console.log(data)
      const historyFiles = await _importHistoryFileNames()
      res.render('history', { layout: 'main', menuSelected: 'history', historyFiles: JSON.stringify(historyFiles), selectedFileData: data, selectedFile: req.params.scanID })
    }
  })
}

controller.scanFiles = async (req, res) => {
  console.log('scan files')
  console.log(req.body)
  await nameFilter.initiate()
  scanner.scan(req.body, [nameFilter, ipFilter]).then(async (results) => { // LOAD FILTERS ACCORDING TO REQ.BODY
    try {
      await _trySaveResults(req.body.saveFileName, results)
      webContents.getFocusedWebContents().loadURL(`http://localhost:8080/history/${req.body.saveFileName}.json`) // manually loading redirect url into electron window
    } catch (error) {
      console.log(error)
    }
  }).catch(err => {
    console.log(err)
  })
}

controller.renderHistory = async (req, res) => {
  const historyFiles = await _importHistoryFileNames()

  res.render('history', { layout: 'main', menuSelected: 'history', historyFiles: JSON.stringify(historyFiles) })
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

async function _trySaveResults (fileName, results) {
  const saveData = {
    timestamp: Date(Date.now()).toString(),
    results: results
  }
  const newFile = fileService.openSync(`resources/history/${fileName}.json`, 'w')
  fileService.writeFileSync(newFile, JSON.stringify(saveData, null, 2))
}

async function _importHistoryFileNames () {
  const files = fileService.readdirSync('resources/history/')
  return { data: files }
}
