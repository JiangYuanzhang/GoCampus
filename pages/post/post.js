// 引入答疑服务工具
import {
	qaService
} from '../../service/qaService'
const app = getApp();

// 页面对象
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 页面控制
		page: {
			// 版块列表
			topics: [],
			// 文本域获取焦点
			focus: false,
			// 底部栏位置
			barBottom: 0
		},

		// 表单数据
		form: {
			// 选择的版块
			topic: '',
			// 帖子内容
			content: '',
			// 帖子图片列表
			imgList: [],
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// 判断用户是否绑定学号，未绑定学号返回上一层页面
		if(!app.globalData.studentInfo.bind){
			wx.navigateBack({
				success: res=>{
					wx.showModal({
						showCancel:false,
						title:"提示",
						content:"请绑定学号以后再发帖！"
					})
				},
			})
		}
		// 调用答疑服务工具的获取版块方法
		qaService.topics({
			// 成功回调
			success: res => {
				// 更新数据及页面
				this.setData({
					'page.topics': res.data.topics ? res.data.topics : []
				})
			}
		})

		// 监听键盘高度
		wx.onKeyboardHeightChange(res => {
			// 更新数据及页面
			this.setData({
				'page.barBottom': res.height
			})
		})
	},

	/**
	 * 阻止点击冒泡
	 */
	preventTap: function () {

	},

	/**
	 * 选择版块
	 */
	selectTopic: function (e) {
		// 更新数据及页面
		this.setData({
			'form.topic': this.data.page.topics[e.detail.value]
		})
	},

	/**
	 * 文本域获取焦点
	 */
	onFocus: function () {
		// 更新数据及页面
		this.setData({
			'page.focus': true
		})
	},

	/**
	 * 输入内容
	 */
	inputContent: function (e) {
		// 更新数据及页面
		this.setData({
			'form.content': e.detail.value
		})
	},

	/**
	 * 选择图片
	 */
	chooseImage: function () {
		// 超出数量上限
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
			// 成功回调
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
	 * 查看图片
	 */
	viewImage: function (e) {
		// 当前图片地址
		let url = e.currentTarget.dataset.url
		// 要预览的图片地址列表
		let urlList = e.currentTarget.dataset.urllist

		// 预览图片
		wx.previewImage({
			current: url,
			urls: urlList
		})
	},

	/**
	 * 发帖
	 */
	post: function () {
		// 表单验证
		if (this.data.form.topic == '') {
			wx.showToast({
				title: '请选择版块',
				icon: 'none'
			})

			return
		}

		// 表单验证
		if (this.data.form.content == '' && this.data.form.imgList.length == 0) {
			wx.showToast({
				title: '内容不能为空',
				icon: 'none'
			})

			return
		}

		// 提示加载
		wx.showLoading({
			title: '发布中',
			mask: true
		})

		// 上传图片
		qaService.uploadImageList({
			// 图片列表
			imgList: this.data.form.imgList,
			// 成功回调
			success: res => {
				// 调用答疑服务工具的发帖方法
				qaService.post({
					// 版块
					topic: this.data.form.topic,
					// 内容
					content: this.data.form.content,
					// 图片
					images: res,
					// 成功回调
					success: () => {
						// 成功提示
						wx.showToast({
							title: '发布成功',
							icon: 'none'
						})

						// 返回上一个页面
						setTimeout(() => {
							wx.navigateBack()
						}, 1500)
					},
					// 失败回调
					fail: () => {
						// 错误提示
						wx.showToast({
							title: '发布失败，请重试',
							icon: 'none'
						})
					}
				})
			},
			// 失败回调
			fail: () => {
				// 错误提示
				wx.showToast({
					title: '发布失败，请重试',
					icon: 'none'
				})
			}
		})
	}
})