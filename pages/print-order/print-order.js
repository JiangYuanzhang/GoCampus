// pages/print-order/print-order.js
import {
  request
} from "../../service/requestService.js";
import {
  token
} from "../../service/tokenService.js";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    printWebPageUrl: "",
  },
  address:"https://wechat.zhongbr.cn/static/upload-file.html",
  params:"",
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    token.generateToken({
      expire:300,//传递给webview的token有效时间5分钟
      success:res=>{
        this.setParamsToWebview("src",options.src);
        this.setParamsToWebview("token",res.data.data.token);
        this.setParamsToWebview("expire",res.data.data.expire);
        this.setData({ printWebPageUrl:this.address+this.params});    
      }
    })
    // 通过事件通道，获取上一个页面的回调
    let eventChanel = this.getOpenerEventChannel();
    eventChanel.once(options.callbackCode,(obj)=>{
      this.fileHandler = obj.fileHandler?obj.fileHandler:(file)=>{console.log('webview choosefile',file);
      console.log("设置文件处理器成功");
    };
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 通过url参数向webview传递参数
   */
  setParamsToWebview:function(key,value){
    key = encodeURI(key);
    value = encodeURI(value);
    this.params += `${this.params.indexOf('?')==-1?'?':'&'}${key}=${value}`;
  },


  /**
   * 接收webview传来的参数
   */
  handleWebviewMessage:function(params) {
    let message = JSON.parse(params.detail.data[0]);
    this.fileHandler(message);
  }
})