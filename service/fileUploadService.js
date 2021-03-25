let fileService = {
  /**
   * 通过浏览器访问网站上传远程文件
   */
  uploadRemoteFile: function(obj){
    let callbackCode = Math.random;
    wx.navigateTo({
      url: `../print-remote-upload-file/print-remote-upload-file?callbackCode=${callbackCode}`,
      success: res => {
        let chanel = res.eventChannel;
        chanel.emit(callbackCode, {
          fileHandler: res => {
            let message = {
              fileName: res.file.name,
              fileSize: res.file.size,
              url: res.file.url
            };
            (obj.success ? obj.success : () => { })(message);
          }
        });
      }
    })
  },
  /**
   * 通过webview上传本机文件
   */
  uploadLocalFile: function(obj) {
    let callbackCode = Math.random;
    wx.navigateTo({
      url: `../print-order/print-order?src=${obj.src ? obj.src : '服务器'}&callbackCode=${callbackCode}`,
      success: res => {
        let chanel = res.eventChannel;
        chanel.emit(callbackCode, {
          fileHandler: message => {
            (obj.success ? obj.success : () => {})(message);
          }
        });
      }
    })
  },

  /**
   * 上传微信聊天的文件
   * @param {*} e 
   */
  uploadWxFile: function(obj) {
    wx.chooseMessageFile({
      count: 1,
      success: res => {
        let files = [];
        res.tempFiles.map(f => {
          files.push(f.path);
        });
        wx.showLoading({
          title: '上传中',
        });
        qaService.uploadImageList({
          imgList: files,
          success: urls => {
            let url = urls[0].url;
            let name = res.tempFiles[0].name;
            (obj.success ? obj.success : () => {})({
              fileName: name,
              url: url,
              fileSize: files[0].size
            });
            wx.hideLoading({
              complete: (res) => {},
            })
          }
        });
      }
    })
  },
}

module.exports.fileService = fileService;