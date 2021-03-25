// 全局对象
const app = getApp()
import {
  userService
} from '../../service/userService';

// 引入请求工具
import {
  requestWithToken
} from "../../utils/util.js"

// 引入位置服务工具
import {
  qqMap
} from "../../service/locationService"

// 引入答疑板块服务工具
import {
  qaService
} from "../../service/qaService"

// 页面对象
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 导航条
    nav: {
      // 透明度
      opacity: 0,
      // 上内边距
      paddingTop: app.globalData.menuButton.top,
      // 内容高度
      contentHeight: app.globalData.menuButton.bottom - app.globalData.menuButton.top,
      // 导航条高度
      height: app.globalData.menuButton.bottom + 10
    },
    // 是否登录
    hasLogin: app.globalData.hasLogin,
    // 用户信息
    userInfo: app.globalData.userInfo,
    // 学生信息
    studentInfo: {
      bind: false,
      info: {}
    },
    // 位置信息
    location: '',
    // 未读消息数
    unreadMessageNum: 0
   
  },
  openConfirm: function (e) {
    wx.showModal({
      title: '提示',
      content: '是否清除缓存',
      success (res) {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            wx.showToast({  
              title: '清除成功',  
              icon: 'success',  
              duration: 2000  
          })  
          } catch(e) {
            wx.showToast({  
              title: '清除失败',  
              icon: 'error',  
              duration: 2000  
          })  
          }
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 重新拉取用户信息
    if (this.data.hasLogin) {
      this.getUserInfo()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 进行定位
    if (this.data.hasLogin) {
      this.fixLocation()
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 更新状态
    this.setData({
      hasLogin: app.globalData.hasLogin,
      userInfo: app.globalData.userInfo
    })

    // 获取绑定信息
    this.setData({
      studentInfo: app.globalData.studentInfo
    })

    // 选中tab项
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }

    // 获取未读消息
    this.getUnreadMessageNum();
  },

  // 选中tab项


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 获取绑定学生信息
    this.getStudentInfo()
    // 弹起下拉刷新
    wx.stopPullDownRefresh()
  },

  /**
   * 页面滚动监听
   */
  onPageScroll: function (e) {
    // 导航条变换边界
    var bound = 100;

    if (e.scrollTop < bound) {
      this.setData({
        'nav.opacity': e.scrollTop / bound
      })
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#ffffff'
      })
    } else {
      this.setData({
        'nav.opacity': 1
      })
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    }
  },

  /**
   * 登录
   */
  login: function (e) {
    // 允许登录
    if (e.detail.userInfo) {
      // 设置全局变量
      app.globalData.hasLogin = true
      app.globalData.userInfo = e.detail.userInfo
      // 进行本地存储
      wx.setStorageSync('hasLogin', true)
      wx.setStorageSync('userInfo', e.detail.userInfo)
      // 获取并上传用户信息
      this.getUserInfo()
      // 更新页面数据
      this.setData({
        hasLogin: app.globalData.hasLogin,
      })
      // 进行定位
      this.fixLocation()
      //进行跳转
      wx.navigateTo({
        url: '/pages/bind/bind',

      })
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function () {
    userService.uploadUserPublicInfo();
  },

  /**
   * 获取绑定学生信息
   */
  getStudentInfo: function () {
    // 是否绑定
    var bind = wx.getStorageSync('hasBind') ? true : false

    // 绑定则获取学生信息
    if (bind) {
      wx.showLoading({
        title: '刷新中',
        mask: true
      })

      // 进行带token的请求
      requestWithToken({
        success: res => {
          wx.request({
            url: app.globalData.url + '/login',
            method: 'post',
            data: {
              token: app.globalData.token,
              username: wx.getStorageSync('username'),
              password: wx.getStorageSync('password'),
              type: 0
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: res => {
              if (!(res.statusCode == 200)) {
                // 错误提示
                wx.showToast({
                  title: '服务器异常',
                  icon: 'none'
                })

                return
              }

              if (res.data.code == 200) {
                // 成功
                this.setData({
                  studentInfo: {
                    bind: true,
                    info: res.data.data
                  }
                })

                wx.setStorage({
                  data: true,
                  key: 'hasBind',
                })


                // 提示
                wx.showToast({
                  title: '刷新成功',
                  icon: 'none'
                })
              } else {
                // 失败则需重新绑定
                wx.setStorageSync('hasBind', false)
                this.setData({
                  studentInfo: {
                    bind: false,
                    info: {}
                  }
                })
                app.globalData.studentInfo = this.data.studentInfo
                // 错误提示
                wx.showToast({
                  title: '身份失效，请重新绑定',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              // 错误提示
              wx.showToast({
                title: '获取绑定学生信息失败',
                icon: 'none'
              })
            }
          })
        },
        fail: () => {
          wx.showToast({
            title: '获取token失败',
            icon: 'none'
          })
        }
      })
    }
  },

  /**
   * 定位
   */
  fixLocation: function (callback) {
    callback = callback ? callback : () => {};
    // 调用腾讯位置服务对象的获取位置方法
    qqMap.reverseGeocoder({
      // 调用成功
      success: res => {
        // 更新数据及页面
        this.setData({
          location: res.result.address
        })
        // 执行回调
        callback(true)
      },
      // 调用失败
      fail: () => {
        // 调用位置服务工具的是否开启位置授权方法
        locationService.authorize(res => {
          // 已授权
          if (res) {
            // 执行回调
            callback(false)
          } else {
            // 未授权提示
            wx.showToast({
              title: '请在右上角设置中打开位置授权',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  /**
   * 解除绑定
   */
  unbind: function () {
    // 弹窗提示
    wx.showModal({
      title: '提示',
      content: '确定解除绑定？',
      success: res => {
        // 点击确定
        if (res.confirm) {
          // 更改本地存储
          wx.setStorageSync('hasBind', false)
          // 更新全局变量
          app.globalData.studentInfo = {
            bind: false,
            info: {}
          }
          // 更新页面
          this.setData({
            studentInfo: app.globalData.studentInfo
          })
        }
      }
    })
  },

  // 页面js
  play: function () {
    getApp().play()
  },

  // 获取未读的与我相关的消息的个数
  getUnreadMessageNum: function () {
    qaService.getUnreadMessageNum({
      success: res => {
        this.setData({
          unreadMessageNum: res.unread > 99 ? '99+' : res.unread
        })
      }
    })
  },
})