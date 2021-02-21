
(function () {
  'use strict'
  const electron = require('electron')
  // const { createReadStream } = require('fs')
  const path = require('path')
  const dialog = electron.remote.dialog
  const selectFilesButton = document.getElementById('selectFilesButton')

  selectFilesButton.addEventListener('click', () => {
    if (process.platform !== 'darwin') {
      openFolderSelectDialog().then(file => {
        postFile(file)
      }).catch(err => {
        console.log(err)
      })
    } else {
      openFolderSelectDialog().then(file => {
        postFile(file)
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
    }
  })

  directoryModeRadioButton.addEventListener('change', (event) => {
    if (directoryModeRadioButton.checked) {
      console.log('checked: directoryModeRadioButton')
    }
  })

  function postFile (file) {
    if (!file.canceled) {
      global.filepath = file.filePaths[0].toString()
      console.log(global.filepath)
      /*
      const stream = createReadStream(global.filepath)
      fetch('http://localhost:8080/', { method: 'POST', body: stream }) //eslint-disable-line
      */
    }
  }

  function openFolderSelectDialog () {
    return dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Select',
      filters: getFilters(),
      properties: ['openFile']
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
})()
