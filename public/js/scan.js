
(function () {
  'use strict'
  const electron = require('electron')
  // const { createReadStream } = require('fs')
  const path = require('path')
  const dialog = electron.remote.dialog

  let selectedFile = ''
  let fileSelectMode = 'openFile'

  const selectFilesButton = document.getElementById('selectFilesButton')
  const selectedFileLabel = document.getElementById('selectedFileLabel')

  selectFilesButton.addEventListener('click', () => {
    if (process.platform !== 'darwin') {
      openFolderSelectDialog().then(file => {
        if (!file.canceled) {
          selectedFile = file.filePaths[0].toString()
          selectedFileLabel.innerHTML = selectedFile
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      openFolderSelectDialog().then(file => {
        if (!file.canceled) {
          selectedFile = file.filePaths[0].toString()
          selectedFileLabel.innerHTML = selectedFile
        }
      }).catch(err => {
        console.log(err)
      })
    }
  })

  const singleFileModeRadioButton = document.getElementById('singleFileModeRadioButton')
  const directoryModeRadioButton = document.getElementById('directoryModeRadioButton')

  singleFileModeRadioButton.addEventListener('change', (event) => {
    if (singleFileModeRadioButton.checked) {
      console.log('checked: singleFileModeRadioButton')
      fileSelectMode = 'openFile'
    }
  })

  directoryModeRadioButton.addEventListener('change', (event) => {
    if (directoryModeRadioButton.checked) {
      console.log('checked: directoryModeRadioButton')
      fileSelectMode = 'openDirectory'
    }
  })

  const startScanButton = document.getElementById('startScanButton')

  startScanButton.addEventListener('click', (event) => {
    if (selectedFile !== '') {
      console.log(`START SCAN OF: ${selectedFile}`)
      const scanMessage = {}
      scanMessage.path = selectedFile
      scanMessage.mode = fileSelectMode
      fetch('http://localhost:8080/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scanMessage) }) //eslint-disable-line
      _startScanTimer(0)
    }

    /*
      const stream = createReadStream(global.filepath)
      fetch('http://localhost:8080/', { method: 'POST', body: stream }) //eslint-disable-line
     */
  })

  function openFolderSelectDialog () {
    return dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Select',
      filters: getFilters(),
      properties: [fileSelectMode]
    })
  }

  function getFilters () {
    const textFilesExt = ['txt', 'docx']
    const javaFilesExt = ['java']

    return [
      {
        name: 'All',
        extensions: [...textFilesExt, ...javaFilesExt]
      },
      {
        name: 'Text Files',
        extensions: textFilesExt
      },
      {
        name: 'Java Files',
        extensions: javaFilesExt
      }
    ]
  }

  const scanMessage = document.getElementById('scanMessage')

  function _startScanTimer (dots) {
    let message = 'Scanning'
    for (let i = 0; i < dots; i++) {
      message += ' .'
    }
    scanMessage.innerHTML = message
    setTimeout(() => {
      if (dots === 3) {
        _startScanTimer(0)
      } else {
        _startScanTimer(++dots)
      }
    }, 500)
  }
})()
