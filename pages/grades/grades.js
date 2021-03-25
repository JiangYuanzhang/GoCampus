// pages/grades/grades.js
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
    semester: [
      "2019-2020年第2学期", 
      "2019-2020年第1学期", 
      "2018-2019年第2学期", 
      "2018-2019年第1学期",
      "2017-2018年第2学期",
      "2017-2018年第1学期"],
    index: 0,
  },
  bindPickerChange: function (e) {
    var semester = e.detail.value%2
    var years = 2019-parseInt(e.detail.value / 2)
    wx.showLoading({
      title: '查询中',
    })
    request.withToken({
      execute: res => {
        wx.request({
          url: request.url1 + "/score",
          data: {
            token: res.data.token,
            username: wx.getStorageSync('username'),
            years: years,
            semester: 2 - semester,
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
            console.log(res.data.data.subjects)
            this.setData({
              subj: res.data.data.subjects,
              study: res.data.data.others.gpa

            })
            
          },
          //fail: res.fail ? res.fail : () => { },
        })
      },
      //fail: res.fail ?res.fail : () => { }
    });
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
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
    wx.showLoading({
      title: '查询中',
    })
    request.withToken({
      execute: res => {
        wx.request({
          url: request.url1 + "/score",
          data: {
            token: res.data.token,
            username: wx.getStorageSync('username'),
            years:2019,
            semester:2,
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
            console.log(res.data.data.subjects)
            this.setData({
              subj: res.data.data.subjects,
              study: res.data.data.others.gpa
              
            })
            /*let response = res.data; // 服务器返回的消息内容
            response.data.subject(
              (message, index) => {
                response.data.messages[index].operate_time = formatSendTime(message.operate_time);
              }
            )
            let callback = obj.success ? obj.success : (res) => { };
            callback(response);*/
          },
          //fail: res.fail ? res.fail : () => { },
        })
      },
      //fail: res.fail ?res.fail : () => { }
    });
         
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