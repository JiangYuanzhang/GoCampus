import {request} from './requestService.js';
import {formatSendTime,formatTime} from '../utils/util.js';

/**
   * 订单状态常量
   */
const orderStateInfo = {
  0: "待接单", 1: "已接单", 2: "已打印", 3: "订单关闭"
};

// 转换订单信息
function orderInfoTransform(info){
  if(!info) return info;
  info.time = formatTime(info.time,'yyyy-MM-dd HH:mm');
  info.appointment_start_time = formatTime(info.appointment_start_time,'MM-dd HH:mm');
  info.appointment_end_time = formatTime(info.appointment_end_time,'MM-dd HH:mm');
  info.stateCode = info.state;
  info.state = orderStateInfo[info.state];
  return info;
}

/**
 * 打印服务类
 */
let printService = {
  /**
   * 获取当前最新订单的信息
   */
  getCurrentOrderInfo:function(obj){
    // 向服务器请求最新的订单
    request.withToken({
      execute:res => {
        wx.request({
          url: request.url2v2 +"cloud-print/student/newest-order?token="+res.data.token,
          success:res=>{
            console.log(res)
            if (res.data.code == 200) (obj.success ? obj.success : () => { })(orderInfoTransform(res.data.data.order));
            else (obj.fail?obj.fail:()=>{})();
          },
          fail:obj.fail,
          complete:obj.complete
        })
      }
    })
  },

  /*
  * 获取历史订单
  * */
  getHistoryOrders:function (args) {
    // 发送带token的请求到服务器
    request.withToken({
      execute: res => {
        wx.request({
          url:request.url2v2+"cloud-print/student/order",
          data:{
            token: res.data.token,
            page: args.page,
          },
          method:"GET",
          success:res => {
            if(res.data.code === 200) {
              // 将订单按照订单号分组
              let ordersDivided = {};
              let orders;
              if(res.data.data.orders){
                res.data.data.orders.map(
                    order => {
                      order = orderInfoTransform(order);
                    }
                );
              }
              (args.success?args.success:()=>{})(res.data.data);
            }
            else {
              (args.fail?args.fail:()=>{})();
            }
          },
          fail:args.fail,
          complete:args.complete
        })
      }
    })
  },

  getOrderDetail:function(args){
    request.withToken({
      execute:res=>{
        wx.request({
          url: request.url2v2 + 'cloud-print/student/get-order-detail' ,
          data:{
            token:res.data.token,
            code:args.code
          },
          success:res=>{
            if(res.data.code === 200){
              (args.success?args.success:()=>{})(res.data);
            } else {
              (args.fail?args.fail:()=>{})(res.data);
            }
          },
          fail:args.fail,
          complete:args.complete
        })
      }
    })
  },

  /**
   * 取消订单
   */
  cancelOrder:function(args){
    request.withToken({
      execute : res => {
        wx.request({
          url: request.url2v2+"cloud-print/student/cancel-orders",
          data:{
            token:res.data.token,
            reason:args.reason,
            code:args.code
          },
          success:res=>{
            if(res.data.code == 200) {
              (args.success?args.success:()=>{})(res.data);
            } else {
              (args.fail?args.fail:()=>{})(res.data);
            }
          },
          fail:args.fail,
          complete:args.complete
        })
      }
    });
  },

  /**
   * 获取营业中的打印店
   */
  getBusinessShops:function(args){
    wx.request({
      url: request.url2+"cloud-print/student/get-business-shops",
      data:{
        page:args.page?args.page:0,
      },
      success:res=>{
        console.log(res)
        if(res.data.code === 200) (args.success?args.success:()=>{})(res.data.data);
        else (args.fail?args.fail:()=>{});
      },
      fail:args.fail,
      complete:args.complete
    })
  },

  /**
   * 打印店主页初始化
   */
  initShopHomePage:function(args){
    request.withToken({
      execute:res=>{
        wx.request({
          url: request.url2+'cloud-print/student/shop-init',
          data:{
            token:res.data.token,
            shop:args.name
          },
          success:res=>{
            if(res.data.code == 200){
              // 转换货物的格式
              let temp = {};
              res.data.data.goods = res.data.data.goods?res.data.data.goods:[];
              res.data.data.goods.map(good=>{
                let sameTagGoods = temp[good.tag]?temp[good.tag]:[];
                sameTagGoods.push(good);
                temp[good.tag] = sameTagGoods;
              });
              let tags = Object.keys(temp);
              let goods = Object.values(temp);
              res.data.data.goods = {tags,goods};
              ;(args.success?args.success:()=>{})(res.data.data);
            }
            else (args.fail?args.fail:()=>{})();
          },
          fail:args.fail,
          complete:args.complete
        })
      }
    })
  },

  /**
   * 提交订单
   */
  commitOrder:function(args) {
    request.withToken({
      execute:res=>{
        wx.request({
          url: request.url2v2+'/cloud-print/student/order?token='+res.data.token,
          method:"POST",
          header:{
            'Content-Type':'application/json'
          },
          data:args.form,
          success:res=>{
            if(res.data.code == 200) {
              (args.success?args.success:()=>{})(res.data.data);
            } else {
              (args.fail?args.fail:()=>{})();
            }
          },
          complete:args.complete,
          fail:args.fail
        });
      }
    })
  },

  /**
   * 获取从电脑上传文件的上传码
   */
  generateRemoteUploadCode:function(args){
    request.withToken({
      execute:res=>{
        wx.request({
          url: request.url2v2 +"cloud-print/student/remote-upload-file",
          data:{
            token:res.data.token
          },
          success:res=>{
            if(res.data.code === 200) {
              (args.success?args.success:()=>{})(res.data.data);
            } else {
              (args.fail?args.fail:()=>{})();
            }
          },
          fail:args.fail,
          complete:args.complete,
        })
      }
    })
  },

  /**
   * 获取远程上传文件
   */
  getRemoteUploadFile:function(args){
    request.withToken({
      execute: res => {
        wx.request({
          url: request.url2v2 + "cloud-print/student/remote-upload-file",
          data: {
            token: res.data.token,
            code: args.code,
          },
          success: res => {
            if (res.data.code === 200) {
              if(res.data.data.file.size == 0 && res.data.data.file.name == '' && res.data.data.file.url == '') {
                (args.fail ? args.fail : () => { })();
              } else {
                (args.success ? args.success : () => { })(res.data.data);
              }
            } else {
              (args.fail ? args.fail : () => { })();
            }
          },
          fail: args.fail,
          complete: args.complete,
        })
      }
    })
  }
};

module.exports.printService = printService;
module.exports.orderStateInfo = orderStateInfo;