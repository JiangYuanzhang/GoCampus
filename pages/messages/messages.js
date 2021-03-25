// pages/messages/messages.js

const app = getApp();
import {qaService} from '../../service/qaService';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages:[], // 消息
    messageTypes:{
      0:"评论了你帖子",
      1:"回复了你评论",
      2:"赞了你的帖子"
    },
  },
  page:0, // 当前的页码

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 请求第一页的消息
    this.getMessages();
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
    this.page = 0; // 页码归零
    this.data.messages = []; // 清除当前的消息
    this.getMessages();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 页码+1
    this.page ++;
    this.getMessages();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取与我相关的消息
   */
  getMessages:function(){
    // 调用问答服务，获取最新的消息
    wx.showLoading({
      title: '加载中',
    })
    qaService.messages({
      page:this.page,
      success:res=>{
        this.data.messages = this.data.messages.concat(res.data.messages);
        this.setData({
          messages:this.data.messages
        });
        wx.hideLoading({
          complete: (res) => {},
        });
      },
      fail:res=>{
        wx.hideLoading({
          complete: (res) => {},
        });
        wx.showModal({
          showCancel: false,
          title:"提示",
          content:"加载消息失败。"
        });
      }
    });
  },
})