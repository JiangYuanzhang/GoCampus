import {printService} from "../../service/printService.js";
const app = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		currentSelectedTab:0, // 当前被选中的tab
    currentOrderInfo:{},// 当前订单的信息
    shops:[],
	},

	page:0,

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
    // 更新当前的订单信息
    this.getCurrentOrderInfo({
      complete:res=>{
        // 获取营业中的打印店的信息
        this.getBusinessShops({
          complete:res=>{
            
          }
        })
      }
    });
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
	 * 用户下拉动作
	 */
	onPullDownRefresh: function () {
    this.getCurrentOrderInfo({
      complete:res=>{
        wx.stopPullDownRefresh();
      }
    })    
	},

  /**
   * 更新当前的订单信息
   */
  getCurrentOrderInfo:function(callback){
    callback = callback ? callback : {};
    // 获取当前进行中的订单
    wx.showLoading({
      title: '订单加载中',
    })
    printService.getCurrentOrderInfo({
      success: res => {
        // 更新当前的订单信息
        this.setData({
          currentOrderInfo: res
        });
        (callback.success?callback.success:()=>{})(res);
        wx.showToast({
          title: '加载成功',
          icon:'none'
        })
      },
      complete: res => {
        // 隐藏弹窗
        wx.hideLoading();
        (callback.complete ? callback.complete : () => { })();
      }
    })
  },

  /**
   * 点击最新的订单
   */
  tapNewestOrder:function(e){
    wx.navigateTo({
      url: "../order-detail/order-detail?order_code=" + this.data.currentOrderInfo.code,
      success: (res) => {
        // 向切换到的页面发送数据
        res.eventChannel.emit(this.data.currentOrderInfo.code,this.data.currentOrderInfo);
      }
    })
  },

  /**
   * 获取营业中的打印店
   */
  getBusinessShops:function(){
    wx.showLoading({
      title: '加载中',
    });
    printService.getBusinessShops({
      page:this.page,
      success:res=>{
        console.log(this.page)
        console.log(res)
        this.data.shops = this.data.shops.concat(res.shops);
        this.setData({shops:this.data.shops});
      },
      complete:()=>{
        wx.hideLoading({
          complete: (res) => {},
        });
      }
    })
  }
});