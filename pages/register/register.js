// pages/register.js
const db = wx.cloud.database()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    passwd:"",
    passwd2:"",
    pic:[],
    picPath:"",
    man:"", //设台人员
    cert:"", //证件号码
    call:"", //电台呼号
    type:"", //电台类型
    location:"", //电台地址
    due:"", //到期时间
    phone:"",
  },
  
  bindDateChange(event){
    console.log( new Date(event.detail.value))
    this.setData({
      due:event.detail.value
    })
  },

  getPasswd(event){
    this.setData({
      passwd: event.detail.value
    })
  },

  getPasswdAgain(event){
    this.setData({
      passwd2: event.detail.value
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

  getPhone(event){
    this.setData({
      phone: event.detail.value
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
                  console.log(list)
                  _this.setData({
                    picPath:list[0]
                  })
                }).then(res => {
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
                  console.log(list)
                  _this.setData({
                    picPath:list[0]
                  })
                }).then(res => {
                  _this.recognize(_this.data.picPath)
                })
              }
            }
          })
        }
      }
    })
  },

  register(){
    let uname = this.data.call
    console.log(this.data.call)
    let _this = this
    if(this.data.call === ""){
      wx.showToast({
        title: '请填写电台呼号',
        icon:"error"
      })
      return
    }
    db.collection('members').where({
      call: uname
    }).get().then(res => {
      if (res.data.length != 0){
        wx.showToast({
          title: '该用户已存在',
          icon:"error"
        })
        return
      }
      let p1 = _this.data.passwd
      let p2 = _this.data.passwd2
      console.log(p1)
      console.log(p2)
      if(p1 != p2){
        wx.showToast({
          title: '两次密码不同',
          icon:"error"
        })
        return
      }
      if(_this.data.phone == ""){
        wx.showToast({
          title: '请填写电话',
          icon:"error"
        })
        return
      }
      if(_this.data.pic.length != 0){
        if(_this.data.man == ""){
          wx.showToast({
            title: '请填写设台人员',
            icon:"error"
          })
          return
        }
      if(_this.data.cert == ""){
        wx.showToast({
          title: '请填写证件号码',
          icon:"error"
        })
        return
      }
      if(_this.data.type == ""){
        wx.showToast({
          title: '请填写电台类型',
          icon:"error"
        })
        return
      }
      if(_this.data.location == ""){
        wx.showToast({
          title: '请填写台站地址',
          icon:"error"
        })
        return
      }
      if(_this.data.due == ""){
        wx.showToast({
          title: '请选择到期时间',
          icon:"error"
        })
        return
      }
    }
    db.collection('members').add({
      data:{
        passwd: _this.data.passwd,
        due: new Date(_this.data.due),
        location: _this.data.location,
        call: _this.data.call,
        license: _this.data.picPath,
        type: _this.data.type,
        man: _this.data.man,
        certificate: _this.data.cert,
        phone: _this.data.phone
      }
    }).then(res =>{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    })
    })
    
    db.collection('call_record').add({
      data:{
        call:_this.data.call,
        man:_this.data.man
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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