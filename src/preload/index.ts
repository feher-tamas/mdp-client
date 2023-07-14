import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onConnectionChange: (callback: (connected: boolean) => void): void => {
    ipcRenderer.on('connectionChanged', (_, connected) => callback(connected))
  },
  onMessageArrived: (callback: (message: string) => void): void => {
    ipcRenderer.on('onMessageArrived', (_, message) => callback(message))
  },
  onSensorStatusChanged: (callback: (name: string, status: string) => void): void => {
    ipcRenderer.on('sensorStatusChanged', (_, name: string, status: string) =>
      callback(name, status)
    )
  },
  sendMessage: (servicename, request): void => {
    console.log(`Preload ${servicename}`)
    ipcRenderer.send('sendMessage', { servicename, request })
  },
  onGetSensors: (callback: (sensors: string[]) => void): void => {
    ipcRenderer.on('onGetSensors', (_, sensors) => callback(sensors))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('main', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
