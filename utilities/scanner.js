const fileService = require('fs')
const path = require('path')

const scanner = {}
module.exports = scanner

scanner.scan = async (file, filters) => {
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
    for (const filePath of filePaths) {
      const file = _readFile(filePath)
      const lines = _parseFileToLines(file)
      filters[0].filter(lines)
    }
    setTimeout(() => {
      resolve('scanID')
    }, 5000)
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

function _readFile (filePath) {
  const file = fileService.readFileSync(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
    } else {
      return data
    }
  })
  return file
}

function _parseFileToLines (file) {
  return file.split('\r\n')
}
