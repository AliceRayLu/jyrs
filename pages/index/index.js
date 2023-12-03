// index.js
// 获取应用实例
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    uname:'',
    passwd:''
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

  login(){
    let uname = this.data.uname;
    let passwd = this.data.passwd;

    //登陆
    db.collection('members').where({
      uname:uname
    }).get({
      success(res) {
        if (res.data.length != 0)
        {
          let user = res.data[0]
          if (passwd == user.passwd) {                                                             
            wx.showToast({
              title: '登陆成功',
            })
            app.globalData.uid = user.uid
            console.log(user.uid)
            wx.switchTab({
              url: '/pages/user/user',
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
