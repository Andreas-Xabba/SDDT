(async function () {
  'use strict'
  const Path = require('path')
  const controller = require('./controllers/mainController')

  const scanRequest = {
    path: Path.join(__dirname, 'testfiles'),
    saveFileName: 'testscan',
    mode: 'openDirectory',
    types: { name: true, email: true, ip: true, password: true, key: true },
    options: { comments: true }
  }
  const results = await controller.scanFilesCLI(scanRequest)
  const testResults = []
  for (const result of results) {
    if (result.absolutePath.includes('test_no_sensitive_data')) {
      if (result.result.length !== 0) {
        testResults.push({
          path: result.absolutePath,
          message: 'File does not contain sensitive data but program found data'
        })
      }
    } else {
      if (result.result.length !== 1) {
        testResults.push({
          path: result.absolutePath,
          message: 'File contains sensitive data but program did not find it'
        })
      }
    }
  }

  console.log('TEST RESULTS')
  if (testResults.length === 0) {
    console.log('success.')
  } else {
    console.log('failed')
    console.log(testResults)
  }
})()
