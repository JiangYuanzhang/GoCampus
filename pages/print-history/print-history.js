import {
  printService
} from "../../service/printService.js";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyOrders: [],
    refreshing: false,
  },

  page: 0,
  isTheLastPage: false, // 是最后一页了

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getHistoryOrders();//获取历史订单
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 设置刷新状态
    this.setData({ refreshing: true });
    this.data.historyOrders = [];
    this.getHistoryOrders({
      complete:()=>{
        // 设置刷新状态
        this.setData({ refreshing: false });
        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 如果不是最后一页，就请求下一页的内容
    if(!this.isTheLastPage){
      this.page ++;
      this.getHistoryOrders({
        success:res => {
          // 如果请求到的订单数目小于10单，说明是最后一页
          if(res.length < 10) this.isTheLastPage = true;
        }
      });
    }
    // 否则提示是「没有更多内容了」
    else {
      wx.showToast({
        title: '没有更多内容了',
      })
    }
  },

  /**
   * 获取历史订单
   */
  getHistoryOrders: function(callback) {
    callback = callback ? callback : {};
    wx.showLoading({
      title: '加载中',
    })
    printService.getHistoryOrders({
      page: this.page,
      success: res => {
        console.log(res);
        let orders = res.orders ? res.orders : [];
        this.data.historyOrders = this.data.historyOrders.concat(orders);
        this.setData({
          historyOrders: this.data.historyOrders
        });
        wx.showToast({
          title: '刷新成功',
          icon:'none',
        });
        (callback.success ? callback.success : () => {})(orders);
      },
      fail:res=>{
        wx.showToast({
          title: '刷新失败',
          icon: 'none',
        })
      },
      complete: res => {
        wx.hideLoading();
        (callback.complete ? callback.complete : () => {})();
      }
    });
  },

  /**
   * 点击订单
   */
  tapOrderToDetail: function(e) {
    let tapIndex = e.currentTarget.dataset.taped;
    wx.navigateTo({
      url: "../order-detail/order-detail?order_code=" + this.data.historyOrders[tapIndex].code,
      success: (res) => {
        // 向切换到的页面发送数据
        res.eventChannel.emit(this.data.historyOrders[tapIndex].code, this.data.historyOrders[tapIndex]);
      }
    })
  },

})