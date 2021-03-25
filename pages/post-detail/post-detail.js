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
		// 遮罩层
		mask: {
			show: true,
			opacity: 1,
			hasBind: app.globalData.studentInfo.bind,
		},

		// 页面
		page: {
			// 是否编辑回复中
			edit: false,
			// 底部距离
			barBottom: 0,
			// 输入框提示内容
			placeholder: '有什么想说的...'
		},

		// 回复类型
		reply_type: 0,

		// 帖子id
		post_id: -1,

		// 回复的目标id
		target_id: -1,

		// 被回复者昵称
		receiver_name: '',

		// 帖子内容
		post: {},

		// 评论
		comments: [],

		// 评论的页数
		commentsPage: 0,

		// 是否无评论
		hasOver: false,

		// 回复的表单数据
		form: {
			// 回复内容
			content: '',
			// 选择的图片列表
			imgList: []
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// 获取帖子id
		this.data.post_id = options.post_id
		this.data.target_id = options.post_id

		// 监听键盘高度
		wx.onKeyboardHeightChange(res => {
			// 更新数据及页面
			this.setData({
				'page.barBottom': res.height
			})
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		// 提示加载
		wx.showLoading({
			title: '加载中',
			mask: true
		})

		// 调用答疑服务工具的帖子详情方法
		qaService.postDetail({
			// 帖子id
			post_id: this.data.post_id,
			// 成功回调
			success: res => {
				// 更新数据及页面
				this.setData({
					post: res.data
				})

				// 调用答疑服务工具的获取评论方法
				qaService.comments({
					// 帖子id
					post_id: this.data.post.post_id,
					// 页数
					page: 0,
					// 类型(0: 评论)
					type: 0,
					// 成功回调
					success: res => {
						// 更新数据及页面
						this.setData({
							comments: res.data.comments ? res.data.comments : []
						})

						// 检验是否无更多数据
						if (res.data.comments.length < 10) {
							this.setData({
								hasOver: true
							})
						}

					}
				})

				//隐藏加载
				wx.hideLoading()

				// 关闭遮罩层
				this.setData({
					'mask.opacity': 0
				})
				setTimeout(() => {
					this.setData({
						'mask.show': false
					})
				}, 500)
			}
		})
	},

	/**
	 * 页面相关事件处理函数--监听页面显示
	 */
	onShow: function () {
		this.setData({
			hasBind: app.globalData.studentInfo.bind,
		})
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		// 数据重置
		this.setData({
			commentsPage: 0,
			hasOver: false
		})

		// 显示加载
		wx.showLoading({
			title: '获取中',
			mask: true
		})

		// 重新拉取评论
		qaService.comments({
			// 帖子id
			post_id: this.data.post.post_id,
			// 页数
			page: 0,
			// 类型(0: 评论)
			type: 0,
			// 成功回调
			success: res => {
				// 更新数据及页面
				this.setData({
					comments: res.data.comments ? res.data.comments : []
				})

				// 检验是否无更多数据
				if (res.data.comments.length < 10) {
					this.setData({
						hasOver: true
					})
				}

				// 成功提示
				wx.showToast({
					title: '获取成功了',
					icon: 'none'
				})
			}
		})

		// 弹起下拉
		wx.stopPullDownRefresh()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		// 还有更多数据则获取
		if (!this.data.hasOver) {
			this.data.commentsPage++

			// 显示加载
			wx.showLoading({
				title: '获取中',
				mask: true
			})

			// 调用答疑服务工具的获取评论方法
			qaService.comments({
				// 帖子id
				post_id: this.data.post.post_id,
				// 页数
				page: this.data.commentsPage,
				// 类型(0: 评论)
				type: 0,
				// 成功回调
				success: res => {
					// 更新数据及页面
					this.setData({
						comments: this.data.comments.concat(res.data.comments)
					})

					// 检验是否无更多数据
					if (res.data.comments.length < 10) {
						this.setData({
							hasOver: true
						})
					}

					// 隐藏加载
					wx.hideLoading()
				}
			})
		}
	},

	/**
	 * 查看图片
	 */
	viewImage: function (e) {
		// 当前图片地址
		let url = e.currentTarget.dataset.url
		// 要预览的图片地址列表
		let imgList = e.currentTarget.dataset.urllist
		let urlList = []

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
	 * 编辑回复
	 */
	edit: function () {
		// 更新数据及页面
		this.setData({
			'page.edit': true
		})
	},

	/**
	 * 取消编辑
	 */
	cancelEdit: function () {
		// 更新数据及页面
		this.setData({
			'page.edit': false,
		})
	},

	/**
	 * 输入内容
	 */
	inputContent: function (e) {
		// 当回复评论时，内容为空点删除键则改为评论帖子
		if (e.detail.keyCode === 8 && this.data.form.content === '') {
			this.setData({
				reply_type: 0,
				target_id: this.data.post_id,
				'form.content': '',
				'form.imgList': [],
				'page.placeholder': '有什么想说的...'
			})
		}

		// 更新数据
		this.setData({
			'form.content': e.detail.value
		})
	},

	/**
	 * 未登录弹框
	 */
	unLogin: function () {
		wx.showModal({
			showCancel: false,
			title: "提示",
			content: "请绑定学号以后再进行此操作！"
		});
	},

	/**
	 * 选择图片
	 */
	chooseImage: function () {
		// 超出数量上限提示
		if (this.data.form.imgList.length == 9) {
			// 错误提示
			wx.showToast({
				title: '最多选择9张图片',
				icon: 'none'
			})

			return
		}

		// 选择图片
		wx.chooseImage({
			// 最多九张图片
			count: 9 - this.data.form.imgList.length,
			success: res => {
				// 将选择的图片添加到数组
				this.setData({
					'form.imgList': this.data.form.imgList.concat(res.tempFilePaths)
				})
			}
		})
	},

	/**
	 * 删除图片
	 */
	deleteImage: function (e) {
		// 弹窗提示
		wx.showModal({
			title: '提示',
			content: '确定删除这张图片？',
			success: res => {
				// 选择确定
				if (res.confirm) {
					// 获取索引
					let index = e.currentTarget.dataset.index
					// 删除图片路径
					this.data.form.imgList.splice(index, 1)
					// 更新页面
					this.setData({
						'form.imgList': this.data.form.imgList
					})
				}
			}
		})
	},

	/**
	 * 回复
	 */
	reply: function () {
		// 表单验证
		if (this.data.form.content == '' && this.data.form.imgList.length == 0) {
			// 错误提示
			wx.showToast({
				title: '内容不能为空',
				icon: 'none'
			})

			return
		}

		// 提示加载
		wx.showLoading({
			title: '回复中',
			mask: true
		})

		// 上传图片
		qaService.uploadImageList({
			// 图片列表
			imgList: this.data.form.imgList,
			// 成功回调
			success: res => {
				// 调用答疑服务工具的回复方法
				qaService.reply({
					// 主题帖子id
					host_post: parseInt(this.data.post_id),
					// 回复类型(0: 回复帖子, 1: 回复评论)
					target_type: parseInt(this.data.reply_type),
					// 被回复的对象id
					target_id: parseInt(this.data.target_id),
					// 内容
					content: this.data.form.content,
					// 图片
					images: res,
					// 成功回调
					success: r => {
						// 插入一条数据
						let comment = {
							avatar_url: getApp().globalData.userInfo.avatarUrl,
							comment_type: this.data.reply_type,
							comment_id: r.data.id,
							content: this.data.form.content,
							images: res,
							nick_name: getApp().globalData.userInfo.nickName,
							release_time: '刚刚',
							sent_by_me: true,
							receiver_name: this.data.receiver_name
						}

						this.data.comments.unshift(comment)
						this.setData({
							comments: this.data.comments
						})
						wx.pageScrollTo({
							selector: '#comments'
						})

						// 更新数据及页面
						this.setData({
							'form.content': '',
							'form.imgList': [],
							'page.edit': false,
							reply_type: 0,
							target_id: this.data.post_id,
							'page.placeholder': '有什么想说的...'
						})

						// 成功提示
						wx.showToast({
							title: '回复成功',
							icon: 'none'
						})
					},
					// 失败回调
					fail: () => {
						// 错误提示
						wx.showToast({
							title: '回复失败，请重试',
							icon: 'none'
						})
					}
				})
			},
			// 失败回调
			fail: () => {
				// 错误提示
				wx.showToast({
					title: '回复失败，请重试',
					icon: 'none'
				})
			}
		})
	},

	/**
	 * 删除评论
	 */
	deleteComment: function (e) {
		// 弹窗提示
		wx.showModal({
			title: '提示',
			content: '确定要删除这条评论吗？',
			success: res => {
				// 确定
				if (res.confirm) {
					// 获取评论索引
					let index = e.currentTarget.dataset.index
					// 获取评论
					let comment = this.data.comments[index]

					// 提示加载
					wx.showLoading({
						title: '删除中',
						mask: true
					})

					// 调用答疑服务工具的删除方法
					qaService.delete({
						// 删除评论
						target_type: 1,
						// 目标id
						target_id: comment.comment_id,
						// 成功回调
						success: () => {
							// 从列表删除数据
							this.data.comments.splice(index, 1)

							// 更新页面
							this.setData({
								comments: this.data.comments
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

	// 回复评论
	replyComment: function (e) {
		let index = e.currentTarget.dataset.index
		let comments = this.data.comments

		if (comments[index].sent_by_me) return

		if (!this.data.page.edit) {
			this.setData({
				'page.edit': true,
				reply_type: 1,
				target_id: comments[index].comment_id,
				receiver_name: comments[index].nick_name,
				'page.placeholder': '回复：' + comments[index].nick_name,
				'form.content': '',
				'form.imgList': []
			})
		} else {
			this.setData({
				'page.edit': false
			})
		}
	}
})