
function initiateHistoryList (historyFiles, selectedFileName) { // eslint-disable-line
  const historyFileSelector = document.getElementById('historyFileSelector')
  const historyFileNames = historyFiles.data

  for (let i = 0; i < historyFileNames.length; i++) {
    const newOption = document.createElement('option')
    newOption.value = i
    newOption.innerHTML = historyFileNames[i]
    historyFileSelector.appendChild(newOption)
    if (historyFileNames[i] === selectedFileName) {
      newOption.selected = 'selected'
    }
  }

  historyFileSelector.addEventListener('change', () => {
    window.location.href = `/history/${historyFileNames[historyFileSelector.options[historyFileSelector.selectedIndex].value]}`
  })
}

function displaySelectedFile (selectedFileData) { // eslint-disable-line
  const selectedFileSelector = document.getElementById('selectedFileSelector')

  console.log(selectedFileData.results)
  const results = selectedFileData.results
  for (let i = 0; i < results.length; i++) {
    const newOption = document.createElement('option')
    newOption.value = i

    const absolutePathSplit = results[i].absolutePath.split('\\')
    newOption.innerHTML = absolutePathSplit[absolutePathSplit.length - 1]
    selectedFileSelector.appendChild(newOption)
  }
}
