// 粘包处理代码
session.on('data', function (data) {
  var last_pkg = session.last_pkg
  if (last_pkg) {
    var buf = Buffer.concat([last_pkg, data], last_pkg.length + data.length)
    last_pkg = buf
  } else {
    last_pkg = data
  }
  var offset = 0
  var pkg_len = tcppkg.read_pkg_size(last_pkg, offset)
  if (pkg_len < 0) {
    console.error('client 不是完整包！！！')
    session.last_pkg = last_pkg // 这行是我自己加的，感觉不加有问题
    return
  }
  // offset + pkg_len <= last_pkg.length 这个成立，则至少是读取到了一个完整包
  while (offset + pkg_len <= last_pkg.length) {
    var cmd_buf = Buffer.allocUnsafe(pkg_len - 2)
    last_pkg.copy(cmd_buf, 0, offset + 2, offset + pkg_len)
    // 网关收到业务进程信息
    on_recv_cmd_server_return(session, cmd_buf)
    offset += pkg_len
    // 包处理完
    if (offset >= last_pkg.length) {
      break
    }
    pkg_len = tcppkg.read_pkg_size(last_pkg, offset)
    //if(pkg_len < 0){break;}
  }
  if (offset >= last_pkg.length) {
    last_pkg = null
  } else {
    var buf = Buffer.allocUnsafe(last_pkg.length - offset)
    last_pkg.copy(buf, 0, offset, last_pkg.length)
    last_pkg = buf
  }
  session.last_pkg = last_pkg
})

// 打包+读取包长度的代码
var tcppkg = {
  /*** 返回值len 包含包头 + 包体 2部分 长度之和*
   *  @param pkg_data*
   *  @param offset*
   *  @returns {*}
   */
  read_pkg_size: function (pkg_data, offset) {
    if (offset > pkg_data.length - 2) {
      return -1
    }
    var len = pkg_data.readUInt16LE(offset)
    return len
  },
  package_data: function (data) {
    // 代替data.length即可，否则不支持汉字
    var data_len = Buffer.from(data).length
    var buf = Buffer.allocUnsafe(2 + data_len);
    // 可见写入的这个长度包含: 包头 + 包体
    buf.writeInt16LE(2 + data_len, 0)
    buf.fill(data, 2)
    return buf
  }
}
