const fileService = require('fs')
const path = require('path')

const nameFilter = require('../utilities/filters/nameFilter')
const ipFilter = require('../utilities/filters/ipFilter')
const emailFilter = require('../utilities/filters/emailFilter')

const scanner = {}
module.exports = scanner

scanner.scan = async (scanRequest) => {
  const filters = []
  if (scanRequest.types.name) {
    await nameFilter.initiate()
    filters.push(nameFilter)
  }
  if (scanRequest.types.email) { filters.push(emailFilter) }
  if (scanRequest.types.ip) { filters.push(ipFilter) }

  const allExcludeExtensions = JSON.parse(fileService.readFileSync('./resources/exclude_extensions.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      return data
    }
  }))
  const excludeExtensions = [...allExcludeExtensions.image_extensions, ...allExcludeExtensions.other]

  const excludeDirectories = JSON.parse(fileService.readFileSync('./resources/module_directories.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      return data
    }
  })).directories

  let filePaths = []
  if (scanRequest.mode === 'openFile') {
    filePaths.push(scanRequest.path)
  } else {
    filePaths = _findFilesRecursive(scanRequest.path, excludeDirectories)
  }

  return new Promise((resolve, reject) => {
    const finalResults = []
    for (const filePath of filePaths) {
      if (!excludeExtensions.includes(_getExtension(filePath))) {
        const fileAsString = _readFile(filePath)
        const lines = _parseFileToLines(fileAsString)
        const candidates = []
        let lineCounter = 0
        let isCommentSection = false
        for (const line of lines) {
          lineCounter++
          const lineData = _identifyStrings(line, isCommentSection, scanRequest.options.comments)
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
    }

    resolve(finalResults)
  })
}

function _findFilesRecursive (Directory, excludeDirectories) {
  let moreFiles = []
  fileService.readdirSync(Directory).forEach(File => {
    const absolutePath = path.join(Directory, File)
    console.log(File)
    if (fileService.statSync(absolutePath).isDirectory()) {
      if (!excludeDirectories.includes(File)) {
        moreFiles = [...moreFiles, ..._findFilesRecursive(absolutePath, excludeDirectories)]
      }
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

function _getExtension (filePath) {
  const splitPath = filePath.split('.')
  return `.${splitPath[splitPath.length - 1].toLowerCase()}`
}
