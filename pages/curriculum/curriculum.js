// pages/grades/grades.js
const app = getApp()
// 引入请求工具
import {
  request
} from '../../service/requestService.js'
const _time = 1614441600 //开学时间
Page({

  /**
   * 页面的初始数据
   */
  data: {
    week: [
      '第1周',
      '第2周',
      '第3周',
      '第4周',
      '第5周',
      '第6周',
      '第7周',
      '第8周',
      '第9周',
      '第10周',
      '第11周',
      '第12周',
      '第13周',
      '第14周',
      '第15周',
      '第16周',
      '第17周',
      '第18周',
      '第19周',
      '第20周',
    ],
    index: 0,
    colorArrays: ["#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
  },
  bindPickerChange: function (e) {
    var week = parseInt(e.detail.value) + 1
    var result = []
    var timetable = wx.getStorageSync('timetable')

    for (let n = 0; n < timetable.length; n++) {

      if (timetable[n][0] == week) {

        //console.log(subjects[n])
        result.push(timetable[n])

      }
    }
    console.log("result", result)

    this.setData({
      index: e.detail.value,
      results: result
    })


  },

  btnclick: function (e) {
    wx.showLoading({
      title: '获取中',
    })

    request.withToken({
      execute: res => {
        wx.request({
          url: request.url1 + "/timetable",
          data: {
            token: res.data.token,
            username: wx.getStorageSync('username'),

          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: res => {

            /*遍历课表*/
            console.log(res)
            let numb = res.data.data.courses
            var week = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            var subjects = []

            for (let k = 0; k < week.length; k++) {
              for (let i = 0; i < numb.length; i++) {

                for (let j = 0; j < numb[i].schedules.length; j++) {

                  //for (let k = 0; k < numb[i].schedules[j].week.length;k++){

                  for (let m = 0; m < numb[i].schedules[j].week.length; m++) {
                    if (numb[i].schedules[j].week[m] == week[k]) {
                      var subject = [
                        numb[i].schedules[j].week[m],
                        numb[i].name,
                        numb[i].teacher,
                        numb[i].schedules[j].classroom,
                        numb[i].schedules[j].day,
                        numb[i].schedules[j].sections
                      ]
                      //subjects[k] = subject
                      subjects.push(subject)
                    }

                  }
                }

              }

            }
            wx.setStorage({
              key: "timetable",
              data: subjects
            })
            wx.showToast({
              title: '获取成功',
              icon: 'success'
            })

            var result = []

            var now = Math.ceil((Math.round(new Date() / 1000) - this._time) / 60 / 60 / 24 / 7)
            for (let n = 0; n < subjects.length; n++) {

              if (subjects[n][0] == now) {

                //console.log(subjects[n])
                result.push(subjects[n])

              }
            }
            this.setData({
              index: now - 1,
              results: result,
              hastimetable: true
            })

          },

        })
      },

    });

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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    //if (wx.getStorageSync('timetable')) {
    var result = []
    var timetable = wx.getStorageSync('timetable')
    console.log(timetable)
    
    var now = Math.ceil((Math.round(new Date() / 1000) -_time) / 60 / 60 / 24 / 7)
    console.log(_time)
    if (timetable.length == 0) {
      this.setData({
        index: now - 1,
        results: result,
        hastimetable: false
      })
    } else {
      for (let n = 0; n < timetable.length; n++) {

        if (timetable[n][0] == now) {

          //console.log(subjects[n])
          result.push(timetable[n])

        }
      }
      this.setData({
        index: now - 1,
        results: result,
        hastimetable: true
      })
    }

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