
const ipFilter = {}
module.exports = ipFilter

ipFilter.filter = (candidates) => {
  const result = []
  for (const candidate of candidates) {
    for (const candidateString of candidate.strings) {
      for (const string of candidateString.split(' ')) {
        const numberGroup = string.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
        if (numberGroup !== null) {
          if (numberGroup[1] <= 255 && numberGroup[2] <= 255 && numberGroup[3] <= 255 && numberGroup[4] <= 255) {
            result.push({
              line: candidate.line,
              completeString: candidateString,
              match: string,
              type: 'ip'
            })
          }
        }
      }
    }
  }
  return result
}
