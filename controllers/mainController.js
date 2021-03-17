const { webContents } = require('electron')
const fileService = require('fs')

const scanner = require('../utilities/scanner')

const controller = {}
module.exports = controller

let clients

const settings = JSON.parse(fileService.readFileSync('./resources/settings.json', 'utf8', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    return data
  }
}))

let activeProfile = JSON.parse(fileService.readFileSync(`./resources/profiles/${settings.profile}.json`, 'utf8', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    return data
  }
}))

const profiles = {
  data: []
}
fileService.readdirSync('./resources/profiles/').forEach(File => {
  profiles.data.push(File.slice(0, File.length - 5))
})

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
  console.log(scanRequest)
  scanner.scan(scanRequest, activeProfile).then(async (results) => {
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
  res.render('settings', { layout: 'main', menuSelected: 'settings', profiles: JSON.stringify(profiles), activeProfile: JSON.stringify(activeProfile) })
}

controller.changeProfile = (req, res) => {
  console.log(req.body)
  const profileID = req.body.profile

  activeProfile = JSON.parse(fileService.readFileSync(`./resources/profiles/${profileID}.json`, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      return data
    }
  }))
  webContents.getFocusedWebContents().loadURL('http://localhost:8080/settings/')
  // res.render('settings', { layout: 'main', menuSelected: 'settings', profiles: JSON.stringify(profiles), activeProfile: JSON.stringify(activeProfile) })
}

controller.updateProfile = (req, res) => {
  res.render('settings', { layout: 'main', menuSelected: 'settings', profiles: JSON.stringify(profiles), activeProfile: JSON.stringify(activeProfile) })
}

controller.createProfile = (req, res) => {
  // update profiles
  res.render('settings', { layout: 'main', menuSelected: 'settings', profiles: JSON.stringify(profiles), activeProfile: JSON.stringify(activeProfile) })
}

controller.deleteProfile = (req, res) => {
  const profiles = {
    data: []
  }
  fileService.readdirSync('./resources/profiles/').forEach(File => {
    profiles.data.push(File.slice(0, File.length - 5))
  })
  res.render('settings', { layout: 'main', menuSelected: 'settings', profiles: JSON.stringify(profiles), activeProfile: JSON.stringify(activeProfile) })
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
