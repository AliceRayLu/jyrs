// pages/user/user.js
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname:"",
    isAdmin: false,
    picPath:[],
    man:"", //设台人员
    cert:"", //证件号码
    call:"", //电台呼号
    type:"", //电台类型
    location:"", //电台地址
    beforedue: -1, //距到期时间天数
    year:-1,
    month:-1,
    date:-1,
    phone:"",
  },

  update(){
    wx.navigateTo({
      url: '/pages/userInfoUpdate/userInfoUpdate',
    })
  },

  toLogin(){
    app.globalData.uname = ""
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  toMembers(){
    wx.navigateTo({
      url: '/pages/members/members',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.data.uname = app.globalData.uname
    if(this.data.uname === ""){
      wx.navigateTo({
        url: '/pages/login/login',
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
    this.data.uname = app.globalData.uname
    let uname = this.data.uname
    let _this = this
    if(uname === "BD4TS"){
      _this.setData({
        isAdmin: true
      })
    }
    db.collection('members').where({
      call:uname
    }).get({
      success(res){
        let user = res.data[0]
        _this.setData({
          phone: user.phone,
          year:user.due.getFullYear(),
          month: user.due.getMonth()+1,
          date: user.due.getDate(),
          picPath: [user.license],
          man:user.man,
          cert: user.certificate,
          call: user.call,
          type: user.type,
          location: user.location,
          beforedue: parseInt((user.due.getTime()- new Date().getTime())/1000/60/60/24),
        })
        
      }
    })
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