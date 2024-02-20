// pages/callRecord/callRecord.js
const db = wx.cloud.database()
const _ = db.command
import XLSX from '../../xlsx.mini.min'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    due: '',
    callLogs: '',
    fileName: '',
    downloadPath:'',
    tempFilePath:'',
    control:""
  },

  getControl(event){
    this.setData({
      control:event.detail.value
    })
  },


  chooseFile: function() {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      success(res) {
        // console.log(res)
        // console.log(res.tempFiles[0])
        let fileName = res.tempFiles[0].name;
        that.setData({
          tempFilePath: res.tempFiles[0].path
        })
        if (fileName.indexOf('/') >= 0) {
          // 如果是 iOS 平台，从路径中解析出文件名
          fileName = fileName.split('/').pop();
        }
        that.setData({
          fileName: fileName
        });
        let name = Date.now()+fileName
        wx.cloud.uploadFile({
          filePath:res.tempFiles[0].path,
          cloudPath:`calls/${name}`
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
      if(this.data.control == ""){
        wx.showToast({
          title: '请填写主控人员',
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
          time: _this.data.due,
          control:_this.data.control
        }
      }).then(res => {
        let year = _this.data.due.substr(0,4)
        console.log(year)
        let head = "control"+year
        db.collection('call_record').where({
          call:_this.data.control
        }).update({
          data:{
            [head]: _.push(_this.data.due)
          },
        }).then(res => {
          wx.showToast({
            title: '上传中',
            icon:'loading',
            duration:6000
          }).then(res => {
            const fs = wx.getFileSystemManager()
            let fileData;
            fs.readFile({
              filePath: _this.data.tempFilePath,
              encoding:'base64',
              success(res){
                fileData = res.data
                const workbook = XLSX.read(fileData, { type: 'base64' });
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);
                console.log(data)

                let caller = []
                for(var i in data){
                  caller.push(data[i]['呼号'])
                  let title = "call"+year
                  db.collection('call_record').where({
                    call:data[i]['呼号']
                  }).update({
                    data:{
                      [title]:_.push(_this.data.due)
                    }
                  })
                }

                console.log(caller)

                db.collection('call_file').where({
                  file:_this.data.downloadPath
                }).update({
                  data:{
                    caller:caller
                  },
                }).then(res =>{
                  wx.navigateTo({
                    url: '/pages/call/call', 
                  })
                })
              }
            })
          })
        })
        
      })
    }

});