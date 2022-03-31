import { app, BrowserView, shell } from 'electron'
import path from 'path'
import { is } from 'electron-util'
import createMainWindow from './createWindow'

app.whenReady().then(() => {
  const window = createMainWindow()
  window.maximize()
  window.setMenu(null)
  const size = window.getSize()
  const isDev = is.development
  window.loadFile(path.join(__dirname, '../../loading/loading.html'))

  const view = new BrowserView({ webPreferences: { nativeWindowOpen: true, devTools: true } })

  if (isDev) view.webContents.openDevTools()

  window.setBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: size[0], height: size[1] })

  // Open external url to default web browser
  // And not inside electron
  view.webContents.addListener('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })
  view.setAutoResize({ width: true, height: true })
  view.webContents.loadURL('https://www.tldraw.com/')
})
