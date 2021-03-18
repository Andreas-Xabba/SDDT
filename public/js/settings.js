
function initiateSettings(profiles, activeProfile) { //eslint-disable-line
  console.log(profiles)
  console.log(activeProfile)

  const selectProfile = document.getElementById('selectProfile')
  profiles.data.forEach(profile => {
    const profileOption = document.createElement('option')
    profileOption.setAttribute('id', `profileOption${profile}`)
    profileOption.setAttribute('value', profile)
    profileOption.innerHTML = profile

    if (profile === activeProfile.profileID) {
      profileOption.selected = true
    }
    selectProfile.appendChild(profileOption)
  })

  selectProfile.addEventListener('change', (event) => {
    const selectedProfile = profiles.data[selectProfile.selectedIndex]
    console.log(selectedProfile)
    const message = {
      profile: selectedProfile
    }
    fetch(`http://localhost:8080/settings/change`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) }) //eslint-disable-line
  })

  const saveSettingsButton = document.getElementById('saveSettingsButton')
  saveSettingsButton.addEventListener('click', (event) => {
    const message = {
      data: 'update'
    }

    fetch(`http://localhost:8080/settings/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) }) //eslint-disable-line
  })

  const generalSection = document.getElementById('generalSection')
  const dataTypesSection = document.getElementById('dataTypesSection')
  const languagesSection = document.getElementById('languagesSection')

  let selectedSection = generalSection

  generalSection.setAttribute('class', 'display-section')

  const excludeMenuGeneral = document.getElementById('excludeMenuGeneral')
  const excludeMenuDataTypes = document.getElementById('excludeMenuDataTypes')
  const excludeMenuLanguages = document.getElementById('excludeMenuLanguages')
  let selectedMenu = excludeMenuGeneral

  excludeMenuGeneral.setAttribute('class', 'exclude-menu-list-item selected-menu-item')

  excludeMenuGeneral.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuGeneral
    selectedSection = generalSection
    excludeMenuGeneral.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    generalSection.setAttribute('class', 'display-section')
  })

  excludeMenuDataTypes.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuDataTypes
    selectedSection = dataTypesSection
    excludeMenuDataTypes.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    dataTypesSection.setAttribute('class', 'display-section')
  })

  excludeMenuLanguages.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuLanguages
    selectedSection = languagesSection
    excludeMenuLanguages.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    languagesSection.setAttribute('class', 'display-section')
  })

  _initiateGeneral(activeProfile)
  _initiateDataTypes(activeProfile)
}

function _initiateGeneral (activeProfile) {
  const excludeCategorySelector = document.getElementById('excludeCategorySelector')
  const extensionsSection = document.getElementById('extensionsSection')
  const filesSection = document.getElementById('filesSection')
  const directoriesSection = document.getElementById('directoriesSection')
  let selectedExcludeCategorySection = extensionsSection

  excludeCategorySelector.addEventListener('change', (event) => {
    selectedExcludeCategorySection.setAttribute('class', 'dont-display-section')
    switch (excludeCategorySelector[excludeCategorySelector.selectedIndex].value) {
      case 'extensions': {
        selectedExcludeCategorySection = extensionsSection
        extensionsSection.setAttribute('class', 'display-section')
        break
      }
      case 'files': {
        selectedExcludeCategorySection = filesSection
        filesSection.setAttribute('class', 'display-section')
        break
      }
      case 'directories': {
        selectedExcludeCategorySection = directoriesSection
        directoriesSection.setAttribute('class', 'display-section')
        break
      }
      default: {
        console.log('default case')
      }
    }
  })
  // EXTENSIONS SECTION
  const extensionsCategorySelector = document.getElementById('extensionsCategorySelector')
  const extensionsSubCategorySelector = document.getElementById('extensionsSubCategorySelector')
  const extensionsCategoryDeleteButton = document.getElementById('extensionsCategoryDeleteButton')
  const extensionsCategoryAddButton = document.getElementById('extensionsCategoryAddButton')
  const extensionsSubCategoryAddButton = document.getElementById('extensionsSubCategoryAddButton')
  const extensionsSubCategoryDeleteButton = document.getElementById('extensionsSubCategoryDeleteButton')
  const extensionsCategoryAddInput = document.getElementById('extensionsCategoryAddInput')
  const extensionsSubCategoryAddInput = document.getElementById('extensionsSubCategoryAddInput')
  for (const extension of Object.keys(activeProfile.excludeExtensions)) {
    const option = document.createElement('option')
    option.setAttribute('value', extension)
    option.innerHTML = extension
    extensionsCategorySelector.appendChild(option)
  }
  extensionsCategorySelector.addEventListener('change', (event) => {
    extensionsCategoryDeleteButton.disabled = false
    extensionsSubCategoryAddButton.disabled = false
    extensionsSubCategoryAddInput.disabled = false
    extensionsSubCategoryDeleteButton.disabled = true
    extensionsSubCategorySelector.innerHTML = ''
    const value = extensionsCategorySelector[extensionsCategorySelector.selectedIndex].value
    for (const extension of activeProfile.excludeExtensions[value]) {
      const option = document.createElement('option')
      option.setAttribute('value', extension)
      option.innerHTML = extension
      extensionsSubCategorySelector.appendChild(option)
    }
  })
  extensionsSubCategorySelector.addEventListener('change', (event) => {
    const value = extensionsSubCategorySelector[extensionsSubCategorySelector.selectedIndex].value
    extensionsSubCategoryDeleteButton.disabled = false
    console.log(value)
  })

  extensionsCategoryAddButton.addEventListener('click', (event) => {
    const value = extensionsCategoryAddInput.value
    if (value !== '') {
      const newOption = document.createElement('option')
      newOption.value = value
      newOption.innerHTML = value
      extensionsCategorySelector.appendChild(newOption)
      activeProfile.excludeExtensions[value] = []
      extensionsCategoryAddInput.value = ''
      console.log(value)
    }
  })

  extensionsSubCategoryAddButton.addEventListener('click', (event) => {
    const value = extensionsSubCategoryAddInput.value
    if (value !== '') {
      const newOption = document.createElement('option')
      newOption.value = value
      newOption.innerHTML = value
      extensionsSubCategorySelector.appendChild(newOption)
      activeProfile.excludeExtensions[extensionsCategorySelector[extensionsCategorySelector.selectedIndex].value].push(value)
      extensionsSubCategoryAddInput.value = ''
      console.log(activeProfile)
    }
  })

  extensionsCategoryDeleteButton.addEventListener('click', (event) => {
    const selectedValue = extensionsCategorySelector[extensionsCategorySelector.selectedIndex].value
    delete activeProfile.excludeExtensions[selectedValue]
    extensionsCategorySelector.removeChild(extensionsCategorySelector[extensionsCategorySelector.selectedIndex])
    extensionsCategoryDeleteButton.disabled = true
    extensionsSubCategorySelector.innerHTML = ''
    extensionsSubCategoryAddButton.disabled = true
    extensionsSubCategoryAddInput.disabled = true
    extensionsSubCategoryDeleteButton.disabled = true
    console.log(activeProfile)
  })

  extensionsSubCategoryDeleteButton.addEventListener('click', (event) => {
    const valuesArray = activeProfile.excludeExtensions[extensionsCategorySelector[extensionsCategorySelector.selectedIndex].value]
    const valueIndex = valuesArray.indexOf(extensionsSubCategorySelector[extensionsSubCategorySelector.selectedIndex].value)
    valuesArray.splice(valueIndex, 1)
    extensionsSubCategorySelector.removeChild(extensionsSubCategorySelector[extensionsSubCategorySelector.selectedIndex])
    extensionsSubCategoryDeleteButton.disabled = true
    console.log(activeProfile)
  })

  // FILES SECTION
  const fileCategorySelector = document.getElementById('fileCategorySelector')
  const fileSubCategorySelector = document.getElementById('fileSubCategorySelector')
  const filesCategoryAddInput = document.getElementById('filesCategoryAddInput')
  const filesCategoryAddButton = document.getElementById('filesCategoryAddButton')
  const filesCategoryDeleteButton = document.getElementById('filesCategoryDeleteButton')
  const filesSubCategoryAddInput = document.getElementById('filesSubCategoryAddInput')
  const filesSubCategoryAddButton = document.getElementById('filesSubCategoryAddButton')
  const filesSubCategoryDeleteButton = document.getElementById('filesSubCategoryDeleteButton')
  for (const extension of Object.keys(activeProfile.excludeFiles)) {
    const option = document.createElement('option')
    option.setAttribute('value', extension)
    option.innerHTML = extension
    fileCategorySelector.appendChild(option)
  }
  fileCategorySelector.addEventListener('change', (event) => {
    filesCategoryDeleteButton.disabled = false
    filesSubCategoryAddInput.disabled = false
    filesSubCategoryAddButton.disabled = false
    filesSubCategoryDeleteButton.disabled = true
    fileSubCategorySelector.innerHTML = ''
    const value = fileCategorySelector[fileCategorySelector.selectedIndex].value
    for (const extension of activeProfile.excludeFiles[value]) {
      const option = document.createElement('option')
      option.setAttribute('value', extension)
      option.innerHTML = extension
      fileSubCategorySelector.appendChild(option)
    }
  })
  fileSubCategorySelector.addEventListener('change', (event) => {
    const value = fileSubCategorySelector[fileSubCategorySelector.selectedIndex].value
    filesSubCategoryDeleteButton.disabled = false
    console.log(value)
  })

  filesCategoryAddButton.addEventListener('click', (event) => {
    const value = filesCategoryAddInput.value
    if (value !== '') {
      const newOption = document.createElement('option')
      newOption.value = value
      newOption.innerHTML = value
      fileCategorySelector.appendChild(newOption)
      activeProfile.excludeFiles[value] = []
      filesCategoryAddInput.value = ''
      console.log(value)
    }
  })

  filesSubCategoryAddButton.addEventListener('click', (event) => {
    const value = filesSubCategoryAddInput.value
    if (value !== '') {
      const newOption = document.createElement('option')
      newOption.value = value
      newOption.innerHTML = value
      fileSubCategorySelector.appendChild(newOption)
      activeProfile.excludeFiles[fileCategorySelector[fileCategorySelector.selectedIndex].value].push(value)
      filesSubCategoryAddInput.value = ''
      console.log(activeProfile)
    }
  })

  filesCategoryDeleteButton.addEventListener('click', (event) => {
    const selectedValue = fileCategorySelector[fileCategorySelector.selectedIndex].value
    delete activeProfile.excludeFiles[selectedValue]
    fileCategorySelector.removeChild(fileCategorySelector[fileCategorySelector.selectedIndex])
    filesCategoryDeleteButton.disabled = true
    fileSubCategorySelector.innerHTML = ''
    filesSubCategoryAddButton.disabled = true
    filesSubCategoryAddInput.disabled = true
    filesSubCategoryDeleteButton.disabled = true
    console.log(activeProfile)
  })

  filesSubCategoryDeleteButton.addEventListener('click', (event) => {
    const valuesArray = activeProfile.excludeFiles[fileCategorySelector[fileCategorySelector.selectedIndex].value]
    const valueIndex = valuesArray.indexOf(fileSubCategorySelector[fileSubCategorySelector.selectedIndex].value)
    valuesArray.splice(valueIndex, 1)
    fileSubCategorySelector.removeChild(fileSubCategorySelector[fileSubCategorySelector.selectedIndex])
    filesSubCategoryDeleteButton.disabled = true
    console.log(activeProfile)
  })

  // DIRECTORIES SECTION
  const directoriesCategorySelector = document.getElementById('directoriesCategorySelector')
  const directoriesSubCategorySelector = document.getElementById('directoriesSubCategorySelector')
  const directoriesCategoryAddInput = document.getElementById('directoriesCategoryAddInput')
  const directoriesCategoryAddButton = document.getElementById('directoriesCategoryAddButton')
  const directoriesCategoryDeleteButton = document.getElementById('directoriesCategoryDeleteButton')
  const directoriesSubCategoryAddInput = document.getElementById('directoriesSubCategoryAddInput')
  const directoriesSubCategoryAddButton = document.getElementById('directoriesSubCategoryAddButton')
  const directoriesSubCategoryDeleteButton = document.getElementById('directoriesSubCategoryDeleteButton')
  for (const extension of Object.keys(activeProfile.moduleDirectories)) {
    const option = document.createElement('option')
    option.setAttribute('value', extension)
    option.innerHTML = extension
    directoriesCategorySelector.appendChild(option)
  }
  directoriesCategorySelector.addEventListener('change', (event) => {
    directoriesCategoryDeleteButton.disabled = false
    directoriesSubCategoryAddInput.disabled = false
    directoriesSubCategoryAddButton.disabled = false
    directoriesSubCategoryDeleteButton.disabled = true
    directoriesSubCategorySelector.innerHTML = ''
    const value = directoriesCategorySelector[directoriesCategorySelector.selectedIndex].value
    for (const extension of activeProfile.moduleDirectories[value]) {
      const option = document.createElement('option')
      option.setAttribute('value', extension)
      option.innerHTML = extension
      directoriesSubCategorySelector.appendChild(option)
    }
  })
  directoriesSubCategorySelector.addEventListener('change', (event) => {
    const value = directoriesSubCategorySelector[directoriesSubCategorySelector.selectedIndex].value
    directoriesSubCategoryDeleteButton.disabled = false
    console.log(value)
  })

  directoriesCategoryAddButton.addEventListener('click', (event) => {
    const value = directoriesCategoryAddInput.value
    if (value !== '') {
      const newOption = document.createElement('option')
      newOption.value = value
      newOption.innerHTML = value
      directoriesCategorySelector.appendChild(newOption)
      activeProfile.moduleDirectories[value] = []
      directoriesCategoryAddInput.value = ''
      console.log(value)
    }
  })

  directoriesSubCategoryAddButton.addEventListener('click', (event) => {
    const value = directoriesSubCategoryAddInput.value
    if (value !== '') {
      const newOption = document.createElement('option')
      newOption.value = value
      newOption.innerHTML = value
      directoriesSubCategorySelector.appendChild(newOption)
      activeProfile.moduleDirectories[directoriesCategorySelector[directoriesCategorySelector.selectedIndex].value].push(value)
      directoriesSubCategoryAddInput.value = ''
      console.log(activeProfile)
    }
  })

  directoriesCategoryDeleteButton.addEventListener('click', (event) => {
    const selectedValue = directoriesCategorySelector[directoriesCategorySelector.selectedIndex].value
    delete activeProfile.moduleDirectories[selectedValue]
    directoriesCategorySelector.removeChild(directoriesCategorySelector[directoriesCategorySelector.selectedIndex])
    directoriesCategoryDeleteButton.disabled = true
    directoriesSubCategorySelector.innerHTML = ''
    directoriesSubCategoryAddButton.disabled = true
    directoriesSubCategoryAddInput.disabled = true
    directoriesSubCategoryDeleteButton.disabled = true
    console.log(activeProfile)
  })

  directoriesSubCategoryDeleteButton.addEventListener('click', (event) => {
    const valuesArray = activeProfile.moduleDirectories[directoriesCategorySelector[directoriesCategorySelector.selectedIndex].value]
    const valueIndex = valuesArray.indexOf(directoriesSubCategorySelector[directoriesSubCategorySelector.selectedIndex].value)
    valuesArray.splice(valueIndex, 1)
    directoriesSubCategorySelector.removeChild(directoriesSubCategorySelector[directoriesSubCategorySelector.selectedIndex])
    directoriesSubCategoryDeleteButton.disabled = true
    console.log(activeProfile)
  })
}

function _initiateDataTypes (activeProfile) {
  const dataTypeSelector = document.getElementById('dataTypeSelector')
  const nameSection = document.getElementById('nameSection')
  const emailSection = document.getElementById('emailSection')
  const ipSection = document.getElementById('ipSection')
  const passwordSection = document.getElementById('passwordSection')
  const keySection = document.getElementById('keySection')
  const otherSection = document.getElementById('otherSection')
  let selectedSection = nameSection

  dataTypeSelector.addEventListener('change', (event) => {
    selectedSection.setAttribute('class', 'dont-display-section')
    switch (dataTypeSelector[dataTypeSelector.selectedIndex].value) {
      case 'name': {
        selectedSection = nameSection
        nameSection.setAttribute('class', 'display-section')
        break
      }
      case 'email': {
        selectedSection = emailSection
        emailSection.setAttribute('class', 'display-section')
        break
      }
      case 'ip': {
        selectedSection = ipSection
        ipSection.setAttribute('class', 'display-section')
        break
      }
      case 'password': {
        selectedSection = passwordSection
        passwordSection.setAttribute('class', 'display-section')
        break
      }
      case 'key': {
        selectedSection = keySection
        keySection.setAttribute('class', 'display-section')
        break
      }
      case 'other': {
        selectedSection = otherSection
        otherSection.setAttribute('class', 'display-section')
        break
      }
      default: {
        console.log('default case')
      }
    }
  })

  // NAME SECTION
  const excludeNameSelector = document.getElementById('excludeNameSelector')
  const excludeNameInput = document.getElementById('excludeNameInput')
  const excludeNameAddButton = document.getElementById('excludeNameAddButton')
  const excludeNameDeleteButton = document.getElementById('excludeNameDeleteButton')
  const includeNameSelector = document.getElementById('includeNameSelector')
  const includeNameInput = document.getElementById('includeNameInput')
  const includeNameAddButton = document.getElementById('includeNameAddButton')
  const includeNameDeleteButton = document.getElementById('includeNameDeleteButton')

  for (const name of activeProfile.excludeMatch.name) {
    const option = document.createElement('option')
    option.setAttribute('value', name)
    option.innerHTML = name
    excludeNameSelector.appendChild(option)
  }
  for (const name of activeProfile.includeMatch.name) {
    const option = document.createElement('option')
    option.setAttribute('value', name)
    option.innerHTML = name
    includeNameSelector.appendChild(option)
  }
}
