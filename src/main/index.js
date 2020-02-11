'use strict'

import { app, BrowserWindow, session, screen, Menu } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const electronDl = require('electron-dl');

electronDl();
const Store = require('electron-store');
const store = new Store();
const isDevelopment = process.env.NODE_ENV !== 'production';
const contextMenu = require('electron-context-menu');
const openAboutWindow = require('about-window').default;

contextMenu({
  prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Zurück',
			click: () => {
				browserWindow.webContents.goBack();
			}
    },
    {
			label: 'Vorwärts',
			click: () => {
				browserWindow.webContents.goForward();
			}
		}

  ],
	labels: {
    copy: 'Kopieren',
    paste: 'Einfügen',
    cut: 'Ausschneiden',
    copyLink: 'Link kopieren',
  },
  showLookUpSelection: false,
});


// Window Menu
const menu = Menu.buildFromTemplate([
  // { role: 'appMenu' }
  ...(process.platform === 'darwin' ? [{
      label: app.getName(),
      submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
      ]
  }] : []),
  // { role: 'fileMenu' }
  {
      label: 'Datei',
      submenu: [
          {
              label: 'Beenden',
              click: () =>
                  app.quit(),
          }
      ]
  },
  // { role: 'editMenu' }
  {
      label: 'Bearbeiten',
      submenu: [{
              label: 'Zurück',
              click: function(menuItem, currentWindow) {
                  if (currentWindow)
                      currentWindow.webContents.goBack();
              },
              accelerator: 'CommandOrControl+Left'
          },
          {
              label: 'Vorwärts',
              click: function(menuItem, currentWindow) {
                  if (currentWindow)
                      currentWindow.webContents.goForward();
              },
              accelerator: 'CommandOrControl+Right'
          },
      ]
  },
]);

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  
  const height = store.get("height") ?? 800;
  const width = store.get("width") ?? 1260;
  const x = store.get("x") ?? 0;
  const y = store.get("y") ?? 0;
  const window = new BrowserWindow({
    width: width, height: height, x: x, y: y
  })
  
  if (isDevelopment) {
    window.webContents.openDevTools()
  }
  Menu.setApplicationMenu(menu);

  const url = store.get("url") ?? "https://app.systori.com";
  window.loadURL(url)
  // session.defaultSession.cookies.get({url: 'http://www.github.com'}, (error, cookies) => {
  //   console.log(error, cookies)
  // })
  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  const bounds = mainWindow.getBounds();
  store.set({height: bounds.height, width:bounds.width, x: bounds.x, y: bounds.y})
  const url = mainWindow.getURL();
  store.set({url: url});
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  const bounds = mainWindow.getBounds();
  store.set({height: bounds.height, width:bounds.width, x: bounds.x, y: bounds.y})
  const url = mainWindow.getURL();
  store.set({url: url});
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})