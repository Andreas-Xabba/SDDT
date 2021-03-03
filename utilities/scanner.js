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
      const fileAsString = _readFile(filePath)
      const lines = _parseFileToLines(fileAsString)
      const candidates = []
      let lineCounter = 0
      let isCommentSection = false
      for (const line of lines) {
        lineCounter++
        const lineData = _identifyStrings(line, isCommentSection, file.options.comments)
        isCommentSection = lineData.commentSection
        if (lineData.identifiedStrings.length > 0) {
          candidates.push({
            strings: lineData.identifiedStrings,
            line: lineCounter
          })
        }
      }

      let results = []
      for (const filter of filters) {
        results = [...results, ...filter.filter(candidates)]
      }

      finalResults.push({
        absolutePath: filePath,
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
  if (file.includes('\r\n')) {
    return file.split('\r\n')
  } else {
    return file.split('\n')
  }
}

function _identifyStrings (line, isComment, commentsEnabled) {
  const lineData = {
    commentSection: false,
    identifiedStrings: []
  }
  const identifiedStrings = []
  const openCharacters = []
  let openCharactersCounter = 0
  if (isComment) {
    if (!line.includes('*/')) {
      lineData.commentSection = true
    }
    if (commentsEnabled) {
      lineData.identifiedStrings.push(line)
    }
    return lineData
  } else {
    for (let i = 0; i < line.length; i++) {
      const currCharacter = line.charAt(i)
      if (currCharacter === '/') {
        if (line.charAt(i + 1) === '/') {
          if (commentsEnabled) {
            const string = line.substring(i + 2, line.length)
            if (string !== '') {
              identifiedStrings.push(string)
            }
          }
          lineData.identifiedStrings = identifiedStrings
          return lineData
        } else if (line.charAt(i + 1) === '*') {
          if (commentsEnabled) {
            const string = line.substring(i + 2, line.length)
            if (string !== '') {
              identifiedStrings.push(string)
            }
          }
          lineData.identifiedStrings = identifiedStrings
          lineData.commentSection = true
          return lineData
        }
      }

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
    lineData.identifiedStrings = identifiedStrings
    return lineData
  }
}
