import { app, shell, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron'
// import { screen } from 'electron'
import * as path from 'path'
import * as fs from 'fs-extra'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import socketServer from './createSocketServer'

const net = require('net')
const child_process = require('child_process')
const controller = new AbortController()
const { signal } = controller
process.on('unhandledRejection', (error) => {
  // 用node process的全局unhandledRejection事件来处理
  console.log('全局处理promise.catch==>', error)
})
let workerProcess: { unref: () => void; pid: number } | null
let isConnectting = false // 是否正在通信中
let mainWindow: BrowserWindow | null = null
let myStream: fs.WriteStream
// const rootPath = path.resolve()
// const filePath = 'nested1'
// const dirPath = path.join(rootPath, filePath)
// TODO
// const createWriteFileStream = async (): Promise<void> => {
//   // const fileNames = await fs.promises.readdir(rootPath);
//   await fs.promises.mkdir(dirPath, { recursive: true })
//   // 返回值 myStream 代表文件可写流对象, 这个可写流是在主进程启动时就创建了，这个可读流生成的文件只有在该可读流关闭后才可以删除掉，可以主动调用 myStream.end()关闭该可读流或者关掉electron主进程
//   myStream = await fs.createWriteStream(`${dirPath}/file1.txt`, {
//     flags: 'a', // 写流不能用r，会报错, 可以用'a'表示追加, w 每次会清空文件
//     encoding: 'utf8', // 不写默认是utf8
//     // start: 0, //从第几个字节开始写
//     autoClose: true // 写完是否自动关闭
//     // highWaterMark: 3 // 这是安全线，默认写的水位线是16k，即16 * 1024。表示总共写入的大小在这个范围内表示安全的,因为这代表着链表缓存区的大小，如果满了，那么就需要rs.pause()暂停读取，等缓存区的内容开始写入，留出一部分空间后，再去写入。如果超过这个值，虽然不会阻止你写入，但是会告诉你已经超了这条安全线了。特别注意：超过这个水位线也没事，只是超过会myStream.write()会返回给你false，不超过返回的是true
//   })
//   // myStream.on('open', (fd) => {
//   //   console.log('open-----file', fd); // 文件描述符
//   // });
//   // myStream.end() 传了参数，等价于 先调用myStream.write(内容)把内容写入，然后调用myStream.close()
//   // 不传参数，等价于直接调用myStream.close()
//   // 如果连续多次使用myStream.end(有参数)方法，如果连续end()方法都有参数，那么会报错，因为第一次end(有参数)就代表写入内容，并关闭文件，第二次再end(有参数)，内容就无法写入了，因为已经关闭文件了，所以会报错。
//   // 但是如果myStream.end(有参数)后面调用没有参数的myStream.end()，是没关系的，因为第一次虽然关闭了，但是第二次myStream.end()没有参数，只是又做了一次关闭操作，重复关闭不会有问题。
//   // end 函数要在 killExe函数 调用时触发, 如果myStream这个可写流对象不调用close方法关闭掉的情况下，这个可写流对应的文件是删除不掉的
//   // myStream.end('写入完毕！');
//   // myStream.end();
//   // myStream.on('drain', () => {
//   //   // 触发drain事件需要同时满足两个条件
//   //   // 当正在写入的数据的字节数 + 缓存中的字节数 之和，超过highWaterMark
//   //   // 将这些数据(正在写入和缓存中的)写入完毕
//   //   console.log('myStream write ok!');
//   // });
// }
// createWriteFileStream()

function runExec(exePath: any, _cmdStrServer: any): void {
  // 使用 spawn 运行 PIPServe.exe，spawn运行的子进程会在主进程关闭时一起关闭
  const firstFile = 'bingo.txt' // 必填 一次选取两个文件，根据文件类型区分 [firstFile, secondFile]
  const secondFile = 'gos.md' // 必填
  const timeLine = 2000 // 必填 需要计算的总时间，页面输入，echart中对应横轴0-2000s,
  const step = 0.5 // 非必填 步长， 页面输入
  const num = 2 // 非必填 不记得什么含义
  let frequency = 2000 // 非必填(有默认值) 发送数据频率 ms
  frequency = 20
  const runExeParams = [firstFile, secondFile, timeLine, step, num, frequency] || []
  workerProcess = child_process.spawn(exePath, runExeParams, {
    signal,
    detached: true, // 将子进程 exe与主进程分离，如果不分离，不知道为什么exe执行到第571个就自己停止了
    stdio: 'ignore' // 一个长时间运行的进程示例，通过分离并忽略其父 stdio文件描述符，以忽略父文件的终止
    // windowsHide: false // 隐藏子进程的窗口
  })
  workerProcess?.unref() // 默认情况下，父级将等待分离的子级退出。要防止父级等待给定subprocess退出，请使用该 subprocess.unref()方法。这样做会导致父级的事件循环不将子级包含在其引用计数中，从而允许父级独立于子级退出，除非子级和父级之间存在已建立的 IPC 通道。
  // 使用 exec 运行 PIPServe.exe， exec 运行的子进程不会在主进程关闭时一起关闭
  // child_process.exec(_cmdStrServer, {}); // 调用服务端（会显示exe窗口），需要启动
  // workerProcess = child_process.exec(`${exePath} 1`, (err, stdout, stderr) => {
  //   console.log('exec-> exe', err, stdout, stderr);
  // }); // 调用服务端（不会显示exe窗口），需要启动
  console.log('run-exe')
  mainWindow?.webContents.send('sendmsg-from-main-process-to-APP.vue', `调起-exe`)
  // child_process.exec(_cmdStrClient, {}) // 客户端，不需要启动
}

const startExe = async (): Promise<void> => {
  // 启动新的exe之前先杀掉之前启动的exe
  // await killExe()
  // const buildExePath = path.join(path.resolve(), 'resources/app.asar.unpacked/public/PIPServe.exe') // 打包之后执行文件所在的位置
  const buildExePath = path.join(path.resolve(), 'resources/app.asar.unpacked/public/MySocket.exe') // 打包之后执行文件所在的位置
  const devExePath = path.join(path.resolve(), 'public/MySocket.exe') // 开发环境下执行文件的位置
  // const devExePath = path.join(path.resolve(), 'public/PIPServe.exe') // 开发环境下执行文件的位置
  const exePath = is.dev ? devExePath : buildExePath
  const _cmdStrServer = `start ${exePath}`
  await runExec(exePath, _cmdStrServer) // 调用子进程
}
ipcMain.on('startExe', () => {
  startExe()
})
// TODO
// const MockData = () => {
//   const arr: any = []
//   for (let index = 0; index < 10000; index++) {
//     arr.push({
//       title: `列表项${index}列表项列表项列表项列表项列表项列表项` + index,
//       index: index
//       // checked: false,
//     })
//   }
//   mainWindow?.webContents.send('vilturaldata', arr)
// }
ipcMain.on('openDialog', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  mainWindow?.webContents.send('configfilePaths', filePaths)
  console.log('file-Paths', filePaths)
})

const connectserver = (): void => {
  if (!workerProcess || isConnectting) {
    dialog.showMessageBox(mainWindow!, {
      type: 'error',
      title: '注意',
      message: isConnectting
        ? '正在通信中，不能重复通信!'
        : '没有运行中的进程，不能通信！请先运行进程!',
      buttons: []
    })
    return
  }
  const PIPE_NAME = 'test'
  const PIPE_NAME2 = 'test2'
  const PIPE_PATH = '\\\\.\\Pipe\\' + PIPE_NAME
  const PIPE_PATH2 = '\\\\.\\Pipe\\' + PIPE_NAME2
  console.log('into=====>communi-cation-Exe')

  const client2 = net.connect(PIPE_PATH2, () => {
    console.log('connect to PIPE2===')
  })

  client2.on('data', (data: { toString: () => any }) => {
    console.log('pipe2-========-data', data.toString())
  })

  client2.write('bingowrite')

  // TODO let client = net.createConnection(PIPE_PATH, () => {
  let client = net.connect(PIPE_PATH, () => {
    isConnectting = true // 设置 是否正在通信的状态
  })
  // const firstKeyArr = []
  client.on('data', (data: { toString: () => any }) => {
    const res = data?.toString()
    console.log('与exe通信1', res)

    mainWindow?.webContents.send('sendmsg-from-main-process-to-APP.vue', res)

    // const parseRes = JSON.parse(res)
    // const firstKey = Object.keys(parseRes)[0]
    // firstKeyArr.push(firstKey as never)
    // const floatArr = parseRes[firstKey] // 所有的浮点数的集合
    // const selectedIndex = [0, 3, 6, 12, 9999] // 要给渲染进程中曲线图中需要渲染的曲线对应的下标位置
    // const selectedFloatArr = [] // 选中的浮点数的集合
    // selectedIndex.forEach((item) => selectedFloatArr.push(floatArr[item] as never))
    // console.log('selectedFloatArr=======', firstKey, firstKeyArr, firstKeyArr.length, selectedFloatArr);

    // l('client----on-----data1', data.toString());
    // l('parse data----', firstKey, '=======', parseRes[firstKey], '======', parseRes);
    // 由渲染进程触发
    // mainWindow?.webContents.send(
    //   'send-msg-from-main-process',
    //   selectedFloatArr,
    //   // `bingo-exe发出的类型:${typeof data}-${typeof res}-${Object.keys(res)}-数据：${res}`,
    // );
    // mainWindow && data && logFun(data);
    // 测试pipeline
    // pipeline(data, myTransform, logFun);
  })
  client.on('end', () => {
    console.log('disconnect from server')
    client = null
  })
  client.on('error', (err: any) => {
    console.log('not connected', err)
  })
}
ipcMain.on('communicationExe', () => {
  // if (process.platform === 'win32') {
  connectserver() // 与exe子进程通信
  // }
  // 接收到渲染进程后，主进程会给渲染进程发送消息，不是针对所有窗口发送
  // e.sender.send('b', '主进程收到你的消息了,并告知你一声');
})

const killExe = async (): Promise<void> => {
  if (!workerProcess) {
    // 如果当前没有运行的进程
    return
  }
  myStream.end(`写入完毕！`)
  myStream.end()
  process.kill(workerProcess.pid)
  workerProcess = null
  isConnectting = false // 设置 是否正在通信的状态
}
// 由渲染进程触发-杀掉exe程序
ipcMain.on('killExe', () => {
  killExe()
})

function createWindow(): void {
  // const displayWorkAreaSize = screen.getAllDisplays()[0].workArea;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 870,
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
      sandbox: false,
      nodeIntegrationInWorker: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // mainWindow &&
    //   socketServer.createSocketServer(
    //     {
    //       port: 8099,
    //       host: '127.0.0.1',
    //       exclusive: true
    //     },
    //     mainWindow
    //   )
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
  mainWindow.webContents.openDevTools()
  globalShortcut.register('Command+Control+g', () => {
    mainWindow?.webContents.toggleDevTools()
  })
  
}

ipcMain.handle('checkout-RootDir', async () => {
  const rootFileNames = await fs.promises.readdir(path.resolve())
  console.log('rootFileNames1', rootFileNames)
  const exePaths = await fs.promises.readdir(path.join(__dirname))
  return {
    rootFileNames,
    exePaths
  }
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

const isFirstInstance = app.requestSingleInstanceLock()

if (!isFirstInstance) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.focus()
    }
  })
}

// const logFun = async (data: string | Uint8Array): Promise<void> => {
//   // TODO 现在追加的是utf8格式的，看看能不能追加二进制格式或者buffer格式，然后再将文件压缩，或者一边追加数据，一边压缩
//   // TODO 需求是要用户可以暂停，可以继续，exe程序不能暂停生成数据，所以渲染图表使用的数据只能是本地的文件或者压缩文件中读取
//   await fs.promises.appendFile(`${dirPath}/file1.txt`, data, 'utf8');
//   // if (totalCount % 500 === 0) {
//   // console.log('con-sole---log---', data.toString());
//   // }
// };

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('before-quit', () => {
  if (process.platform !== 'darwin') {
    // killExe()
    // socketServer.handleExeFunc(2103) // 退出计算，关闭exe
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
