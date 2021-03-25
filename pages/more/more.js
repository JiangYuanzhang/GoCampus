// pages/more/more.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiper: [{
        cover: 'http://01.minipic.eastday.com/20170417/20170417000033_d41d8cd98f00b204e9800998ecf8427e_25.jpeg'
      },
      {
        cover: 'http://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/ac345982b2b7d0a2bc4e8bc1cdef76094a369ae3.jpg'
      },
      {
        cover: 'http://gss0.baidu.com/9fo3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/a044ad345982b2b76aaabfd933adcbef76099bf2.jpg'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 选中tab项
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    
  },
  grades: function () {
    console.log(app.globalData.hasLogin)
    if (app.globalData.hasLogin) {
       wx.navigateTo({
         url: '/pages/grades/grades',
       }) } 
    else {
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "请绑定学号以后再进行此操作！"
      }); }
  },
  ecard: function () {
    if (app.globalData.hasLogin) {
      wx.navigateTo({
        url: '/pages/ecard/ecard',
      })
    }
    else {
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "请绑定学号以后再进行此操作！"
      });
    }
  },
  curriculum: function () {
    if (app.globalData.hasLogin) {
      wx.navigateTo({
        url: '/pages/curriculum/curriculum',
      })
    }
    else {
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "请绑定学号以后再进行此操作！"
      });
    }
  },
  calendar: function () {
    if (app.globalData.hasLogin) {
      wx.navigateTo({
        url: '/pages/calendar/calendar',
      })
    }
    else {
      wx.showModal({
        showCancel: false,
        title: "提示",
        content: "请绑定学号以后再进行此操作！"
      });
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})