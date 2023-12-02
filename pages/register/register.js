// pages/register.js
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname:"",
    passwd:"",
    passwd2:"",
    pic:"",
    man:"", //设台人员
    cert:"", //证件号码
    call:"", //电台呼号
    type:"", //电台类型
    location:"", //电台地址
    due:Date(), //到期时间
  },

  getUName(event){
    this.setData({
      uname: event.detail.value
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

  register(){
    let uname = this.data.uname
    db.collection('members').where({
      uname:uname
    }).get({
      success(res){
        if (res.data.length != 0){
          verified = false
          wx.showToast({
            title: '该用户名已存在',
            icon:"error"
          })
          return
        }
      }
    })
    let p1 = this.data.passwd
    let p2 = this.data.passwd2
    if(p1 != p2){
      wx.showToast({
        title: '两次输入密码不同',
        icon:"error"
      })
      return
    }
    
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