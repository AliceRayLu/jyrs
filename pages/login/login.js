// index.js
// 获取应用实例
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    uname:'',
    passwd:'',
    location: '',
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    
  },
  //获取输入的账号
  getName(event) {
    this.setData({
      uname: event.detail.value
    })
  },

  //获取输入的密码
  getPassword(event) {
    this.setData({
      passwd: event.detail.value
    })
  },

  setLocation(event){
    this.setData({
      location: event.detail.location
    })
  },

  login(){
    let uname = this.data.uname;
    let passwd = this.data.passwd;
    let location = this.data.location;

    if(!location){
      wx.showToast({
        title: '请选择地区',
        icon: 'error'
      })
      return
    }

    console.log(uname)
    console.log(passwd)
    console.log(location)

    db.collection('admin').where({
      call: uname
    }).get().then(res => {
        console.log("find from admin db", res)
        if(res.data.length != 0){
          let user = res.data[0]
          if(passwd == user.passwd){
            app.globalData.uname = uname
            //设置地区
            app.globalData.location = location
            if(user.locale != location){
              app.globalData.location = user.locale
            }
            app.globalData.isAdmin = true
            wx.switchTab({
              url: '/pages/mine/mine',
              success: function (e) {
 
                let page = getCurrentPages().pop();
         
                if (page == undefined || page == null) return;
         
                    page.onLoad();
         
              }
            })
            //保存用户登陆状态
            wx.setStorageSync('user', user)
          } else {
            wx.showToast({
              icon: 'none',
              title: '账号或密码不正确',
            })
          }
          console.log("setting up global state:", app.globalData)
        } else {
          db.collection('members_'+location).where({
            call:uname
          }).get({
            success(res) {
              if (res.data.length != 0)
              {
                let user = res.data[0]
                if (passwd == user.passwd) {                                                             
                  app.globalData.uname = uname
                  // 设置地区
                  app.globalData.location = location
                  console.log(user.uname)
                  wx.switchTab({
                    url: '/pages/mine/mine',
                    success: function (e) {
       
                      let page = getCurrentPages().pop();
               
                      if (page == undefined || page == null) return;
               
                          page.onLoad();
               
                    }
                  })
                  //保存用户登陆状态
                  wx.setStorageSync('user', user)
                } else {
                  wx.showToast({
                    icon: 'none',
                    title: '账号或密码不正确',
                  })
                }
              }else{
              wx.showToast({
                  title: '该用户不存在',
                  icon:"error"
              })
              }
            }
          })
      }
    })
  },  

  toRegister(){
    wx.navigateTo({
      url: '/pages/register/register',
    })
  }
  // getUserProfile(e) {
  //   // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
  //   wx.getUserProfile({
  //     desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
  //     success: (res) => {
  //       console.log(res)
  //       this.setData({
  //         userInfo: res.userInfo,
  //         hasUserInfo: true
  //       })
  //     }
  //   })
  // },
  // getUserInfo(e) {
  //   // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
  //   console.log(e)
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // }
})
