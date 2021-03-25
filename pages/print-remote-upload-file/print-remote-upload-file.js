import {printService} from '../../service/printService.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webPageAddress:"https://suo.im/6stobK",
    code:"",
    expire:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.generateRemoteUploadCode();
    // 通过事件通道，获取上一个页面的回调
    let eventChanel = this.getOpenerEventChannel();
    eventChanel.once(options.callbackCode, (obj) => {
      this.fileHandler = obj.fileHandler ? obj.fileHandler : (file) => {
        console.log('remote choosefile', file);
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.polling);
    clearInterval(this.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 清除计时器
    clearInterval(this.polling);
    clearInterval(this.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 复制文本
   */
  copyText:function(e){
    let contents = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: contents,
      success:res=>{
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },

  /**
   * 获取上传码
   */
  generateRemoteUploadCode:function(){
    wx.showLoading({
      title: '加载中',
    })
    printService.generateRemoteUploadCode({
      success:res=>{
        this.setData({
          code:res.code,
          expire:res.expire
        });
        // 设置计时器
        this.timer = setInterval(()=>{
          this.setData({expire:this.data.expire-1});
        },1000);
        // 轮询服务器
        this.polling = setInterval(()=>{
          this.getRemoteUploadFile({auto:true});
        },2000);
      },
      complete:()=>{
        wx.hideLoading();
      }
    })
  },

  /**
   * 查询文件上传的状态
   */
  getRemoteUploadFile:function(args){
    args = args?args:{};
    if(!args.auto) wx.showLoading({
      title: '查询中',
    })
    printService.getRemoteUploadFile({
      code:this.data.code,
      success:res=>{
        console.log(res);
        this.fileHandler(res);// 将获取到的文件信息传递给文件处理器
        if(!args.auto) wx.navigateBack();
        else if(!this.modaling){
          this.modaling = true;
          wx.showModal({
            title: '上传文件成功',
            content: `成功获取到上传的文件"${res.file.name}"，继续下一步操作吧。`,
            showCancel:false,
            confirmText:"继续",
            success:res=>{
              clearInterval(this.polling);
              wx.navigateBack();
            }
          })
        }
      },
      complete:()=>{
        if(!args.auto) wx.hideLoading();
      },
      fail:res=>{
        if(!args.auto) wx.showModal({
          title: '获取文件失败',
          content: '没有获取到你上传的文件的信息哦，确认你已经上传成功了吗？',
          showCancel:false,
          confirmText:"我看看"
        })
      }
    })
  }
})