// pages/ecard/ecard.js
const app = getApp()
// 引入请求工具
import {
  request
} from '../../service/requestService.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let money
    wx.showLoading({
      title: '查询中',
    })
    request.withToken({
      execute: res => {
        wx.request({
          url: request.url1 + "/card",
          data: {
            token: res.data.token,
            username: wx.getStorageSync('username'),
            password: wx.getStorageSync('password'),
            
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: res => {
            wx.showToast({
              title: '查询成功',
              icon: 'success'
            })            
            this.setData({
              money: res.data.data.money
            })

          },
          //fail: res.fail ? res.fail : () => { },
        })
      },
      //fail: res.fail ?res.fail : () => { }
    })
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  }
})