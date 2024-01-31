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

    console.log(uname)
    console.log(passwd)

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
            app.globalData.uname = uname
            console.log(user.uname)
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

})
