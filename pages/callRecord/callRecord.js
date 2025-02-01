// pages/callRecord/callRecord.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
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
    fileID:'',
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
          let oldid = that.data.fileID
          if(oldid != ''){
            wx.cloud.deleteFile({
              fileList:[oldid]
            })
          }
          that.setData({
            fileID:fileID
          })
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
      let locale = app.globalData.location
      wx.showToast({
        title: '上传中',
        icon:'loading',
        duration:6000
      }).then(res => {
        const fs = wx.getFileSystemManager()
        let fileData;
        let year = _this.data.due.substr(0,4)
        let head = "control"+year
        // 将主控人员以空格分隔为数组
        const controlList = this.data.control.split(/\s+/).filter(Boolean);
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
              if(!Object.keys(data[i]).includes('呼号')){
                wx.showToast({
                  title: '文件格式不对',
                  icon:'error'
                })
                wx.cloud.deleteFile({
                  fileList:[_this.data.fileID]
                })
                return
              }
              caller.push(data[i]['呼号'])
              let title = "call"+year
              let c = data[i]['呼号']
              console.log(c)
              db.collection('call_record_'+locale).where({
                call:c
              }).update({
                data:{
                  [title]:_.push(_this.data.due)
                }
              }).then(res =>{
                console.log(c)
                console.log(res)
                if(res['stats']['updated'] == 0){
                  let d = {
                    "call":c,
                    [title]:[_this.data.due]
                  }
                  _this.addToDB('call_record_'+locale,d)
                }
              })
            }

            console.log(caller)

            db.collection('call_file_'+locale).add({
              data:{
                log: _this.data.callLogs,
                file: _this.data.downloadPath,
                fileID: _this.data.fileID,
                time: _this.data.due,
                control:controlList,
                caller:caller
              }
            }).then(res => {
              console.log(year)
               // 遍历主控人员列表，逐个更新数据库
           controlList.forEach((controlPerson) => {
            db.collection("call_record_"+locale)
              .where({
                call: controlPerson,
              })
              .update({
                data: {
                  [head]: _.push(_this.data.due),
                },
              })
              .then((res) => {
                if (res["stats"]["updated"] == 0) {
                  const d = {
                    call: controlPerson,
                    [head]: [_this.data.due],
                  };
                  _this.addToDB("call_record_"+locale, d);
                }
              });
          });
              // db.collection('call_record').where({
              //   call:_this.data.control
              // }).update({
              //   data:{
              //     [head]: _.push(_this.data.due)
              //   },
              // }).then(res => {
              //   if(res['stats']['updated'] == 0){
              //     let d = {
              //       "call":_this.data.control,
              //       [head]:[_this.data.due]
              //     }
              //     this.addToDB('call_record',d)
              //   }
                
              // }) 
            }).then(res => {
              wx.navigateTo({
                url: '/pages/call/call', 
              })
            })
          }
        })
      })
      
    },

    addToDB(name,data){
      db.collection(name).add({
        data:data
      })
    },
    

});