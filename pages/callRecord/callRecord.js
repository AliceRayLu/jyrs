// pages/callRecord/callRecord.js
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    due: '',
    callLogs: '',
    fileName: '',
    downloadPath:''
  },


  chooseFile: function() {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      success(res) {
        // console.log(res)
        // console.log(res.tempFiles[0])
        let fileName = res.tempFiles[0].name;
        if (fileName.indexOf('/') >= 0) {
          // 如果是 iOS 平台，从路径中解析出文件名
          fileName = fileName.split('/').pop();
        }
        that.setData({
          fileName: fileName
        });
        wx.cloud.uploadFile({
          filePath:res.tempFiles[0].path,
          cloudPath:`calls/${fileName}`
        }).then(r2 => {
          let fileID = r2.fileID
          wx.cloud.getTempFileURL({
            fileList:[fileID],
            success(r3){
              that.setData({
                downloadPath:r3.fileList[0].tempFileURL
              })
              console.log(r3.fileList[0].tempFileURL)
            }
          })
        })
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
    
    upload(){
      if(this.data.downloadPath === ""){
        wx.showToast({
          title: '请上传文件',
          icon:'error'
        })
        return
      }
      if(this.data.due == ""){
        wx.showToast({
          title: '请选择时间',
          icon:'error'
        })
        return
      }
      let _this = this
      // TODO: parse excel and control
      db.collection('call_file').add({
        data:{
          log: _this.data.callLogs,
          file: _this.data.downloadPath,
          time: _this.data.due
        }
      }).then(res => {
        // wx.navigateTo({
        //   url: 'url', // TODO
        // })
      })
    }

});