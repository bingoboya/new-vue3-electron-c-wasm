# electron-vite-template
## https://cn-evite.netlify.app/guide/debugging.html
An Electron application with Vue and TypesSript

# yarn dev => 本地开发运行
以下是各个平台打包命令
## build:win 
## build:win32
## build:win64
## build:mac
## build:linux


# 比如执行该（build:win64）命令打包后，在dist目录下找到 .exe安装程序，将该 .exe程序移动到一个空文件夹并双击进行安装该程序即可
 

 使用electron-builder打包，打包配置文件是根目录下的electron-builder.yml, [asarUnpack]属性是设置不压缩的文件，本项目中设置了 public下的文件'都不压缩，且单独提取出来放到打包后的根目录下的resources/app.asar.unpacked/public文件夹下，electron/index.ts主进程代码中调用PIPServe.exe时需要找通过以下两种方式，分别在开发和打包两种环境下调用PIPServe.exe
## path.join(path.resolve(), 'resources/app.asar.unpacked/public/PIPServe.exe') // 打包之后执行文件所在的位置
## path.join(path.resolve(), 'public/PIPServe.exe') // 开发环境下执行文件的位置


## 浏览器中调试： 执行 yarn dev，浏览器中直接访问  Local: http://127.0.0.1:[port] 这个本地服务,具体地址看本地服务