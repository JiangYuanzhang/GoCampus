// 全局对象
const app = getApp()

// 引入其他工具类
import {
	token
} from 'tokenService.js'

// 发送请求工具类
var request = {

	// 后端地址1
	url1:  token.devmode?'http://192.168.1.108:8000/api':'https://wechat.poisoner.cn/api',

	// 后端地址2
	url2: token.devmode?'http://192.168.1.108:8080/api/v1/':'https://www.poisoner.cn/api/v1/',
	url2v2:token.devmode?'http://192.168.1.108:8080/api/v2/':'https://www.poisoner.cn/api/v2/',

	// 普通请求
	common: function (obj) {
		// 微信官方API
		wx.request({
			// 接口地址
			url: obj.url,
			// 数据
			data: obj.data ? obj.data : {},
			// 请求头
			header: obj.header ? obj.header : {
				'content-type': 'application/json'
			},
			// 超时时间
			timeout: obj.timeout ? obj.timeout : 60000,
			// 请求方式
			method: obj.method ? obj.method : 'GET',
			// 返回数据格式
			dataType: obj.dataType ? obj.dataType : 'json',
			// 响应数据类型
			responseType: obj.responseType ? obj.responseType : 'text',
			// 开启 http2
			enableHttp2: obj.enableHttp2 ? obj.enableHttp2 : false,
			// 开启 quic
			enableQuic: obj.enableQuic ? obj.enableQuic : false,
			// 开启 cache
			enableCache: obj.enableCache ? obj.enableCache : false,
			// 接口调用成功的回调函数
			success: obj.success ? obj.success : () => {},
			// 接口调用失败的回调函数
			fail: obj.fail ? obj.fail : () => {},
			// 接口调用结束的回调函数（调用成功、失败都会执行）
			complete: obj.complete ? obj.complete : () => {}
		})
	},

	// 带token的请求
	withToken: function (obj) {
		// token失效则重新获取
		if (token.invalid()) {
			// 获取token
			token.generateToken({
				// 成功回调
				success: res => {
					// 成功结果
					if (res.data.code === 200) {
						// 将token存放
						app.globalData.token = res.data.data.token
						// 生成token失效时间
						app.globalData.tokenInvalidTime = new Date().getTime() + res.data.data.expire * 1000
						// 执行待执行请求
						if (obj.execute) {
							obj.execute(res.data)
						}
					} else {
						// 错误结果（执行失败回调）
						if (obj.fail) {
							obj.fail(res)
						}
					}
				},
				// 失败回调
				fail: obj.fail ? obj.fail : () => {}
			})
		}
		// token未失效
		else {
			// 参数体
			let res = {
				code: 200,
				data: {
					token: app.globalData.token
				},
				msg: 'token is avaliable .'
			}

			// 执行待执行请求
			if (obj.execute) {
				obj.execute(res)
			}
		}
	}
}

// 导出工具
module.exports = {
	request: request
}