import { ipcRenderer } from 'electron'
declare global {
  interface Window {
    main: typeof api
    ipcRenderer: typeof ipcRenderer
  }
}
