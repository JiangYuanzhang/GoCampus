// 全局对象
const app = getApp()
const devmode = false;
// token工具类
var token = {
	devmode:devmode, // 开发模式
	// 是否失效
	invalid: function (obj) {
		// 将现在时间戳与token过期时间戳比较
		if (new Date().getTime() > app.globalData.tokenInvalidTime) {
			return true
		}

		// 未过期
		return false
	},

	// 获取token
	generateToken: function (obj) {
		// 调用微信API获取登录code
		wx.login({
			// 成功回调
			success: res => {
				// 发起普通请求
				wx.request({
					// 接口地址
					url: devmode?'http://192.168.1.108:8080/api/v1/token':'https://www.poisoner.cn/api/v1/token',
					// 数据
					data: {
						wx_jscode: res.code ,
            expire: obj.expire?obj.expire:3600
					},
					// 请求方式
					method: 'GET',
					// 成功回调
					success: obj.success ? obj.success : () => {},
					// 失败回调
					fail: obj.fail ? obj.fail : () => {},
					// 执行完成回调
					complete: obj.complete ? obj.complete : () => {}
				})
			},
			// 失败回调
			fail: obj.fail ? obj.fail : () => {}
		})
	}
}

// 导出工具
module.exports = {
	token: token
}