const fileService = require('fs')
const path = require('path')

const scanner = {}
module.exports = scanner
let filePaths = []

scanner.scan = (filepath) => {
  filePaths = []
  _addFileToList(filepath)
  console.log(filepath)
  console.log(filePaths)
}

function _findFilesRecursive (Directory) {
  fileService.readdirSync(Directory).forEach(File => {
    const absolutePath = path.join(Directory, File)
    if (fileService.statSync(absolutePath).isDirectory()) return _findFilesRecursive(absolutePath)
    else return filePaths.push(absolutePath)
  })
}
function _addFileToList (filePath) {
  if (fileService.statSync(filePath).isDirectory()) {
    _findFilesRecursive(filePath)
  } else {
    filePaths.push(filePath)
  }
}
