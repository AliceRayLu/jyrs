// pages/callManage.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files:[],
    count: 0,
    pop: false,
    durl:""
  },

  download(event){
    let _this = this
    let index = event.currentTarget.dataset.id;
    this.setData({
      pop:true,
      durl:_this.data.files[index].file
    })
    wx.setClipboardData({
      data: _this.data.files[index].file,
    })
  },

  cancelD(){
    this.setData({
      pop:false
    })
  },

  delete(event){
    wx.showToast({
      title: '删除中',
      icon:'loading',
      duration:3000
    })
    let index = event.currentTarget.dataset.id;
    let time = this.data.files[index]['time']
    let year = time.substr(0,4)
    let control = "control"+year
    let call = "call"+year
    let _this = this
    db.collection('call_record').where({
      call: _this.data.files[index]['control']
    }).update({
      data:{
        [control]:_.pull(time)
      }
    })
    let caller = this.data.files[index]['caller']
    for(var i in caller){
      let name = caller[i]
      db.collection('call_record').where({
        call:name
      }).update({
        data:{
          [call]:_.pull(time)
        }
      })
    }
    db.collection('call_file').where({
      time:time
    }).remove().then(res => {
      _this.onShow()
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
    let _this = this
    let count = this.data.count
    db.collection('call_file').orderBy("time",'desc').get().then(res => {
      _this.setData({
        files:res.data
      })
    }).then(res => {
      count += 20
      _this.setData({
        count:count
      })
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
    let _this = this
    let count = this.data.count
    db.collection('call_file').orderBy('time','desc').skip(count).get().then(res => {
      let newdata = res.data
      let olddata = _this.data.files
      count += 20
      _this.setData({
        files:olddata.concat(newdata)
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})