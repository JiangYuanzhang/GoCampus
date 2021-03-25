// 腾讯位置服务SDK核心类
import QQMapWX from '../libs/qqmap-wx-jssdk.min.js';

// 腾讯位置服务核心类对象
var qqMap = new QQMapWX({
	key: 'FQVBZ-VH53W-YLPR3-RPGKM-3YAT7-MCFYO'
});

// 位置服务工具类
var loctionService = {

	// 是否开启位置授权
	authorize: function (callback) {
		// 调用微信官方api
		wx.getSetting({
			success: res => {
				// 已授权
				if (res.authSetting['scope.userLocation']) {
					// 调用回调
					callback(true)
				} else {
					// 调用回调
					callback(false)
				}
			},
			fail: () => {
				// 调用失败视作未授权
				callback(false)
			}
		})
	}
}

// 导出工具
module.exports = {
	qqMap: qqMap,
	loctionService: loctionService
}