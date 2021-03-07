
function initiateHistoryList(historyFiles, selectedFileName) { // eslint-disable-line
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

function displaySelectedFile(selectedFileData) { // eslint-disable-line
  const selectedFileSelector = document.getElementById('selectedFileSelector')
  const selectedFileTypeSelector = document.getElementById('selectedFileTypeSelector')
  const selectedItemSelector = document.getElementById('selectedItemSelector')
  const showItemWrapper = document.getElementById('showItemWrapper')
  const showFileInfoWrapper = document.getElementById('showFileInfoWrapper')
  const itemUserOptionsWrapper = document.getElementById('itemUserOptionsWrapper')
  let ItemsSortedByTypeArray = []

  showFileInfoWrapper.innerHTML = `<b>Timestamp:</b> ${selectedFileData.timestamp}`
  const results = selectedFileData.results.sort((a, b) => (a.result.length > b.result.length) ? -1 : ((a.result.length < b.result.length) ? 1 : 0))
  for (let i = 0; i < results.length; i++) {
    const newOption = document.createElement('option')
    newOption.value = i

    const absolutePathSplit = results[i].absolutePath.split('\\')
    newOption.innerHTML = `[${results[i].result.length}] ${absolutePathSplit[absolutePathSplit.length - 1]}`
    if (results[i].result.length > 0) {
      newOption.setAttribute('class', 'file-result-alert')
    } else {
      newOption.setAttribute('class', 'file-result-noalert')
    }
    selectedFileSelector.appendChild(newOption)
  }

  selectedFileSelector.addEventListener('change', () => {
    showFileInfoWrapper.style.display = 'block'
    itemUserOptionsWrapper.style.display = 'none'
    showItemWrapper.style.display = 'none'
    selectedItemSelector.innerHTML = ''
    selectedFileTypeSelector.innerHTML = ''
    ItemsSortedByTypeArray = []

    for (const result of results[selectedFileSelector.selectedIndex].result) {
      let typeFound = false
      for (const array of ItemsSortedByTypeArray) {
        if (array.type === result.type) {
          array.items.push(result)
          typeFound = true
        }
      }
      if (!typeFound) {
        ItemsSortedByTypeArray.push({
          type: result.type,
          items: [result]
        })
      }
    }

    for (const array of ItemsSortedByTypeArray) {
      const newOption = document.createElement('option')
      newOption.value = ''
      newOption.innerHTML = `[${array.items.length}] ${array.type}`

      selectedFileTypeSelector.appendChild(newOption)
    }

    selectedFileTypeSelector.addEventListener('change', () => {
      itemUserOptionsWrapper.style.display = 'none'
      showItemWrapper.style.display = 'none'
      selectedItemSelector.innerHTML = ''
      for (const item of ItemsSortedByTypeArray[selectedFileTypeSelector.selectedIndex].items) {
        const newItemOption = document.createElement('option')
        newItemOption.value = item
        newItemOption.innerHTML = item.match // ADD SOME VALUE REPRESENTING THE RISK

        selectedItemSelector.appendChild(newItemOption)
      }
    })
  })
  selectedItemSelector.addEventListener('change', () => {
    itemUserOptionsWrapper.style.display = 'block'
    showItemWrapper.style.display = 'block'
    showFileInfoWrapper.style.display = 'none'
    _resetShowItem()
    _displayItem(ItemsSortedByTypeArray[selectedFileTypeSelector.selectedIndex].items[selectedItemSelector.selectedIndex], results[selectedFileSelector.selectedIndex].absolutePath)
  })
}

function _resetShowItem () {
  const showItemWrapper = document.getElementById('showItemWrapper')
  showItemWrapper.innerHTML = ''
  console.log('reset item')
}

function _displayItem (item, path) {
  const showItemWrapper = document.getElementById('showItemWrapper')

  let displayString =
  `
  <span><b>Type:</b> ${item.type}</span>
  <span><b>File Path:</b> ${path}</span>
  <span><b>Line:</b> ${item.line}</span>
  <span style="margin-top: 10px;"><b>Complete String:</b> "${item.completeString}"</span>
  <span style="margin-top: 5px;"><b>Data:</b> ${item.match}</span>
  `
  displayString = displayString.replaceAll(item.match, `<span class="inline-text-error">${item.match}</span>`)
  showItemWrapper.innerHTML = displayString

  console.log(item)
  console.log(path)
}
