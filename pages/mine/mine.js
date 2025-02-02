// pages/mine/mine.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    controlYear: [],
    controlList: {},
    callYear:[],
    callList:{},
    uname:"",
    man:"",
    beforedue: -1, //距到期时间天数
    year:-1,
    month:-1,
    date:-1,
    emptyCall:"",
    emptyControl:"",
    locale: "",
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

  toDetail(){
    wx.navigateTo({
      url: '/pages/user/user',
    })
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
    let uname = app.globalData.uname
    let locale = app.globalData.location
    let _this = this
    _this.setData({
      uname: uname,
      locale: locale
    })
  
    db.collection('members_'+locale).where({
      call:uname
    }).get({
      success(res){
        let user = res.data[0]
        _this.setData({
          year:user.due.getFullYear(),
          month: user.due.getMonth()+1,
          date: user.due.getDate(),
          man:user.man,
          beforedue: parseInt((user.due.getTime()- new Date().getTime())/1000/60/60/24),
        })
      }
    })

    db.collection('call_record_'+locale).where({
      call:uname
    }).field({
      _id:false,
      _openid:false,
      man:false,
      call:false
    }).get({
      success(res){
        let info = res.data[0]
        let keys = Object.keys(info)
        let callY = [],controlY = []
        let callD = {},controlD = {}
        // console.log(keys)
        for(var i in keys){
          let key = keys[i];
          if(key.startsWith('call')){
            callY.push(key.substr(4))
            callD[key.substr(4)] = info[key]
          }else{
            controlY.push(key.substr(7))
            controlD[key.substr(7)] = info[key]
          }
        }
        _this.setData({
          controlYear:controlY.reverse(),
          controlList:controlD,
          callYear:callY.reverse(),
          callList:callD
        })
        if(controlY.length == 0){
          _this.setData({
            emptyControl:"暂无数据~"
          })
        }
        if(callY.length == 0){
          _this.setData({
            emptyCall:"暂无数据~"
          })
        }
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