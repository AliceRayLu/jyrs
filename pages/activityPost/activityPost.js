// pages/activityPost/activityPost.js
const app = getApp()
const db = wx.cloud.database()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pic:[],
    picPath:"",
    title:"",
    time:"",
    location:"",
    detail:"",
  },

  getName(event){
    this.setData({
      title:event.detail.value
    })
  },

  bindDateChange(event){
    this.setData({
      time:event.detail.value
    })
  },

  getLocal(event){
    this.setData({
      location: event.detail.value
    })
  },

  getDes(event){
    this.setData({
      detail: event.detail.value
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
                  cloudPath:"activity/"+Date.now()+".jpg",
                }).then(res=>{
                  list.push(res.fileID)
                  console.log(list)
                  _this.setData({
                    picPath:list[0]
                  })
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
                  cloudPath:"activity/"+Date.now()+".jpg",
                })
                .then(res=>{
                  list.push(res.fileID)
                  console.log(list)
                  _this.setData({
                    picPath:list[0]
                  })
                })
              }
            }
          })
        }
      }
    })
  },

  post(){
    let index = Date.now()+""
    if(this.data.title == ""){
      wx.showToast({
        title: '请填写活动名称',
        icon:'error'
      })
      return
    }
    if(this.data.time == ""){
      wx.showToast({
        title: '请选择活动时间',
        icon:'error'
      })
      return 
    }
    if(this.data.location == ""){
      wx.showToast({
        title: '请填写活动地点',
        icon:'error'
      })
      return 
    }
    let _this = this
    db.collection('activities').add({
      data:{
        aid:index,
        detail:_this.data.detail,
        location: _this.data.location,
        time: new Date(_this.data.time),
        pic: _this.data.picPath,
        title: _this.data.title,
        participants:[]
      }
    }).then(res => {
      wx.switchTab({
        url: '/pages/activities/activities',
      })
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