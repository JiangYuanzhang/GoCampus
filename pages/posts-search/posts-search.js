// 全局对象
const app = getApp()

// 导入答疑服务工具
import {
	qaService
} from '../../service/qaService'

// 页面对象
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 导航条
		navBar: {
			// 上内边距
			paddingTop: app.globalData.menuButton.top - 2,
			// 内容区高度
			contentHeight: app.globalData.menuButton.bottom - app.globalData.menuButton.top + 4,
			// 导航条高度
			height: app.globalData.menuButton.bottom + 10
		},
		// 搜索关键字
		keyword: '',
		// 帖子数据
		posts: {
			page: 0,
			hasOver: false,
			dataList: []
		}
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

	},

	/**
	 * 返回
	 */
	back: function () {
		// 返回上一页
		wx.navigateBack()
	},

	/**
	 * 搜索
	 */
	search: function (e) {
		// 表单验证
		if (e.detail.value == '') {
			wx.showToast({
				title: '您还没有输入',
				icon: 'none'
			})

			return
		}

		// 更新数据
		this.data.keyword = e.detail.value
		// 重置数据
		this.setData({
			'posts.page': false,
			'posts.hasOver': false,
			'posts.dataList': []
		})

		// 显示加载
		wx.showLoading({
			title: '搜索中',
			mask: true
		})

		// 搜索数据
		qaService.search({
			page: 0,
			keyword: e.detail.value,
			success: res => {
				// 更新数据及页面
				this.setData({
					'posts.dataList': res.data.posts
				})

				// 是否有数据
				if (res.data.posts.length == 0) {
					wx.showToast({
						title: '没有相关帖子',
						icon: 'none'
					})

					return
				}

				// 检验是否无更多数据
				if (res.data.posts.length < 10) {
					this.data.posts.hasOver = true
				}

				// 更新页面
				this.setData({
					posts: this.data.posts
				})

				// 隐藏加载
				wx.hideLoading()
			},
			fail: res => {
				// 隐藏加载
				wx.hideLoading()
			}
		})
	},

	/**
	 * 触底获取更多
	 */
	getMore: function () {
		if (!this.data.posts.hasOver) {
			// 页面数加1
			this.data.posts.page++

			// 提示加载
			wx.showLoading({
				title: '加载中',
				mask: true
			})

			// 调用答疑服务工具的读取帖子列表方法
			qaService.search({
				page: this.data.posts.page,
				keyword: this.data.keyword,
				// 成功回调
				success: res => {
					// 更新数据
					this.data.posts.dataList = this.data.posts.dataList.concat(res.data.posts)

					// 无更多数据
					if (res.data.posts.length < 10) {
						this.data.posts.hasOver = true
					}

					// 更新页面
					this.setData({
						posts: this.data.posts
					})

					// 隐藏加载
					wx.hideLoading()
				},
				// 失败回调
				fail: res => {
					// 错误提示
					wx.showToast({
						title: '获取数据失败了',
						icon: 'none'
					})

					// 页数减1
					this.data.posts.page--
				}
			})
		}
	}
})