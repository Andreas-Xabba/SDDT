
const ipFilter = {}
module.exports = ipFilter

ipFilter.filter = (candidates) => {
  const result = []
  for (const candidate of candidates) {
    // const stringParts = string.split(' ')
    for (const candidateString of candidate.strings) {
      for (const string of candidateString.split(' ')) {
        const potentialAddress = string.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
        if (potentialAddress !== null) {
          if (potentialAddress[1] <= 255 && potentialAddress[2] <= 255 && potentialAddress[3] <= 255 && potentialAddress[4] <= 255) {
            result.push({
              line: candidate.line,
              completeString: candidateString,
              match: string,
              type: 'ip'
            })
            console.log(string)
          }
        }
      }
    }
  }
  return result
}
