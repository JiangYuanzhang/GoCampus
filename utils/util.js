// 全局对象
var app = getApp()

import {
  token
} from '../service/tokenService';

// 时间转换
var formatSendTime = function(time) {
  var now = new Date().getTime() / 1000

  if (now - time < 60) {
    return parseInt(now - time) + '秒前'
  } else if (now - time < 60 * 60) {
    return parseInt((now - time) / 60) + '分钟前'
  } else if (now - time < 24 * 60 * 60) {
    return parseInt((now - time) / 60 / 60) + '小时前'
  } else if (now - time < 3 * 24 * 60 * 60) {
    return parseInt((now - time) / 24 / 60 / 60) + '天前'
  } else {
    var date = new Date(time * 1000)
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate() 

    month = month < 10 ? '0' + month : month
    day = day < 10 ? '0' + day : day

    return year + '年' + month + '月' + day + '日'
  }
}

var formatTime = function(time, fmt) {
  let that = new Date(time * 1000);
  var o = {
    "M+": that.getMonth() + 1,
    "d+": that.getDate(),
    "H+": that.getHours(),
    "m+": that.getMinutes(),
    "s+": that.getSeconds(),
    "S+": that.getMilliseconds()
  };
  //因为date.getFullYear()出来的结果是number类型的,所以为了让结果变成字符串型，下面有两种方法：
  if (/(y+)/.test(fmt)) {
    //第一种：利用字符串连接符“+”给date.getFullYear()+""，加一个空字符串便可以将number类型转换成字符串。
    fmt = fmt.replace(RegExp.$1, (that.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      //第二种：使用String()类型进行强制数据类型转换String(date.getFullYear())，这种更容易理解。
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(String(o[k]).length));
    }
  }

  return fmt;
}

function requestWithToken(args) {
  // 如果token正确
  if (token.invalid) {
    token.generateToken({
      success: res => {
        let token = res.data.data.token;
        args.success({
          token: token
        });
      }
    })
  } else {
    args.success({
      token: app.globalData.token
    });
  }
}

// 导出工具
module.exports = {
  formatSendTime: formatSendTime,
  formatTime:formatTime,
  requestWithToken: requestWithToken
}