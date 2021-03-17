
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
  const nameSection = document.getElementById('nameSection')
  const emailSection = document.getElementById('emailSection')
  const ipSection = document.getElementById('ipSection')
  const passwordSection = document.getElementById('passwordSection')
  const keySection = document.getElementById('keySection')
  let selectedSection = generalSection

  generalSection.setAttribute('class', 'display-section')

  const excludeMenuGeneral = document.getElementById('excludeMenuGeneral')
  const excludeMenuName = document.getElementById('excludeMenuName')
  const excludeMenuEmail = document.getElementById('excludeMenuEmail')
  const excludeMenuIP = document.getElementById('excludeMenuIP')
  const excludeMenuPassword = document.getElementById('excludeMenuPassword')
  const excludeMenuKey = document.getElementById('excludeMenuKey')
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

  excludeMenuName.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuName
    selectedSection = nameSection
    excludeMenuName.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    nameSection.setAttribute('class', 'display-section')
  })

  excludeMenuEmail.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuEmail
    selectedSection = emailSection
    excludeMenuEmail.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    emailSection.setAttribute('class', 'display-section')
  })

  excludeMenuIP.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuIP
    selectedSection = ipSection
    excludeMenuIP.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    ipSection.setAttribute('class', 'display-section')
  })

  excludeMenuPassword.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuPassword
    selectedSection = passwordSection
    excludeMenuPassword.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    passwordSection.setAttribute('class', 'display-section')
  })

  excludeMenuKey.addEventListener('click', (event) => {
    selectedMenu.setAttribute('class', 'exclude-menu-list-item')
    selectedSection.setAttribute('class', 'dont-display-section')
    selectedMenu = excludeMenuKey
    selectedSection = keySection
    excludeMenuKey.setAttribute('class', 'exclude-menu-list-item selected-menu-item')
    keySection.setAttribute('class', 'display-section')
  })
}
