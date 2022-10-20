import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import * as path from 'path'
import fs from 'fs-extra'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// TODO 打包后的exe或者dmg文件只有单独的文件，没有安装文件夹，public的静态资源也被打包到out文件夹，执行程序没办法操作调用c++程序
function createWindow(): void {
  // const displayWorkAreaSize = screen.getAllDisplays()[0].workArea;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    // width: parseInt(`${displayWorkAreaSize.width * 0.95}`, 10),
    // height: parseInt(`${displayWorkAreaSize.height * 0.85}`, 10),
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : {}),
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  // is.dev && mainWindow.webContents.openDevTools()
  globalShortcut.register('Command+Control+g', () => {
    mainWindow.webContents.toggleDevTools()
  })
}

ipcMain.handle('checkout-RootDir', async (_, data) => {
  console.log('rootFileNames1', data)
  shell.beep()
  const rootFileNames = await fs.promises.readdir(path.resolve())
  console.log('rootFileNames2', rootFileNames)
  const exePaths = await fs.promises.readdir(path.join(__dirname))
  return {
    rootFileNames,
    exePaths
  }
})

const logFun = async (): Promise<void> => {
  await fs.promises.appendFile(`${path.resolve()}/file1.txt`, 'asdasdasfa', 'utf8')
}

ipcMain.handle('aaa', async () => {
  logFun()
  const env = await process.env.NODE_ENV_ELECTRON_VITE
  const isPackaged = await app.isPackaged
  return { env, isPackaged }
})

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
