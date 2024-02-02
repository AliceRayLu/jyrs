// index.js
// 获取应用实例
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {

  },
  onLoad() {
    
  },
  toLogin(){
    let uname = app.globalData.uname
    if(uname === ""){
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }else{
      wx.switchTab({
        url: '/pages/user/user',
      })
    }
  },

  toRegister(){
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },

  toCall(){
    let uname = app.globalData.uname
    if(uname !== "BD4TS"){
      wx.showToast({
        title: '仅管理员可用',
        icon:'error'
      })
    }else{
      wx.showToast({
        title: '还未开放功能',
        icon:'error'
      })
    }
  },

  toAct(){
    let uname = app.globalData.uname
    if(uname === ""){
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }else{
      wx.switchTab({
        url: '/pages/activities/activities',
      })
    }
  }

})
