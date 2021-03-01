const fileService = require('fs')

const nameFilter = {}
module.exports = nameFilter
const nameA = []
const nameB = []
const nameC = []
const nameD = []
const nameE = []
const nameF = []
const nameG = []
const nameH = []
const nameI = []
const nameJ = []
const nameK = []
const nameL = []
const nameM = []
const nameN = []
const nameO = []
const nameP = []
const nameQ = []
const nameR = []
const nameS = []
const nameT = []
const nameU = []
const nameV = []
const nameW = []
const nameX = []
const nameY = []
const nameZ = []

nameFilter.filter = (candidates) => {
  const result = []
  for (const candidate of candidates) {
    // const stringParts = string.split(' ')
    for (const candidateString of candidate.strings) {
      for (const string of candidateString.split(' ')) {
        const nameBase = [..._getNameBase(string)]
        for (const name of nameBase) {
          // if (stringPart.toLowerCase().includes(name.toLowerCase())) {
          if (string.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0) {
            result.push({
              line: candidate.line,
              completeString: candidateString,
              match: string,
              type: 'name'
            })
            break
          } else {
            // empty
          }
        }
      }
    }
  }
  return result
}

nameFilter.initiate = async () => {
  return new Promise((resolve, reject) => {
    fileService.readFile('./resources/names.csv', 'utf8', (err, data) => {
      if (err) {
        reject(data)
      }
      for (const name of data.split('\r\n')) {
        switch (name.charAt(0).toLowerCase()) {
          case 'a': {
            nameA.push(name)
            break
          }
          case 'b': {
            nameB.push(name)
            break
          }
          case 'c': {
            nameC.push(name)
            break
          }
          case 'd': {
            nameD.push(name)
            break
          }
          case 'e': {
            nameE.push(name)
            break
          }
          case 'f': {
            nameF.push(name)
            break
          }
          case 'g': {
            nameG.push(name)
            break
          }
          case 'h': {
            nameH.push(name)
            break
          }
          case 'i': {
            nameI.push(name)
            break
          }
          case 'j': {
            nameJ.push(name)
            break
          }
          case 'k': {
            nameK.push(name)
            break
          }
          case 'l': {
            nameL.push(name)
            break
          }
          case 'm': {
            nameM.push(name)
            break
          }
          case 'n': {
            nameN.push(name)
            break
          }
          case 'o': {
            nameO.push(name)
            break
          }
          case 'p': {
            nameP.push(name)
            break
          }
          case 'q': {
            nameQ.push(name)
            break
          }
          case 'r': {
            nameR.push(name)
            break
          }
          case 's': {
            nameS.push(name)
            break
          }
          case 't': {
            nameT.push(name)
            break
          }
          case 'u': {
            nameU.push(name)
            break
          }
          case 'v': {
            nameV.push(name)
            break
          }
          case 'w': {
            nameW.push(name)
            break
          }
          case 'x': {
            nameX.push(name)
            break
          }
          case 'y': {
            nameY.push(name)
            break
          }
          case 'z': {
            nameZ.push(name)
            break
          }
        }
      }
      resolve(data)
    })
  })
}

function _getNameBase (stringPart) {
  switch (stringPart.toLowerCase().charAt(0)) {
    case 'a': {
      return nameA
    }
    case 'b': {
      return nameB
    }
    case 'c': {
      return nameC
    }
    case 'd': {
      return nameD
    }
    case 'e': {
      return nameE
    }
    case 'f': {
      return nameF
    }
    case 'g': {
      return nameG
    }
    case 'h': {
      return nameH
    }
    case 'i': {
      return nameI
    }
    case 'j': {
      return nameJ
    }
    case 'k': {
      return nameK
    }
    case 'l': {
      return nameL
    }
    case 'm': {
      return nameM
    }
    case 'n': {
      return nameN
    }
    case 'o': {
      return nameO
    }
    case 'p': {
      return nameP
    }
    case 'q': {
      return nameQ
    }
    case 'r': {
      return nameR
    }
    case 's': {
      return nameS
    }
    case 't': {
      return nameT
    }
    case 'u': {
      return nameU
    }
    case 'v': {
      return nameV
    }
    case 'w': {
      return nameW
    }
    case 'x': {
      return nameX
    }
    case 'y': {
      return nameY
    }
    case 'z': {
      return nameZ
    }
    default: {
      return []
    }
  }
}
