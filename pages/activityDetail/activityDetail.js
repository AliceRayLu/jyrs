// pages/activityDetail/activityDetail.js
import XLSX from '../../xlsx.mini.min'
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: -1,
    title:"",
    time:"",
    place:"",
    detail:"",
    pic:"/images/logo.jpg",
    participants:[],
    num: 0,
    status:true,
    isAdmin: false,
    pop: false,
    durl:"",
    sign_data:[]
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
    if(app.globalData.uname === "BD4TS"){
      this.setData({
        isAdmin:true
      })
    }
    let idx = app.globalData.current_act
    this.setData({
      id:idx
    })
    let _this = this
    let day = ["日","一","二","三","四","五","六"]
    db.collection('activities').where({
      aid:idx
    }).get({
      success(res){
        let act = res.data[0]
        _this.setData({
          title:act.title,
          time: act.time.getFullYear()+"-"+(act.time.getMonth()+1)+"-"+act.time.getDate()+"  周"+day[act.time.getDay()],
          place: act.location,
          detail: act.detail,
          participants: act.participants,
          num: act.participants.length,
        })
        if(act.pic != ""){
          _this.setData({
            pic:act.pic
          })
        }
        if(_this.data.participants.includes(app.globalData.uname)){
          _this.setData({
            status:true
          })
        }else{
          _this.setData({
            status:false
          })
        }
        if(_this.data.isAdmin){
          let title = act.chosen
          let data = []
          data.push(title)
          let pa = act.participants
          for(let i = 0;i < pa.length;i++){
            if(pa[i] == "")continue
            let temp = []
            db.collection('members').where({
              call: pa[i]
            }).get().then(res2 => {
              let usr = JSON.stringify(res2.data[0],title)
              console.log(usr)
              temp = usr.match(/:"([a-zA-Z0-9\u4e00-\u9fa5]*)"/g).map(item=>item.substring(2,item.length-1))
              console.log(temp)
              data.push(temp)
              _this.setData({
                sign_data:data
              })
            })
          }
        }
      }
    })
  },

  sign(event){
    let _this = this
    this.data.participants.push(app.globalData.uname)
    console.log(this.data.participants)
    db.collection('activities').where({
      aid: _this.data.id
    }).update({
      data:{
        participants: _this.data.participants
      }
    }).then(res=>{
      _this.onShow()
    })
  },

  cancel(event){
    let _this = this
    this.data.participants = this.data.participants.filter(item => item != app.globalData.uname)
    db.collection('activities').where({
      aid:_this.data.id
    }).update({
      data:{
        participants: _this.data.participants
      }
    }).then(res => {
      _this.onShow()
    })
  },

  delete(){
    let _this = this
    db.collection('activities').where({
      aid: _this.data.id
    }).remove().then(res =>{
      wx.switchTab({
        url: '/pages/activities/activities',
      })
    }).catch(err => {
      wx.showToast({
        title: '删除失败',
        icon:'error'
      })
    })
  },

  download:function(event){
    let _this = this
      console.log(this.data.sign_data)
      var ws = XLSX.utils.aoa_to_sheet(this.data.sign_data);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "sheet");
      var fileData = XLSX.write(wb, {
        bookType: "xlsx",
        type: 'base64'
      });
      let filePath = `${wx.env.USER_DATA_PATH}/${_this.data.id}.xlsx`
      const fs = wx.getFileSystemManager()
      fs.writeFile({
        filePath: filePath,
        data: fileData,
        encoding: 'base64',
        bookSST: true,
        success(res){
          let fileID = ""
      wx.cloud.uploadFile({
        filePath:filePath,
        cloudPath: `infos/${_this.data.id}.xlsx`
      }).then(res => {
        fileID = res.fileID
        wx.cloud.getTempFileURL({
          fileList:[fileID],
          success(res){
            _this.setData({
              pop:true,
              durl: res.fileList[0].tempFileURL+" 已复制到剪贴板"
            })
            wx.setClipboardData({
              data: res.fileList[0].tempFileURL,
            })
          }
        })
      })
        }
      })
      
      
    },

  cancelD(){
    this.setData({
      pop:false
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