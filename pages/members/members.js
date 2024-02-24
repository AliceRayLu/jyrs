// pages/members/members.js
import XLSX from '../../xlsx.mini.min'
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    members:[],
    empty:" ",
    line:"-",
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
      call:uname
    }).get().then(res => {
      let path = res.data[0]
      if(path != ""){
        wx.cloud.deleteFile({
          fileList:[path]
        })
      }
    }).then(res => {
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
    })
  },

  modify(e){
    let idx = e.currentTarget.dataset.id
    app.globalData.helpee = this.data.members[idx]['call']
    wx.navigateTo({
      url: '/pages/userInfoUpdate/userInfoUpdate',
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
    _this.setData({
      members:[]
    })
    let total = 0
    db.collection('members').count().then(res => {
      total = res.total
      if(total%20 == 0){
        total = total/20
      }else{
        total = Math.floor(total/20)+1
      }
      for(var i = 0;i < total;i++){
        db.collection('members').skip(i*20).field({
          _id: false,
          call:true,
          due:true,
          certificate:true,
          location:true,
          man:true,
          phone:true,
          type:true,
          passwd:true
        }).get().then(res => {
          let newData = res.data.map(item => {
            if (item.due instanceof Date) {          
              let due = item.due;
              let year = due.getFullYear();
              let month = due.getMonth() + 1;
              let day = due.getDate();
              item.due = year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2);
            }else{
              item.due = ""
            }
            return item;
          });
          let old = _this.data.members
          _this.setData({
            members: old.concat(newData)
          })
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
  onReachBottom(res) {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})