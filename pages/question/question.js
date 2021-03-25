// 全局对象
const app = getApp()

// 引入答疑服务工具
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
			height: app.globalData.menuButton.bottom + 10 + 40
		},
		// 板块列表
		topics: [],
		// 版块选中项
		topicSelected: 0,
		// 数据
		posts: [],
		// 下拉刷新中
		loading: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

		// 获取版块缓存
		let topics = wx.getStorageSync('topics')
		topics = ['全部'].concat(topics ? topics : [])

		// 更新数据及页面
		this.setData({
			topics: topics
		})

		// 从后端获取版块
		qaService.topics({
			// 成功回调
			success: res => {
				// 存储数据
				wx.setStorageSync('topics', res.data.topics)

				let topics = ['全部'].concat(res.data.topics)

				// 初始化每个版块数据
				for (let i = 0; i < topics.length; i++) {
					this.data.posts[i] = {
						page: 0,
						dataList: [],
						hasOver: false
					}
				}

				// 更新数据及页面
				this.setData({
					topics: topics,
					topicSelected: 0
				})

				// 初始化第一个版块页面
				qaService.posts({
					// 页数
					page: 0,
					// 成功回调
					success: res => {
						// 更新数据
						this.data.posts[0].dataList = res.data.posts

						// 检验是否无更多数据
						if (res.data.posts.length < 10) {
							this.data.posts[0].hasOver = true
						}

						// 更新页面
						this.setData({
							posts: this.data.posts
						})
					},
					// 失败回调
					fail: res => {
						// 错误提示
						wx.showToast({
							title: '获取数据失败了',
							icon: 'none'
						})
					}
				})
			}
		})

		// 初始化每个版块数据
		for (let i = 0; i < this.data.topics.length; i++) {
			this.data.posts[i] = {
				page: 0,
				dataList: [],
				hasOver: false
			}
		}
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
		// 选中tab项
		if (typeof this.getTabBar === 'function' && this.getTabBar()) {
			this.getTabBar().setData({
				selected: 0
			})
		}
	},

	/**
	 * 下拉刷新
	 */
	pullDownRefresh: function () {
		// 当前列表索引
		let index = this.data.topicSelected
		// 获取当前帖子列表
		let posts = this.data.posts[index]

		// 获取数据
		posts.page = 0
		posts.hasOver = false

		// 提示加载
		wx.showLoading({
			title: '加载中',
			mask: true
		})

		// 调用答疑服务工具的读取帖子列表方法
		qaService.posts({
			// 页数
			page: posts.page,
			// 版块
			topic: index == 0 ? null : this.data.topics[index],
			// 成功回调
			success: res => {
				// 更新数据
				posts.dataList = res.data.posts

				// 检验是否无更多数据
				if (res.data.posts.length < 10) {
					posts.hasOver = true
				}

				// 更新页面
				this.setData({
					posts: this.data.posts
				})

				// 成功提示
				wx.showToast({
					title: '刷新成功了',
					icon: 'none'
				})
			},
			// 失败回调
			fail: res => {
				// 错误提示
				wx.showToast({
					title: '获取数据失败了',
					icon: 'none'
				})
			}
		})

		// 弹起下拉
		this.setData({
			loading: false
		})
	},

	/**
	 * 上拉触底获取更多数据
	 */
	reachBottom: function () {
		// 当前列表索引
		let index = this.data.topicSelected
		// 获取当前帖子列表
		let posts = this.data.posts[index]

		if (!posts.hasOver) {
			// 页面数加1
			posts.page++

			// 提示加载
			wx.showLoading({
				title: '加载中',
				mask: true
			})

			// 调用答疑服务工具的读取帖子列表方法
			qaService.posts({
				// 页数
				page: posts.page,
				// 版块
				topic: index == 0 ? null : this.data.topics[index],
				// 成功回调
				success: res => {
					// 更新数据
					posts.dataList = posts.dataList.concat(res.data.posts)

					// 无更多数据
					if (res.data.posts.length < 10) {
						posts.hasOver = true
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
	},

	/**
	 * 切换版块
	 */
	selectTopic: function (e) {
		// 获取选择的版块索引
		let index = e.currentTarget.dataset.index

		// 切换选中项
		this.setData({
			topicSelected: index
		})
	},

	/**
	 * 初始化选中版块数据
	 */
	dataInit: function () {
		// 当前选中版块索引
		let index = this.data.topicSelected
		// 获取帖子列表
		let posts = this.data.posts[index]

		// 无数据则获取数据
		if (posts.dataList.length == 0) {
			// 提示加载
			wx.showLoading({
				title: '加载中',
				mask: true
			})

			// 调用答疑服务工具的读取帖子列表方法
			qaService.posts({
				// 页数
				page: posts.page,
				// 版块
				topic: this.data.topics[index],
				// 成功回调
				success: res => {
					// 更新数据
					posts.dataList = res.data.posts

					// 检验是否无更多数据
					if (res.data.posts.length < 10) {
						posts.hasOver = true
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
				}
			})
		}
	},

	/**
	 * 查看图片
	 */
	viewImage: function (e) {
		// 当前图片地址
		var url = e.currentTarget.dataset.url
		// 要预览的图片地址列表
		var imgList = e.currentTarget.dataset.urllist
		var urlList = []
		for (let i = 0; i < imgList.length; i++) {
			urlList[i] = imgList[i].url
		}


		// 预览图片
		wx.previewImage({
			current: url,
			urls: urlList
		})
	},

	/**
	 * 点赞
	 */
	like: function (e) {
		// 绑定学号后才能点赞
		if (!app.globalData.studentInfo.bind) {
			wx.showModal({
				showCancel: false,
				title: "提示",
				content: "请绑定学号以后再点赞帖子！"
			})
		} else {
      console.log(e.currentTarget);
			// 帖子索引
			let index = e.currentTarget.dataset.index
			// 帖子
			let post = this.data.posts[this.data.topicSelected].dataList[index]

			// 未点赞状态
			if (!post.liked) {
				// 调用答疑服务工具的点赞方法
				qaService.like({
					post_id: post.post_id
				})
			} else {
				// 调用答疑服务工具的取消点赞方法
				qaService.cancleLike({
					post_id: post.post_id
				})
			}

			// 更新数据
			post.likes_num += post.liked ? -1 : 1
			post.liked = !post.liked

			// 更新页面
			this.setData({
				posts: this.data.posts
			})
		}
	},

	/**
	 * 删除帖子
	 */
	deletePost: function (e) {
		// 弹窗提示
		wx.showModal({
			title: '提示',
			content: '确定要删除这篇帖子吗？',
			success: res => {
				// 确定
				if (res.confirm) {
					// 获取帖子索引
					let index = e.currentTarget.dataset.index
					// 获取帖子
					let post = this.data.posts[this.data.topicSelected].dataList[index]

					// 提示加载
					wx.showLoading({
						title: '删除中',
						mask: true
					})

					// 调用答疑服务工具的删除方法
					qaService.delete({
						// 删除帖子
						target_type: 0,
						// 目标id
						target_id: post.post_id,
						// 成功回调
						success: () => {
							// 从列表删除数据
							this.data.posts[this.data.topicSelected].dataList.splice(index, 1)

							// 更新页面
							this.setData({
								posts: this.data.posts
							})

							// 成功提示
							wx.showToast({
								title: '删除成功',
								icon: 'success'
							})
						},
						// 失败回调
						fail: () => {
							// 失败提示
							wx.showToast({
								title: '删除失败',
								image: '/images/error.png'
							})
						}
					})
				}
			}
		})
	},

	/**
	 * 阻止触摸事件
	 */
	preventTouch: function () {

	}
})