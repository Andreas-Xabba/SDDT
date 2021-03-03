
const emailFilter = {}
module.exports = emailFilter

emailFilter.filter = (candidates) => {
  const result = []
  for (const candidate of candidates) {
    for (const candidateString of candidate.strings) {
      for (const string of candidateString.split(' ')) {
        const potentialAddress = string.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
        if (potentialAddress !== null) {
          result.push({
            line: candidate.line,
            completeString: candidateString,
            match: string,
            type: 'email'
          })
        }
      }
    }
  }
  return result
}
