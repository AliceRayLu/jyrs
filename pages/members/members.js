// pages/members/members.js
import XLSX from '../../xlsx.mini.min'
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    members:[
      {
        man: "顾",
        phone: "13333333333",
        call: "BD4TS",
        location: "xxxxxxx",
        // year:2025,
        // month:3,
        // date:2,
        // due:"",
        type:"C"
      },
      {
        man: "刘",
        phone: "13333333333",
        call: "BD4TSxxx",
        location: "xxxxxxxx",
        // year:-1,
        // month:-1,
        // date:-1,
        // due:"",
        type:"B"
      }
    ],
    empty:" ",
    line:"-",
    count: 0,
    pop: false,
    durl:""
  },

  cancelD(){
    this.setData({
      pop:false
    })
  },

  download(){
    let m = this.data.members
    let tmp = []
    for(var i = 0;i < m.length;i++){
      tmp.push(Object.values(m[i]))
    }
    console.log(tmp)
    let _this = this
    var ws = XLSX.utils.aoa_to_sheet(tmp);
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
          cloudPath: `infos/all_members.xlsx`
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

  delete(event){
    let index = event.currentTarget.dataset.id;
    console.log(index)
    let uname = this.data.members[index].call;
    db.collection('members').where({
      call: uname
    }).remove().then(res =>{
      wx.navigateTo({
        url: '/pages/members/members',
      })
      wx.showToast({
        title: '删除成功',
      })
    }).catch(err => {
      wx.showToast({
        title: '删除失败',
        icon:'error'
      })
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
    let count = _this.data.count
    db.collection('members').field({
      _id: false,
      _openid: false,
      uname: false,
      license: false,
      passwd: false
    }).get().then(res => {
      let newData = res.data.map(item => {
        if (item.due instanceof Date) {          
          let due = item.due;
          let year = due.getFullYear();
          let month = due.getMonth() + 1;
          let day = due.getDate();
          item.due = year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2);
        }
        return item;
      });
      _this.setData({
        members: newData
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
  onReachBottom(res) {
    let count = this.data.count
    let _this = this
    db.collection('members').skip(count).field({
      _id:false,
      _openid:false,
      uname:false,
      license:false,
      passwd:false
    }).get().then(res => {
      let newdata = res.data
      let olddata = _this.data.members
      count += 20
      _this.setData({
        members:olddata.concat(newdata),
        count:count
      },res =>{
        console.log('更新完成')
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})