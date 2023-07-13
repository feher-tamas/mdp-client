import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { MDPClient } from './mdp-client'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  const scdclient: MDPClient = new MDPClient(10, 'tcp://localhost:5051', 'SCD01')
  const mdpclient: MDPClient = new MDPClient(10, 'tcp://localhost:5051', 'C01')
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    scdclient.on((connected) => {
      mainWindow?.webContents.send('connectionChanged', connected)
    })
    mdpclient.on((connected) => {
      console.log(`[C01] connected: ${connected}`)
    })
    scdclient.tryConnect()
    scdclient.onResponseArrived((msg, data) => {
      console.log(`[SDC01]msg: ${msg} data: ${data}`)
      mainWindow?.webContents.send('sensorStatusChanged', msg[2], data)
    })
    mdpclient.tryConnect()
    mdpclient.onResponseArrived((msg, data) => {
      mainWindow?.webContents.send('onMessageArrived', `[C01] msg: ${msg} data: ${data}`)
    })
    setInterval(() => {
      getSensors()
    }, 10000)
  })
  const getSensors = (): void => {
    const sensors = ['map', 'radar']
    for (const item of sensors) {
      scdclient.send('mmi.service', item)
    }
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ipcMain.on('sendMessage', (_, { servicename, request }) => {
    console.log(`[C01] msg: ${servicename}`)
    mdpclient.send(servicename, request)
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
