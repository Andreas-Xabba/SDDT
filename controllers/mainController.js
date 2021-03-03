const { webContents } = require('electron')
const fileService = require('fs')

const scanner = require('../utilities/scanner')

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
      const historyFiles = _importHistoryFileNames()
      res.render('history', { layout: 'main', menuSelected: 'history', historyFiles: JSON.stringify(historyFiles), selectedFileData: data, selectedFile: req.params.scanID })
    }
  })
}

controller.scanFiles = async (req, res) => {
  const scanRequest = req.body

  scanner.scan(scanRequest).then(async (results) => {
    try {
      await _trySaveResults(scanRequest.saveFileName, results)
      webContents.getFocusedWebContents().loadURL(`http://localhost:8080/history/${scanRequest.saveFileName}.json`) // manually loading redirect url into electron window
    } catch (error) {
      console.log(error)
    }
  }).catch(err => {
    console.log(err)
  })
  // LOAD ANOTHER URL MEANWHILE DATA IS BEING HANDLED TO AVOID "PROCESS DONT ANSWER"
}

controller.renderHistory = async (req, res) => {
  const historyFiles = _importHistoryFileNames()

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

function _importHistoryFileNames () {
  const files = fileService.readdirSync('resources/history/')
  return { data: files }
}
