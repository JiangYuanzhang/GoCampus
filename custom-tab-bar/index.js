// tab-bar组件
Component({
	/**
	 * 组件的初始数据
	 */
	data: {
		// 选中项
		selected: null,
		// 文选中文本颜色
		color: "#000000",
		// 选中文本颜色
		selectedColor: "#5134c2",
		// tab项列表
		list: [/*{

			pagePath: "/pages/print/print",
			iconPath: "/images/tab-icons/print-1.png",
			selectedIconPath: "/images/tab-icons/print-selected-1.png",
			text: "云打印"
		}, */{
			pagePath: "/pages/question/question",
			iconPath: "/images/tab-icons/qa-1.png",
			selectedIconPath: "/images/tab-icons/qa-selected-1.png",
			text: "答疑"
		}, {
			pagePath: "/pages/curriculum/curriculum",
			iconPath: "/images/tab-icons/timetable.png",
			selectedIconPath: "/images/tab-icons/timetable-selected.png",
			text: "课表"
		}, 
		/*{
			pagePath: "/pages/more/more",
			iconPath: "/images/tab-icons/more-1.png",
			selectedIconPath: "/images/tab-icons/more-selected-1.png",
			text: "工具"
		}, */{
			pagePath: "/pages/me/me",
			iconPath: "/images/tab-icons/me-1.png",
			selectedIconPath: "/images/tab-icons/me-selected-1.png",
			text: "我的"
		}]
	},

	attached() {

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		switchTab(e) {
			const data = e.currentTarget.dataset
			const url = data.path
			wx.switchTab({
				url
			})
		}
	}
})