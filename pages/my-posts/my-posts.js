import {qaService} from '../../service/qaService';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts:{dataList:[]},
  },

  page:0,
  isLastPage:false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyPosts();
  },

  /**
   * 触底刷新
   */
  onReachBottom:function() {
    if(this.isLastPage) {
      wx.showToast({
        title: '没有更多内容了',
        icon:'none'
      });
    } else{
      this.page ++;
      this.getMyPosts();
    }
  },

  // 拉取用户自己发送的帖子
  getMyPosts:function(obj){
    obj = obj ? obj : {};
    wx.showLoading({
      title: '加载中...',
    })
    qaService.getMyPosts({
      page:this.page,
      success:res=>{
        this.data.posts.dataList = this.data.posts.dataList.concat(res.posts);
        this.isLastPage = res.posts.length < 10;
        this.setData({'posts.dataList':this.data.posts.dataList});
      },
      complete:()=>{
        wx.hideLoading();
        (obj.complete?obj.complete:()=>{})();
      }
    })
  },

  /**
   * 删除帖子
   */
  
})