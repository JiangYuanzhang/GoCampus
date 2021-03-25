// 全局对象
App({

	/**
	 * 生命周期函数--监听小程序启动
	 */
  onLaunch: function (options) {
    // 获取系统信息
    this.globalData.systemInfo = wx.getSystemInfoSync()
    // 获取右上角胶囊按钮布局位置信息
    this.globalData.menuButton = wx.getMenuButtonBoundingClientRect()
    // 获取是否登录
    this.globalData.hasLogin = wx.getStorageSync('hasLogin') ? true : false
    // 获取用户信息
    if (this.globalData.hasLogin) {
      this.globalData.userInfo = wx.getStorageSync('userInfo')

      // 获取绑定学生信息
      if (wx.getStorageSync('hasBind')) {
        this.globalData.studentInfo = {
          bind: true,
          info: wx.getStorageSync('studentInfo')
        }
      }
    }
  },

	/**
	 * 全局变量
	 */
  globalData: {
    // 后端地址
    url: 'https://wechat.poisoner.cn/api',
    // 系统信息
    systemInfo: {},
    // 右上角胶囊按钮布局位置信息
    menuButton: {},
    // 是否登录
    hasLogin: false,
    // 用户信息
    userInfo: {},
    // 用户token
    token: '',
    // 用户token过期时间
    tokenInvalidTime: 0,
    // 绑定学生信息
    studentInfo: {
      bind: false,
      info: {}
    }
  }
})