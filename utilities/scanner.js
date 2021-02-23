const fileService = require('fs')
const path = require('path')

const scanner = {}
module.exports = scanner

scanner.scan = async (file) => {
  let filePaths = []
  if (file.mode === 'openFile') {
    console.log('file')
    filePaths.push(file.path)
  } else {
    console.log('directory')
    filePaths = _findFilesRecursive(file.path)
  }
  console.log(filePaths)

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('scanID')
    }, 3000)
  })
}

function _findFilesRecursive (Directory) {
  let moreFiles = []
  fileService.readdirSync(Directory).forEach(File => {
    const absolutePath = path.join(Directory, File)
    if (fileService.statSync(absolutePath).isDirectory()) {
      moreFiles = [...moreFiles, ..._findFilesRecursive(absolutePath)]
    } else {
      moreFiles.push(absolutePath)
    }
  })
  return moreFiles
}
