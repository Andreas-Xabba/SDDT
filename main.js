const expressApp = require('./app.js') //eslint-disable-line
const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1000,
    autoHideMenuBar: true,
    useContentSize: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  mainWindow.webContents.openDevTools()
  mainWindow.loadURL('http://localhost:8080/')
  mainWindow.focus()
})
