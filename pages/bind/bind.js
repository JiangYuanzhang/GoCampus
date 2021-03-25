// 全局对象
const app = getApp()

// 引入工具
import {
	userService
} from "../../service/userService"

// 页面对象
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

		// 学号
		username: '',
		// 密码
		password: '',
		userAgree: false
	},

	/**
	 * 输入学号
	 */
	inputUsername: function (e) {
		// 更新数据
		this.data.username = e.detail.value
	},

	/**
	 * 输入密码
	 */
	inputPassword: function (e) {
		// 更新数据
		this.data.password = e.detail.value
	},

	/**
	 * 绑定
	 */
	hasUserAgree: function(){
		this.setData({
			userAgree:true
		})
	},
	hasUserdisAgree: function(){
		this.setData({
			userAgree:false
		})
	},
	bind: function () {
		
		// 表单验证
		if (this.data.username == '') {
			// 错误提示
			wx.showToast({
				title: '请输入学号',
				icon: 'none'
			})

			return
		}

		// 表单验证
		if (this.data.password == '') {
			// 错误提示
			wx.showToast({
				title: '请输入密码',
				icon: 'none'
			})

			return
		}
		if(!this.data.userAgree){
			wx.showToast({
				title: '请先阅读用户协议',
				icon: 'none'
			})

			return
		}

		// 执行中提示
		wx.showLoading({
			title: '验证中',
			mask: true
		})

		// 调用用户服务工具的绑定学号方法
		userService.bind({
			// 学号
			username: this.data.username,
			// 密码
			password: this.data.password,
			// 成功回调
			success: res => {
				// 保存数据
				wx.setStorageSync('hasBind', true)
				wx.setStorageSync('username', this.data.username)
				wx.setStorageSync('password', this.data.password)
				wx.setStorageSync('studentInfo', res.data)

				// 更新全局变量
				app.globalData.studentInfo = {
					bind: true,
					info: res.data
				}

				// 成功提示
				wx.showToast({
					title: '绑定成功',
					icon: 'success'
				})

				// 自动返回上一页
				setTimeout(() => {
					wx.navigateBack()
				}, 1500)
			},
			// 绑定失败回调
			fail: () => {
				// 错误提示
				wx.showToast({
					title: '账号或密码错误',
					image: '/images/error.png'
				})
			},
			// 请求失败回调
			catch: () => {
				// 错误提示
				wx.showToast({
					title: '服务器异常',
					image: '/images/error.png'
				})
			}
		})
	}
})