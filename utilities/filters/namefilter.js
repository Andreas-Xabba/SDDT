const fileService = require('fs')

const nameFilter = {}
module.exports = nameFilter
let names = []

nameFilter.initiate = async () => {
  return new Promise((resolve, reject) => {
    fileService.readFile('./resources/names.csv', 'utf8', (err, data) => {
      if (err) {
        reject(data)
      }
      names = data.split('\r\n')
      resolve(data)
    })
  })
}

nameFilter.filter = (lines) => {
  console.log(lines)
  console.log(names)
}
