// pages/mine/mine.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    controlData: [
      { date: '2021.2.2', time: '12:00:00' },
      { date: '2024.1.1', time: '12:00:00' },
      { date: '2022.1.2', time: '12:00:00' },
      { date: '2023.1.3', time: '12:00:00' },
      { date: '2022.1.4', time: '12:00:00' }
    ],
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
    
    let controlData = this.data.controlData;
    let yearList = [];
    let dataByYear = {};
    for (let item of controlData) {
      let year = item.date.split(".")[0];
      if (!dataByYear[year]) {
        yearList.push(year);
        dataByYear[year] = [];
      }
      dataByYear[year].push(item);
    }

    yearList.sort(function(a, b) {
      return b - a;
    }) 

    this.setData({
      controlYear: yearList,
      controlList: dataByYear
    });
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
    let _this = this
    _this.setData({
      uname: uname
    })
  
    db.collection('members').where({
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

    db.collection('call_record').where({
      call:uname
    }).field({
      _id:false,
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
          controlYear:controlY,
          controlList:controlD,
          callYear:callY,
          callList:callD
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