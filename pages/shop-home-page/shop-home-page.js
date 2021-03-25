import {printService} from "../../service/printService";
import { fileService} from "../../service/fileUploadService.js";
import {
	qaService
} from '../../service/qaService';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopSwipers:[],
    shopDetail:{},
    cartNum:0,//购物车内的商品数目
    carts:{},
    scrollHeight:0,//底部操作条的高度
    selectedTab:0,
    goods:{
      tags:[],
      goods:[]
    },
    beforeAddCartEdit:false,//显示上传文件的弹窗
    edit:{},
    file:{},//文件的信息
    num:1,//数量
    showCarts:false,
    sumPrice:0,// 价格合计
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setOperationBarHeight();
    // 设置页面标题为店铺名
    this.shop = options.shop;
    wx.setNavigationBarTitle({
      title: options.shop,
    });
    // 加载店铺主页初始数据
    this.homePageInit();
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
    // 加载购物车缓存数据
    this.loadLocalCartsData();
  },

  /**
   * 获取操作条的高度 
   */
  setOperationBarHeight:function(){
    wx.createSelectorQuery().select("#operation-bar").boundingClientRect(res=>{
      let operationBarHeight = res.height;
      // 获取店铺简介的高度
      wx.createSelectorQuery().select("#shop-card").boundingClientRect(res=>{
        this.setData({
          scrollHeight:app.globalData.systemInfo.windowHeight - res.top - res.height - operationBarHeight,
          operationBarHeight
        });
      }).exec();
    }).exec();
  },

  /**
   * 轮播图切换
   */
  cardSwiperChange: function(e) {
    console.log('店铺轮播图切换',e);
  },

  /**
   * 点击店铺轮播图
   */
  tapSwiperItem: function(e){
    let tapedGood = e.currentTarget.dataset.good;
    console.log('点击轮播图',tapedGood);
  },

  /**
   * 点击tab
   */
  tabSelect:function(e){
    let index = e.currentTarget.dataset.id;
    this.setData({
      selectedTab:index
    })
  },

  /**
   * 店铺主页初始化
   */
  homePageInit:function(){
    wx.showLoading({
      title: '店铺加载中',
    });
    printService.initShopHomePage({
      name:this.shop,
      success:res=>{
        // 如果商家的头像为空，使用小程序的logo
        if(!res.shop_detail.avatar) res.shop_detail.avatar = 'https://tva1.sinaimg.cn/large/007S8ZIlgy1gdz1mmcfd3j30rl0rbgnv.jpg';
        // 如果没有swiper，使用两张商家的logo作为轮播图
        if(!res.swipers){
          res.swipers = [{
            id:0,
            type:'image',
            url:res.shop_detail.avatar,
            good:-1
          },{
            id:1,
            type:'image',
            url:res.shop_detail.avatar,
            good:-1
          }]
        }
        this.setData({
          shopSwipers:res.swipers,
          shopDetail:res.shop_detail,
          goods:res.goods,
        })
      },
      complete:()=>{
        wx.hideLoading({
          complete: (res) => {},
        });
      }
    })
  },

  /**
   * 加载本地缓存的购物车数据
   */
  loadLocalCartsData:function(){
    this.data.sumPrice = 0;
    wx.getStorage({
      key: `carts_${this.shop}`,
      success: res => {
        for(let code in res.data){
          this.data.sumPrice += res.data[code].price;
        };
        this.setData({
          carts: res.data,
          cartNum: Object.keys(res.data).length,
          sumPrice: parseFloat(this.data.sumPrice.toFixed(2))
        });
      },
      fail:()=>{
        this.setData({
          carts: {},
          cartNum: 0,
          sumPrice: 0
        });
      }
    })
  },


  /**
   * 点击加入购物车
   */
  tapAddCart: function(e) {
    let index = e.currentTarget.dataset.index;
    let tab = e.currentTarget.dataset.tag;
    let good = e.currentTarget.dataset.good;
    if(this.data.goods.goods[tab][index].other_params||this.data.goods.goods[tab][index].with_file){
      // 创建一个用来存放参数的对象
      this.GoodOtherParams = {};
      this.setData({
        beforeAddCartEdit:true,
        edit:{
          index:index,
          good:good,
          tab:tab,
          choosed:0,
          unit:this.data.goods.goods[tab][index].unit,
          params:this.data.goods.goods[tab][index].other_params,
        }
      })
    } else {
      this.addGoodToCart({
        currentTarget:{
          dataset:{
            index:index,
            good:good,
            tab:tab
          }
        }
      });
    }
  },
  addGoodToCart:function(e) {
    let index = e.currentTarget.dataset.index;
    let tab = e.currentTarget.dataset.tab;
    let good = this.data.goods.goods[tab][index];
    let currentTimeStamp = `${parseInt(new Date().valueOf()/1000)}`;
    let other = {}; // 其他信息，比如文件链接等
    let formNotValid = false; //表单不正确
    // 如果商品有个性化设置
    if(good.other_params){
      good.other_params.map(param=>{
        if(!this.GoodOtherParams[param.name]) formNotValid = `商品${param.name}未填写哦！`;
      });
      other.params = this.GoodOtherParams;
    };
    // 如果商品有附件
    if(good.with_file){
      if(!this.data.file.fileName) formNotValid = '附件还未上传哦！';
      other.file = this.data.file;
    }
    if(!formNotValid){
      // 如果商品有附件等附加信息，在购物车新建一个条目
      if(Object.keys(other).length>0){
        this.data.carts[currentTimeStamp] = {
          good,
          num:this.data.num,
          price:this.data.num*good.price,
          other
        };
        console.log(this.data.carts,currentTimeStamp);
      } 
      // 没有附加信息则检查该商品是否已经在购物车里存在，如果存在直接在原来的条目的数量+1
      else {
        let previousGoodInCarts = this.data.carts[`good_${good.id}`]?this.data.carts[`good_${good.id}`]:{good,num:0};
        previousGoodInCarts.num += this.data.num;
        previousGoodInCarts.price = parseFloat((good.price * previousGoodInCarts.num).toFixed(2));
        this.data.carts[`good_${good.id}`] = previousGoodInCarts;
      }
      // 计算购物车内的价格合计
      this.data.sumPrice = 0;
      for(let code in this.data.carts){
        this.data.sumPrice += this.data.carts[code].price;
      };
      this.setData({
        carts:this.data.carts,
        cartNum:Object.keys(this.data.carts).length,
        sumPrice:parseFloat(this.data.sumPrice.toFixed(2)),
      });
      // 设置购物车的本地缓存
      wx.setStorage({
        key:`carts_${this.shop}`,
        data:this.data.carts
      });  
      // 关闭个性化弹框
      this.hideModal();
    } else {
      wx.showModal({
        title:"表单不完整",
        content:formNotValid,
        showCancel:false
      });
    }
  },
  /**
   * 点击购物车
   */
  tapCart:function(){
    this.setData({
      showCarts:true
    });
  },
  /**
   * 隐藏弹窗
   * @param {}} params 
   */
  hideModal:function (params) {
    // 重置文件、参数等
    delete this.GoodOtherParams;
    this.setData({
      beforeAddCartEdit:false,
      showCarts:false,
      file:{},
      edit:{},
    });
  },
  /**
   * 选择文件
   */
  chooseFile:function(e){
    let mode = e.currentTarget.dataset.mode;
    // 从手机本地选择文件
    if (mode == 0) fileService.uploadLocalFile({
      src:this.data.shopDetail.name,
      success:res=>{
        this.setData({file:res});
      }
    });
    // 从微信对话选择文件
    else if(mode == 1) fileService.uploadWxFile({
      success:res=>{
        this.setData({file:res});
      }
    });
    // 从远程上传文件
    else fileService.uploadRemoteFile({
      success:res=>{
        this.setData({file:res});
      }
    })
  },
  /**
   * 输入数量
   */
  numInput:function(e){
    this.setData({
      num:parseInt(e.detail.value.split(".")[0]),
    });
  },
  /**
   * 参数输入
   */
  paramsInput:function(e){
    let paramName = e.currentTarget.dataset.name;
    this.GoodOtherParams[paramName] = e.detail.value;
  },

  /**
   * 参数选择
   */
  paramsChoose:function(e) {
    console.log(e);
    let paramName = e.currentTarget.dataset.name;
    let index = e.currentTarget.dataset.index;
    this.GoodOtherParams[paramName] = this.data.goods.goods[this.data.edit.tab][this.data.edit.index].other_params[index].info[e.detail.value];
    this.data.edit.choosed = e.detail.value;
    console.log(this.GoodOtherParams);
    this.setData({
      goods:this.data.goods,
      edit:this.data.edit
    });
  },

  /**
   * 删除购物车内的订单
   */
  popCart:function(e){
    let cartid = e.currentTarget.dataset.cartid;
    let price = this.data.carts[cartid].price;
    delete this.data.carts[cartid];
    this.setData({
      carts:this.data.carts,
      sumPrice:this.data.sumPrice - price,
      cartNum: Object.keys(this.data.carts).length
    });
    wx.showToast({
      title: '删除成功',
      icon: 'none'
    });
    // 设置购物车的本地缓存
    wx.setStorage({
      key:`carts_${this.shop}`,
      data:this.data.carts
    });  
  },
  /**
   * 提交
   */
  commitOrder:function(params) {
    // 跳转到订单提交的页面
    let callbackCode = `${Math.random()}`;
    if(Object.keys(this.data.carts).length==0){
      wx.showModal({
        title: '购物车空空如也',
        content: '你的购物车里什么也没有，选点啥再提交吧。',
        showCancel: false,
        confirmText: '我知道了'
      });
    } else {
      wx.navigateTo({
        url: '../print-order-commit/print-order-commit?callbackCode=' + callbackCode,
        success: res => {
          // 将当前的购物车信息当做参数传递
          let chanel = res.eventChannel;
          chanel.emit(callbackCode, {
            carts: this.data.carts,
            shop: this.data.shopDetail,
            sumPrice: this.data.sumPrice
          });
        }
      })
    }
  }
})