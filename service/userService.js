// 全局对象
const app = getApp()

// 引入其他工具类
import {
	request
} from 'requestService.js'

// 用户服务工具类
var userService = {

	// 绑定学号
	bind: function (obj) {
		// 发起带token的请求
		request.withToken({
			// 执行体
			execute: res => {
				// 发起普通请求
				request.common({
					// 接口地址
					url: request.url1 + '/login',
					// 数据
					data: {
						username: obj.username,
						password: obj.password,
						type: 0,
						token: res.data.token
					},
					// 请求方式
					method: 'POST',
					// 请求头
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					// 成功回调
					success: res => {
						// 执行成功
						if (res.data.code === 200) {
							// 成功回调
							obj.success ? obj.success(res.data) : () => {}
						} else {
							// 绑定失败回调
							obj.fail ? obj.fail(res.data) : () => {}
						}
					},
					// 请求失败回调
					fail: obj.catch ? obj.catch : () => {}
				})
			},
			// 请求失败回调
			fail: obj.catch ? obj.catch : () => {}
		})
	},

	// 上传基本信息
	uploadUserPublicInfo: function(obj){
		obj = obj ? obj : {};
		wx.getUserInfo({
			success: (res) => {
				let userInfo = res.userInfo;
				wx.setStorageSync('userInfo', res.userInfo)
				app.globalData.userInfo = res.userInfo
				request.withToken({
					execute: res => {
						request.common({
							url:request.url2+'upload-user-info'+'?token='+res.data.token,
							method:'POST',
							data: {
								nick_name: userInfo.nickName,
								avatar_url: userInfo.avatarUrl,
								gender: userInfo.gender,
								city: userInfo.city,
								province: userInfo.province,
								country: userInfo.country
							},
							header: {
								'content-type': 'application/x-www-form-urlencoded'
							},
							success:obj.success?obj.success:()=>{},
							fail:obj.fail?obj.fail:()=>{}
						});
					},
					fail: obj.fail?obj.fail:()=>{}
				})
			},
			fail: (res) => {
				wx.showModal({
					cancelColor: 'cancelColor',
					content:"获取昵称头像失败，请授予权限后使用小程序。",
					title:"温馨提示"
				})
			},
			complete: (res) => {},
		})
	}
}

// 导出工具
module.exports = {
	userService: userService
}