(async function () {
  'use strict'
  console.log('CLI interface script')
  const controller = require('./controllers/mainController')
  const scanRequest = {
    path: 'C:\\Users\\xabba\\Desktop\\SDDT\\public\\js\\scan.js',
    saveFileName: 'CLIscan',
    mode: 'openFile',
    types: { name: true, email: true, ip: true, password: true, key: true },
    options: { comments: false }
  }
  const results = await controller.scanFilesCLI(scanRequest)
  console.log(results)
})()
