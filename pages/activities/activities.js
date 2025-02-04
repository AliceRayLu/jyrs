// pages/activities.js
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activities: [
      {
        id: 1,
        name: "2023年年会",
        time: "2023.12.15 周五",
        location: "永利大酒店",
        image: "/images/logo.jpg",
        status: 0
      },
      {
        id: 2,
        name: "2023年年会",
        time: "2023.12.15 周五",
        location: "永利大酒店",
        image: null,
        status: 1
      },
      {
        id: 2,
        name: "2023年年会",
        time: "2023.12.15 周五",
        location: "永利大酒店",
        image: null,
        status: 2
      }
    ],
    isAdmin: false,
  },

  addAct(){
    wx.navigateTo({
      url: '/pages/activityPost/activityPost',
    })
  },

  toDetail(event){
    let index=event.currentTarget.dataset.index
    console.log(index)
    app.globalData.current_act = this.data.activities[index].aid
    console.log(app.globalData.current_act)
    wx.navigateTo({
      url: '/pages/activityDetail/activityDetail',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let uname = app.globalData.uname
    if(uname === ""){
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
    let isAdmin = app.globalData.isAdmin
    this.setData({
      isAdmin: isAdmin
    })
    let _this = this
    let locale = app.globalData.location
    let uname = app.globalData.uname
    db.collection('activities_'+locale).orderBy('time','desc').get().then(res => {
      _this.setData({
        activities: res.data
      })
    }).then(res => {
      let copy = _this.data.activities
      let day = ["日","一","二","三","四","五","六"]
      for(var i = 0;i < copy.length;i++){
        if(copy[i].time < (new Date()) || _this.data.isAdmin){
          copy[i].status = 2
        }else{
          if(copy[i].participants.includes(uname)){
            copy[i].status = 1
          }else{
            copy[i].status = 0
          }
        }
        copy[i].time = copy[i].time.getFullYear()+"-"+(copy[i].time.getMonth()+1)+"-"+copy[i].time.getDate()+"  周"+day[copy[i].time.getDay()]
        
      }
      _this.setData({
        activities:copy
      })
    })
  },

  sign(event){
    let index = event.currentTarget.dataset.index
    let _this = this
    let locale = app.globalData.location
    this.data.activities[index].participants.push(app.globalData.uname)
    console.log(this.data.activities[index])
    db.collection('activities_'+locale).where({
      aid: _this.data.activities[index].aid
    }).update({
      data:{
        participants: _this.data.activities[index].participants
      }
    }).then(res=>{
      _this.onShow()
    })
  },

  cancel(event){
    let index = event.currentTarget.dataset.index
    let _this = this
    let locale = app.globalData.location
    this.data.activities[index].participants = this.data.activities[index].participants.filter(item => item != app.globalData.uname)
    db.collection('activities_'+locale).where({
      aid:_this.data.activities[index].aid
    }).update({
      data:{
        participants: _this.data.activities[index].participants
      }
    }).then(res => {
      _this.onShow()
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