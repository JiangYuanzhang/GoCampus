import {printService} from "../../service/printService.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfo:{},
    canBeCanceled:true,//订单是否可以被取消
    showCancelForm:false,
    canNotCancelTips:false,
    cart:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从上一个页面获取订单
    let orderCode = options.order_code;
    let eventChannel = this.getOpenerEventChannel();
    eventChannel.once(orderCode,(order)=>{
      this.setData({
        orderInfo:order,
        canBeCanceled:order.stateCode < 2, // 还未打印，可以取消
      });
      this.getGoodsOfOrder();
    });
  },
  /**
   * 点击取消订单的按钮
   */
  tapCancelOrder:function(){
    this.setData({
      showCancelForm:!this.data.showCancelForm
    })
  },

  /**
   * 输入取消订单的原因
   */
  reasonInput:function(e){
    this.reason = e.detail.value;
  },

  /**
   * 取消订单
   */
  cancelOrder:function(){
    if(this.reason){
      wx.showLoading({
        title: '取消中',
      })
      printService.cancelOrder({
        code: this.data.orderInfo.code,
        reason: this.reason,
        success: res => {
          this.data.orderInfo.state = "订单关闭";
          this.data.orderInfo.state_info = this.reason;
          this.data.orderInfo.stateCode = 3;
          this.setData({
            orderInfo: this.data.orderInfo,
            canBeCanceled: false, // 更改取消订单按钮的状态为不可取消
          });
          wx.showModal({
            title: '取消成功',
            content: '取消订单成功！',
          });
        },
        complete: res => {
          wx.hideLoading();
          this.tapCancelOrder();
        }
      })
    } else {
      wx.showModal({
        title: '表单错误',
        content: '请输入取消订单的原因。',
      })
    }
  },
  /**
   * 显示无法取消的弹窗
   */
  showCanNotCancel:function(){
    this.setData({
      canNotCancelTips:!this.data.canNotCancelTips
    })
  },
  /**
   * 获取订单内的商品
   */
  getGoodsOfOrder:function(){
    printService.getOrderDetail({
      code:this.data.orderInfo.code,
      success:res=>{
        this.setData({
          cart:res.data
        })
      }
    })
  },
  /**
   * 点击商品
   */
  tapGood:function(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      good:this.data.cart.carts[index],
      showGoodDetail:true,
    })
  },
  /**
   * 隐藏商品详情
   */
  hideGoodDetail:function(){
    this.setData({
      showGoodDetail:false
    })
  }
})