
(function () {
  'use strict'
  const electron = require('electron')
  // const { createReadStream } = require('fs')
  const path = require('path')
  const fileService = require('fs')
  const dialog = electron.remote.dialog

  let selectedFiles = []
  let fileSelectMode = 'openFile'

  const selectFilesButton = document.getElementById('selectFilesButton')

  selectFilesButton.addEventListener('click', () => {
    if (process.platform !== 'darwin') {
      openFolderSelectDialog().then(file => {
        if (!file.canceled) {
          selectedFiles = []
          addFileToList(file)
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      openFolderSelectDialog().then(file => {
        if (!file.canceled) {
          selectedFiles = []
          addFileToList(file)
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
    console.log('START SCAN')
    console.log(selectedFiles)
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

  function findFilesRecursive (Directory) {
    fileService.readdirSync(Directory).forEach(File => {
      const absolutePath = path.join(Directory, File)
      if (fileService.statSync(absolutePath).isDirectory()) return findFilesRecursive(absolutePath)
      else return selectedFiles.push(absolutePath)
    })
  }

  function addFileToList (file) {
    console.log(file.filePaths[0].toString())
    const filePath = file.filePaths[0].toString()
    if (fileService.statSync(filePath).isDirectory()) {
      findFilesRecursive(filePath)
    } else {
      selectedFiles.push(file.filePaths[0].toString())
    }
  }
})()
