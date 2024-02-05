// pages/callRecord/callRecord.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    due: '',
    callLogs: '',
    fileName: ''
  },


  chooseFile: function() {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      success(res) {
        // console.log(res)
        // console.log(res.tempFiles[0])
        let tempFilePaths = res.tempFiles[0].name;
        if (tempFilePaths.indexOf('/') >= 0) {
          // 如果是 iOS 平台，从路径中解析出文件名
          tempFilePaths = tempFilePaths.split('/').pop();
        }
        that.setData({
          fileName: tempFilePaths
        });
        // 逻辑代码
      }
    })
  },


    // 点名时间输入框绑定函数
    callTime: function(e) {
      this.setData({
        due: e.detail.value
      });
    },
    
    // 点名备注输入框绑定函数
    callLogs: function(e) {
      this.setData({
        callLogs: e.detail.value
      });
    },
    
    // 按钮点击事件处理函数
    handleButtonClick: function() {
      console.log('点名时间:', this.data.callTime);
      console.log('备注:', this.data.callLogs);
    },
  /**
   * 提交表单
   */
  handleSubmit: function () {
    console.log('提交表单', this.data.formData);
  },

});