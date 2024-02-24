// pages/userInfoUpdate/userInfoUpdate.js
const db = wx.cloud.database()
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname:"",
    pic:[],
    picPath:"",
    man:"", //设台人员
    cert:"", //证件号码
    call:"", //电台呼号
    type:"", //电台类型
    location:"", //电台地址
    due:"", //到期时间
    img_url:"",
    phone:"",
    isHelper:false
  },

  getPhone(event){
    this.setData({
      phone: event.detail.value
    })
  },

  bindDateChange(event){
    console.log( new Date(event.detail.value))
    this.setData({
      due:event.detail.value
    })
  },

  getman(event){
    this.setData({
      man: event.detail.value
    })
  },

  getcert(event){
    this.setData({
      cert: event.detail.value
    })
  },

  getcall(event){
    this.setData({
      call: event.detail.value
    })
  },

  gettype(event){
    this.setData({
      type: event.detail.value
    })
  },

  getloca(event){
    this.setData({
      location: event.detail.value
    })
  },

  recognize:function(pic_path){
    console.log("Start recognize...")
    let img_url = ""
    let _this = this
    wx.cloud.getTempFileURL({
      fileList:[pic_path],
      success(res){
        console.log("urlll"+res.fileList[0].tempFileURL)
        img_url = res.fileList[0].tempFileURL
        wx.serviceMarket.invokeService({
          service: 'wx79ac3de8be320b71', // '固定为服务商OCR的appid，非小程序appid',
          api: 'OcrAllInOne',
          data: {
            img_url: img_url,
            data_type: 3,
            ocr_type: 8,
          },
        }).then(res => {
          console.log('invokeService success', res)
          let data = res.data.ocr_comm_res.items
          console.log(data[8].text)
          for(var i = 0;i < data.length;i++){
            let s = data[i].text
            if(s.substring(0,4) == "设台人员"){
              _this.setData({
                man:s.substring(5)
              })
            }
            if(s.substring(0,4) == "电台类型"){
              _this.setData({
                type:s.substring(5)
              })
            }
            if(s.substring(0,4) == "电台呼号"){
              _this.setData({
                call:s.substring(5)
              })
            }
            if(s.substring(0,4) == "证件号码"){
              _this.setData({
                cert:s.substring(5)
              })
            }
            if(s.substring(0,4) == "台站地址"){
              _this.setData({
                location:s.substring(5)
              })
            }
            if(s.substring(0,3) == "有效期"){
              _this.setData({
                due:s.substring(4)
              })
            }
          }

        }).catch(err => {
          console.error('invokeService fail', err)
          wx.showModal({
            title: 'fail',
            content: err + '',
          })
        })
      }
    })
    
  },

  loadPic(){
    let _this = this
    wx.showActionSheet({
      itemList: ['拍照', '选择本地文件'],
      success (res) {
        if(res.tapIndex == 0){
          wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            count:1,
            success(res) {
              _this.setData({
                pic: res.tempFilePaths,
              })
              let list = []
              for(let i = 0;i < _this.data.pic.length;i++){
                wx.cloud.uploadFile({
                  filePath: res.tempFilePaths[i],
                  cloudPath:"license/"+Date.now()+".jpg",
                }).then(res=>{
                  list.push(res.fileID)
                  // console.log(res)
                  let path = _this.data.picPath
                  if(path != ""){
                    wx.cloud.deleteFile({
                      fileList:[path]
                    })
                  }
                  _this.setData({
                    picPath:list[0]
                  })
                }).then(res=>{
                  _this.recognize(_this.data.picPath)
                })
              }
            }
          })
        }
        if(res.tapIndex == 1){
          wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            count:1,
            success(res) {
              _this.setData({
                pic: res.tempFilePaths,
              })
              let list = []
              for(let i = 0;i < _this.data.pic.length;i++){
                wx.cloud.uploadFile({
                  filePath: res.tempFilePaths[i],
                  cloudPath:"license/"+Date.now()+".jpg",
                })
                .then(res=>{
                  list.push(res.fileID)
                  // console.log(res)
                  let path = _this.data.picPath
                  if(path != ""){
                    wx.cloud.deleteFile({
                      fileList:[path]
                    })
                  }
                  _this.setData({
                    picPath:list[0],
                  })
                }).then(res=>{
                  _this.recognize(_this.data.picPath)
                })
              }
            }
          })
        }
      }
    })
  },

  update(){
    let uname = this.data.uname
    let _this = this
    let updatedData = {}
    if(this.data.phone != ""){
      updatedData['phone'] = _this.data.phone
    }
    if(this.data.pic.length > 0){
      updatedData['license'] = _this.data.picPath
      db.collection('members').where({
        call:uname
      }).get().then(res => {
        let path = res.data[0]['license']
        if(path != ""){
          wx.cloud.deleteFile({
            fileList:[path]
          })
        }
      })
    }
    if(this.data.man != ""){
      updatedData['man'] = _this.data.man
      db.collection('call_record').where({
        call:uname
      }).update({
        man:_this.data.man
      })
    }
    if(this.data.cert != ""){
      updatedData['certificate'] = _this.data.cert
    }
    if(this.data.call != ""){
      updatedData['call'] = _this.data.call
    }
    if(this.data.type != ""){
      updatedData['type'] = _this.data.type
    }
    if(this.data.location != ""){
      updatedData['location'] = _this.data.location
    }
    if(this.data.due != ""){
      updatedData['due'] = new Date(_this.data.due)
    }
    
    if(Object.keys(updatedData).length == 0){
      wx.showToast({
        title: '没有任何信息更新',
        icon:'error'
      })
      return;
    }

    db.collection('members').where({
      call: uname
    }).update({
      data:(updatedData)
    })
      

    wx.navigateBack({
      success:function(e){
        let page = getCurrentPages().pop()
        if (page == undefined || page == null) return;
        page.onLoad();
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this
    let uname = app.globalData.uname
    if(app.globalData.helpee != ""){
      uname = app.globalData.helpee
      _this.setData({
        uname:uname,
        isHelper:true
      })
    }else{
      _this.setData({
        uname: uname
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})