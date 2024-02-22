// pages/activityDetail/activityDetail.js
import XLSX from '../../xlsx.mini.min'
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: -1,
    title: "",
    time: "",
    place: "",
    detail: "",
    pic: "/images/logo.jpg",
    participants: [],
    participants_with_name: [],
    num: 0,
    status: true,
    isAdmin: false,
    pop: false,
    pop2:false,
    durl: "",
    sign_data: [],
    otherInfo:[],
    userInfo:{}
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
    if (app.globalData.uname === app.globalData.admin) {
      this.setData({
        isAdmin: true
      })
    }
    let idx = app.globalData.current_act
    this.setData({
      id: idx
    })
    let _this = this
    let day = ["日", "一", "二", "三", "四", "五", "六"]
    db.collection('activities').where({
      aid: idx
    }).get({
      success(res) {
        let act = res.data[0]
        _this.setData({
          title: act.title,
          time: act.time.getFullYear() + "-" + (act.time.getMonth() + 1) + "-" + act.time.getDate() + "  周" + day[act.time.getDay()],
          place: act.location,
          detail: act.detail,
          participants: act.participants,
          num: act.participants.length,
          otherInfo:act.otherInfo
        })
        if (act.pic != "") {
          _this.setData({
            pic: act.pic
          })
        }
        if (_this.data.participants.includes(app.globalData.uname)) {
          _this.setData({
            status: true
          })
        } else {
          _this.setData({
            status: false
          })
        }
        if (_this.data.isAdmin) {  
 /******
When the user is an administrator, trigger the logic: search for name through uname, construct sign_data for download
******/
          // Define a function to search for name through uname
          function queryParticipants(skip) {
            return db.collection('members')
              .where({
                call: db.command.in(act.participants)
              })
              .skip(skip)
              .field({
                _id: false,
                man: true,
                call: true
              })
              .get()
              .then(res => {
                const participantsWithName = res.data.map(item => {
                  const man = item.man ? item.man : "❌ 未登记姓名";
                  return `${item.call} - ${man}`;
                });
                // Add result to the end of array data.participants_with_name 
                const newData = _this.data.participants_with_name.concat(participantsWithName);
                _this.setData({
                  participants_with_name: newData
                });

                // If the number of query results is less than 20, it indicates that all results have been queried and recursive queries are no longer needed
                if (res.data.length < 20) {
                  _this.setData({
                    participants_with_name: sortParticipants(_this.data.participants_with_name)
                  });
                  //console.log(_this.data.participants_with_name);
                  return;
                }
                // Otherwise, continue to recursively query and increase the skip value
                return queryParticipants(skip + 20);
              });
          }
          // Sort participants in the order of the act.participants array. So it will be displayed in the order of registration.
          function sortParticipants(participants) {
            const sortedParticipants = [];
            act.participants.forEach(participant => {
              const foundItem = participants.find(item => item.startsWith(participant));
              if (foundItem) {
                sortedParticipants.push(foundItem);
              }
            });
            return sortedParticipants;
          }
          // init skip=0, start query
          let skip = 0;
          queryParticipants(skip);

          let title = act.chosen.concat(act.otherInfo)
          let data = []
          data.push(title)
          let pa = act.participants
          for (let i = 0; i < pa.length; i++) {
            if (pa[i] == "") continue
            let temp = []
            db.collection('members').where({
              call: pa[i]
            }).field({
              _id:false,
              _openid:false,
              due:false,
              license:false,
              uname:false,
              passwd:false
            }).get().then(res2 => {
              let usr = JSON.stringify(res2.data[0], title)
              console.log(usr)
              temp = Object.values(JSON.parse(usr))
              //  console.log(temp)
              data.push(temp)
              _this.setData({
                sign_data: data
              })
            })
          }
        }
      }
    })
  },

  sign(event) {
    let _this = this
    if(this.data.otherInfo.length == 0){
      this.upload()
    }else{
      _this.setData({
        pop2: true
      })
    }
  },

  upload(){
    let _this = this
    this.data.participants.push(app.globalData.uname)
    console.log(this.data.participants)
    db.collection('activities').where({
      aid: _this.data.id
    }).update({
      data: {
        participants: _this.data.participants
      }
    }).then(res => {
      _this.onShow()
    })
  },

  getInfoInput(e){
    let idx = e.currentTarget.dataset.id
    let copy = this.data.userInfo
    copy[this.data.otherInfo[idx]] = e.detail.value
    this.setData({
      userInfo:copy
    })
  },

  fillInfo(){
    let _this = this
    db.collection('members').where({
      call: app.globalData.uname
    }).update({
      data: _this.data.userInfo
    }).then(res => {
      _this.setData({
        pop2: false
      })
      _this.upload()
    })
    
  },

  cancelD(){
    this.setData({
      pop:false
    })
  },

  cancel(event) {
    let _this = this
    this.data.participants = this.data.participants.filter(item => item != app.globalData.uname)
    db.collection('activities').where({
      aid: _this.data.id
    }).update({
      data: {
        participants: _this.data.participants
      }
    }).then(res => {
      _this.onShow()
    })
  },

  delete() {
    let _this = this
    db.collection('activities').where({
      aid: _this.data.id
    }).remove().then(res => {
      wx.switchTab({
        url: '/pages/activities/activities',
      })
    }).catch(err => {
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    })
  },

  download: function (event) {
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
      success(res) {
        let fileID = ""
        wx.cloud.uploadFile({
          filePath: filePath,
          cloudPath: `infos/${_this.data.id}.xlsx`
        }).then(res => {
          fileID = res.fileID
          wx.cloud.getTempFileURL({
            fileList: [fileID],
            success(res) {
              _this.setData({
                pop: true,
                durl: res.fileList[0].tempFileURL + " 已复制到剪贴板"
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