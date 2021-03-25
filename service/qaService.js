// 全局变量
const app = getApp()

// 引入工具
import {
  request
} from 'requestService.js'

import {
  formatSendTime
} from '../utils/util'

// 图片上传工具
const qiniuUploader = require('../utils/qiniuUploader')

// 答疑服务工具类
var qaService = {

  messages: function (obj) {
    request.withToken({
      execute: res => {
        wx.request({
          url: request.url2 + "messages",
          method: "GET",
          data: {
            token: res.data.token,
            page: obj.page ? obj.page : 0,
          },
          success: res => {
            let response = res.data; // 服务器返回的消息内容
            response.data.messages.map(
              (message, index) => {
                response.data.messages[index].operate_time = formatSendTime(message.operate_time);
              }
            )
            let callback = obj.success ? obj.success : (res) => { };
            callback(response);
          },
          fail: obj.fail ? obj.fail : () => { },
        })
      },
      fail: obj.fail ? obj.fail : () => { }
    });
  },

  // 获取帖子版块
  topics: function (obj) {
    // 发起普通请求
    request.common({
      // 接口地址
      url: request.url2 + '/get-topics',
      // 请求方法
      method: 'GET',
      // 成功回调
      success: res => {
        // 执行成功
        if (res.data.code === 200) {
          // 成功回调
          obj.success ? obj.success(res.data) : () => { }
        } else {
          // 失败回调
          obj.fail ? obj.fail(res.data) : () => { }
        }
      },
      // 失败回调
      fail: obj.fail ? obj.fail : () => { }
    })
  },

  // 读取帖子列表
  posts: function (obj) {
    // 发起带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 接口地址
          url: request.url2 + '/posts',
          // 数据
          data: {
            token: res.data.token,
            page: obj.page,
            topic: obj.topic ? obj.topic : null
          },
          // 成功回调
          success: res => {
            // 执行成功
            if (res.data.code === 200) {
              // 格式化发帖时间
              for (let i = 0; i < res.data.data.posts.length; i++) {
                if (res.data.data.posts[i]) res.data.data.posts[i].release_time = formatSendTime(res.data.data.posts[i].release_time)
              }
              // 成功回调
              obj.success ? obj.success(res.data) : () => { }
            } else {
              // 失败回调
              obj.fail ? obj.fail(res.data) : () => { }
            }
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { },
          // 执行完成回调
          complete: obj.complete ? obj.complete : () => { }
        })
      }
    })
  },

  // 获取帖子详情
  postDetail: function (obj) {
    // 发起带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 请求地址
          url: request.url2 + '/posts',
          // 数据
          data: {
            token: res.data.token,
            page: 0,
            post_id: obj.post_id
          },
          // 请求方法
          method: 'GET',
          // 成功回调
          success: res => {
            // 执行成功
            if (res.data.code === 200) {
              // 提取数据
              res.data.data = res.data.data.posts[0]

              // 格式化发帖时间
              if (res.data.data) res.data.data.release_time = formatSendTime(res.data.data.release_time)

              // 成功回调
              obj.success ? obj.success(res.data) : () => { }
            }
            // 执行失败
            else {
              obj.fail ? obj.fail(res.data) : () => { }
            }
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { },
          // 执行完成回调
          complete: obj.complete ? obj.complete : () => { }
        })
      }
    })
  },

  // 点赞帖子
  like: function (obj) {
    // 发送点赞请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 请求地址
          url: request.url2 + '/like-post',
          // 数据
          data: {
            token: res.data.token,
            post_id: obj.post_id
          },
          // 请求方法
          method: 'POST',
          // 请求头
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          // 成功回调
          success: obj.success ? obj.success : () => { },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { },
          // 执行完成回调
          complete: obj.complete ? obj.complete : () => { }
        })
      }
    })
  },

  // 取消点赞帖子
  cancleLike: function (obj) {
    // 发送取消点赞请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 请求地址
          url: request.url2 + '/cancel-like-post',
          // 数据
          data: {
            token: res.data.token,
            post_id: obj.post_id
          },
          // 请求方法
          method: 'GET',
          // 成功回调
          success: obj.success ? obj.success : () => { },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { },
          // 执行完成回调
          complete: obj.complete ? obj.complete : () => { }
        })
      }
    })
  },

  // 上传图片列表
  uploadImageList: function (obj) {
    // 七牛云配置
    let options = {
      // 华北区
      region: 'ECN',
      // 上传凭证
      uptokenURL: '',
      domain: 'http://up.poisoner.cn',
      shouldUseQiniuFileName: false
    }

    // 上传后图片地址列表
    let urls = []

    // 递归上传图片列表
    let upload = function (index, success) {
      // 未上传完列表
      if (index < obj.imgList.length) {
        // 进行带token的请求
        request.withToken({
          // 执行体
          execute: res => {
            // 上传凭证
            options.uptokenURL = request.url2 + 'qiniu-upload-token?token=' + res.data.token
            // 七牛云工具初始化
            qiniuUploader.init(options)
            // 七牛上传
            qiniuUploader.upload(obj.imgList[index], res => {
              // 成功后保存图片地址
              urls[index] = {
                "preview_url": res.imageURL,
                "url": res.imageURL
              }
              // 继续上传
              upload(index + 1, success)
            }, res => {
              // 失败回调
              obj.fail ? obj.fail(res) : () => { }
            })
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { }
        })
      } else {
        // 图片列表上传完执行成功回调
        success(urls)
      }
    }

    // 调用函数
    upload(0, obj.success ? obj.success : () => { })
  },

  // 发帖
  post: function (obj) {
    // 进行带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 接口地址
          url: request.url2 + 'release-post?token=' + res.data.token,
          // 数据
          data: {
            topic: obj.topic,
            content: obj.content,
            images: obj.images
          },
          // 请求方式
          method: 'POST',
          // 成功回调
          success: res => {
            // 请求成功
            if (res.data.code == 200) {
              // 成功回调
              if (obj.success) obj.success(res.data)
            } else {
              // 失败回调
              if (obj.fail) obj.fail(res.data)
            }
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { }
        })
      },
      // 失败回调
      fail: obj.fail ? obj.fail : () => { }
    })
  },

  // 删除
  delete: function (obj) {
    // 带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 接口地址
          url: request.url2 + '/delete',
          // 数据
          data: {
            token: res.data.token,
            target_type: obj.target_type,
            target_id: obj.target_id
          },
          // 成功回调
          success: obj.success ? obj.success : () => { },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { }
        })
      },
      // 失败回调
      fail: obj.fail ? obj.fail : () => { }
    })
  },

  // 获取评论
  comments: function (obj) {
    // 带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 接口地址
          url: request.url2 + '/get-post-comments',
          // 数据
          data: {
            token: res.data.token,
            post_id: obj.post_id,
            page: obj.page,
            type: obj.type
          },
          // 成功回调
          success: res => {
            // 执行成功
            if (res.data.code === 200) {
              // 格式化发帖时间
              for (let i = 0; i < res.data.data.comments.length; i++) {
                res.data.data.comments[i].release_time = formatSendTime(res.data.data.comments[i].release_time)
              }
              // 成功回调
              if (obj.success) obj.success(res.data)
            } else {
              // 失败回调
              if (obj.fail) obj.fail(res.data)
            }
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { }
        })
      },
      // 失败回调
      fail: obj.fail ? obj.fail : () => { }
    })
  },

  // 回复
  reply: function (obj) {
    // 进行带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 接口地址
          url: request.url2 + '/reply-post?token=' + res.data.token,
          // 数据
          data: {
            host_post: obj.host_post,
            target_type: obj.target_type,
            target_id: obj.target_id,
            content: obj.content,
            images: obj.images
          },
          // 请求方式
          method: 'POST',
          // 成功回调
          success: res => {
            // 请求成功
            if (res.data.code == 200) {
              // 成功回调
              if (obj.success) obj.success(res.data)
            } else {
              // 失败回调
              if (obj.fail) obj.fail(res.data)
            }
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { }
        })
      },
      // 失败回调
      fail: obj.fail ? obj.fail : () => { }
    })
  },

  // 搜索帖子
  search: function (obj) {
    // 发起带token的请求
    request.withToken({
      // 执行体
      execute: res => {
        // 发起普通请求
        request.common({
          // 接口地址
          url: request.url2 + '/posts',
          // 数据
          data: {
            token: res.data.token,
            page: obj.page,
            keyword: obj.keyword
          },
          // 成功回调
          success: res => {
            // 执行成功
            if (res.data.code === 200) {
              // 格式化发帖时间
              for (let i = 0; i < res.data.data.posts.length; i++) {
                if (res.data.data.posts[i]) res.data.data.posts[i].release_time = formatSendTime(res.data.data.posts[i].release_time)
              }
              // 成功回调
              obj.success ? obj.success(res.data) : () => { }
            } else {
              // 失败回调
              obj.fail ? obj.fail(res.data) : () => { }
            }
          },
          // 失败回调
          fail: obj.fail ? obj.fail : () => { },
          // 执行完成回调
          complete: obj.complete ? obj.complete : () => { }
        })
      },
      // 失败回调
      fail: obj.fail ? obj.fail : () => { },
    })
  },
  // 用户自己发送的帖子
  getMyPosts:function(obj){
    request.withToken({
      execute:res => {
        wx.request({
          url: request.url2+"/get-my-posts",
          data:{
            page:obj.page?obj.page:0,
            token:res.data.token
          },
          fail:obj.fail,
          complete:obj.complete,
          success:res=>{
            if(res.data.code == 200) {
              // 格式化发帖时间
              for (let i = 0; i < res.data.data.posts.length; i++) {
                if (res.data.data.posts[i]) res.data.data.posts[i].release_time = formatSendTime(res.data.data.posts[i].release_time)
              }
              let posts= res.data.data;
              (obj.success?obj.success:()=>{})(posts);
            }
            else{
              (obj.fail?obj.fail:()=>{})();
            }
          }
        })
      }
    })
  },
  // 获取未读消息的个数
  getUnreadMessageNum(obj){
    request.withToken({
      execute: res => {
        wx.request({
          url: request.url2+'/get-unread-message-num',
          data:{
            token: res.data.token
          },
          success:res=>{
            if(res.data.code === 200) (obj.success?obj.success:()=>{})(res.data.data);
            else (obj.fail?obj.fail:()=>{})();
          },
          complete:obj.complete,
          fail:obj.fail
        })
      }
    })
  },
}

// 导出工具
module.exports = {
  qaService: qaService
}