import {printService} from '../../service/printService';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carts:{},
    shop:{},
    sumPrice:0,
    autoGeted:false,
    phoneNumber:"",
    date:`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
    timeSelected:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 建立获取提交的购物车内的商品事件通道
    let eventChannel = this.getOpenerEventChannel();
    eventChannel.once(options.callbackCode,res=>{
      let carts = res.carts;
      this.setData({
        carts,
        shop:res.shop,
        sumPrice:res.sumPrice
      });
    });
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
   * 自动获取手机号码
   */
  getPhoneNumber:function(e){
    console.log(e);
    if(e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        showCancel:false,
        title:"获取手机号码失败",
        content:"获取手机号码失败，请手动输入手机号码。",
        confirmText:"我知道了"
      })
    } else {
      this.telEncrypted = true;
      this.telData = e.detail.encryptedData;
      this.telIv = e.detail.iv;
      this.setData({
        phoneNumber:"已经自动获取",
        autoGeted:true
      })
    }
  },
  /**
   * 时间日期选择
   */
  DateChange:function(e){
    this.setData({
      date: e.detail.value
    })
  },
  TimeChange:function(e){
    this.setData({
      timeSelected: parseInt(e.detail.value)
    });
  },
  /**
   * 重置表单
   */
  resetForm:function(){
    
  },

  /**
   * 关闭弹窗
   */
  hidemodal:function(){
    this.setData({
      commitComplete:false
    });
    // 清空购物车
    wx.removeStorage({
      key: `carts_${this.data.shop.name}`,
      success:res=>{
        wx.navigateBack();
      }
    })
  },

  /**
   * 提交订单
   */
  submitOrderForm:function(e){
    let form = e.detail.value;
    let formInvalid = false;
    if(form.name == '') formInvalid = '你的联系人姓名好像没写哦。';
    if(form.tel == '') formInvalid = '你的手机号码好像没有填写哦。';
    if(!(/^1[3456789]\d{9}$/.test(form.tel))&&!this.telEncrypted){
      formInvalid = '手机号码格式有误。';
    }
    if(form.location == '') formInvalid = '你的联系地址好像没写哦。';
    // 检查预约日期
    let [start,end] = this.data.shop.business_times[form.time].split(" - ");
    let startDate = new Date(`${form.date} ${start}`),
        endDate = new Date(`${form.date} ${end}`);
    if(endDate.valueOf()-new Date().valueOf() < 3600*1000) {
      formInvalid = '啊哦，你给的时间好像太短了呢，请至少留一个小时准备呀。'
    }
    if(!formInvalid){
      // 店铺名
      form.shop = this.data.shop.name;
      // 预约时间
      delete form.date;
      delete form.time;
      form.appointent = {
        start:startDate.valueOf()/1000,
        end:endDate.valueOf()/1000,
      };
      // 如果电话号码的信息是自动获取的加密信息
      if(this.telEncrypted){
        form.tel = {
          encrypted:true,
          data:this.telData,
          iv:this.telIv
        };
      } else {
        form.tel = {
          encrypted:false,
          data:form.tel,
        }
      }
      // 处理要提交的购物车信息
      let cart = [];
      for(let k in this.data.carts){
        let good = this.data.carts[k];
        let item = {id:good.good.id,with_file:good.good.with_file};
        item.num = good.num;
        if(good.other) item.other = good.other;
        cart.push(item);
      };
      form.cart = cart;
      console.log(JSON.stringify(form));
      printService.commitOrder({
        form:form,
        success:res=>{
          this.setData({
            commitComplete:true,
            orderCode:res.code,
            mayPrice:res.price,
            state:true
          });
        },
        fail:res=>{
          this.setData({
            commitComplete:true,
            state:false
          });
        }
      })
    } else {
      wx.showModal({
        showCancel:false,
        title:"表单不完整",
        content:formInvalid,
        confirmText:"我知道了"
      });
    }
  },
})