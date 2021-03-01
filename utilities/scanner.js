const fileService = require('fs')
const path = require('path')

const scanner = {}
module.exports = scanner

scanner.scan = async (file, filters) => {
  let filePaths = []
  if (file.mode === 'openFile') {
    filePaths.push(file.path)
  } else {
    filePaths = _findFilesRecursive(file.path)
  }

  return new Promise((resolve, reject) => {
    const finalResults = []
    for (const filePath of filePaths) {
      const file = _readFile(filePath)
      const lines = _parseFileToLines(file)
      const candidates = []
      let lineCounter = 0
      for (const line of lines) {
        lineCounter++
        const strings = _identifyStrings(line)
        if (strings.length > 0) {
          candidates.push({
            strings: strings,
            line: lineCounter
          })
        }
      }
      /*
      console.log(candidates)
      const result = filters[0].filter(candidates)
      const result2 = filters[1].filter(candidates)
      console.log(result2)
      */
      let results = []
      for (const filter of filters) {
        results = [...results, ...filter.filter(candidates)]
      }

      finalResults.push({
        file: filePath,
        result: results
      })
    }
    for (const res of finalResults) {
      console.log(res.file)
      console.log(res.result)
    }
    resolve(finalResults)
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

function _identifyStrings (line) {
  const identifiedStrings = []
  const openCharacters = []
  let openCharactersCounter = 0

  for (let i = 0; i < line.length; i++) {
    const currCharacter = line.charAt(i)
    if (currCharacter === "'" || currCharacter === '"') {
      if (i > 0 && line.charAt(i - 1) !== '\\') {
        if (openCharactersCounter > 0 && openCharacters[openCharactersCounter - 1].character === currCharacter) {
          openCharactersCounter--
          if (openCharactersCounter === 0) {
            const string = line.substring(openCharacters[openCharactersCounter].position, i)
            if (string !== '') {
              identifiedStrings.push(string)
            }
          }
        } else {
          openCharacters[openCharactersCounter] = {
            character: currCharacter,
            position: i + 1
          }
          openCharactersCounter++
        }
      }
    }
  }
  return identifiedStrings
}
