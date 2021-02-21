
(function () {
  'use strict'
  const electron = require('electron')
  const path = require('path')
  console.log(electron)
  const dialog = electron.remote.dialog
  const selectFilesButton = document.getElementById('selectFilesButton')

  selectFilesButton.addEventListener('click', () => {
    if (process.platform !== 'darwin') {
      openFolderSelectDialog().then(file => {
        console.log(file.canceled)
        if (!file.canceled) {
          global.filepath = file.filePaths[0].toString()
          console.log(global.filepath)
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      openFolderSelectDialog().then(file => {
        console.log(file.canceled)
        if (!file.canceled) {
          global.filepath = file.filePaths[0].toString()
          console.log(global.filepath)
        }
      }).catch(err => {
        console.log(err)
      })
    }
  })

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
    return [
      {
        name: 'Text Files',
        extensions: ['txt', 'docx']
      },
      {
        name: 'Java Files',
        extensions: ['java']
      }
    ]
  }
})()
