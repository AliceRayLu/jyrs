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
    // isLoading: false, // 是否正在加载数据
    // hasMoreData: true, // 是否还有更多数据
    isFilter:false, //是否在日期筛选
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
      mask: true,
    })
    console.log("start.....................")
    let locale = app.globalData.location
    new Promise((resolve) => {
      let index = event.currentTarget.dataset.id;
      let time = this.data.files[index]['time']
      let year = time.substr(0,4)
      let control = "control"+year
      let call = "call"+year
      let _this = this
      db.collection('call_file_'+locale).where({
        time:time
      }).get().then(res => {
        let fileIDs = res.data
        fileIDs.forEach(file => {
          wx.cloud.deleteFile({
            fileList:[file['fileID']]
          })
        })
      }).then(res => {
        db.collection('call_file_'+locale).where({
          time:time
        }).remove().then(res => {
          _this.onShow()
        })
      })
      // 更新 control 数据（处理多个主控人员）
      let controlList = this.data.files[index]['control'];
      console.log(controlList)
      if (!Array.isArray(controlList)) {
        controlList = [controlList];
      }
      controlList.forEach((controlPerson) => {
        db.collection('call_record_'+locale)
          .where({ call: controlPerson })
          .get()
          .then(res => {
            let recordID = res.data[0]._id;
            db.collection('call_record_'+locale).doc(recordID).update({
              data: {
                [control]: _.pull(time),
              },
            })
          })
      });

      let caller = this.data.files[index]['caller']
      for(var c of caller){
        db.collection('call_record_'+locale).where({
          call: c
        }).get().then(res => {
          let recordID = res.data[0]._id;
          db.collection('call_record_'+locale).doc(recordID).update({
            data:{
              [call]:_.pull(time)
            }
          })
        })
      }
      resolve();
    }).then(() => {
      wx.hideToast();
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
    let locale = app.globalData.location
    db.collection('call_file_'+locale).orderBy("time",'desc').get().then(res => {
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
    // 解构获取数据
    const { count, files, isFilter, startDate, endDate } = this.data;
    let locale = app.globalData.location
  
    // 如果是筛选状态
    if (isFilter) {
      const dbQuery = {};
  
      // 动态添加筛选条件
      if (startDate) dbQuery.time = db.command.gte(startDate);
      if (endDate) {
        dbQuery.time = dbQuery.time
          ? dbQuery.time.and(db.command.lte(endDate))
          : db.command.lte(endDate);
      }
  
      wx.showLoading({ title: '加载中...' });
  
      // 分页加载筛选后的数据
      db.collection('call_file_'+locale)
        .where(dbQuery)
        .orderBy('time', 'desc')
        .skip(count)
        .limit(20)
        .get()
        .then((res) => {
          const newdata = res.data;
          this.setData({
            files: files.concat(newdata),
            count: count + newdata.length // 动态更新已加载数据量
          });
  
          if (newdata.length === 0) {
            wx.showToast({
              title: '没有更多筛选数据了',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch((err) => {
          console.error(err);
          wx.showToast({
            title: '加载失败，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        })
        .finally(() => {
          wx.hideLoading();
        });
    } else {
      // 非筛选状态，加载全部数据
      wx.showLoading({ title: '加载中...' });
  
      db.collection('call_file_'+locale)
        .orderBy('time', 'desc')
        .skip(count)
        .limit(20)
        .get()
        .then((res) => {
          const newdata = res.data;
          this.setData({
            files: files.concat(newdata),
            count: count + newdata.length
          });
  
          if (newdata.length === 0) {
            wx.showToast({
              title: '没有更多数据了',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch((err) => {
          console.error(err);
          wx.showToast({
            title: '加载失败，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        })
        .finally(() => {
          wx.hideLoading();
        });
    }
  },
  

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
    // 更新起始日期
    onStartDateChange(e) {
      this.setData({ startDate: e.detail.value });
    },
  
    // 更新结束日期
    onEndDateChange(e) {
      this.setData({ endDate: e.detail.value });
    },
  
    // 日期范围筛选逻辑
    filterFilesByDateRange() {
      const { startDate, endDate } = this.data;
      let locale = app.globalData.location
    
      // 如果没有选择日期范围，提示用户选择
      if (!startDate && !endDate) {
        wx.showToast({
          title: '请先选择起始日期或结束日期',
          icon: 'none',
          duration: 2000
        });
        return;
      }
    
      // 数据库筛选逻辑
      const dbQuery = {};
      if (startDate) dbQuery.time = db.command.gte(startDate);
      if (endDate) {
        dbQuery.time = dbQuery.time
          ? dbQuery.time.and(db.command.lte(endDate))
          : db.command.lte(endDate);
      }
    
      wx.showLoading({ title: '查询中...' });
    
      // 初次筛选时重置分页计数和状态
      db.collection('call_file_'+locale)
        .where(dbQuery)
        .orderBy('time', 'desc')
        .limit(20)
        .get()
        .then((res) => {
          this.setData({
            files: res.data,
            count: 20, // 初始化分页计数
            isFilter: true // 进入筛选模式
          });
    
          if (res.data.length === 0) {
            wx.showToast({
              title: '未找到符合条件的数据',
              icon: 'none',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '查询成功',
              icon: 'success',
              duration: 2000
            });
          }
        })
        .catch((err) => {
          console.error(err);
          wx.showToast({
            title: '查询失败，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        })
        .finally(() => {
          wx.hideLoading();
        });
    },
    
  
    // 清除筛选条件
    clearFilters() {
      wx.showLoading({ title: '加载中...' });
      let locale = app.globalData.location
      db.collection('call_file_'+locale)
        .orderBy('time', 'desc')
        .limit(20)
        .get()
        .then((res) => {
          this.setData({
            files: res.data,
            count: 20, // 初始化分页计数
            isFilter: false, // 退出筛选模式
            startDate: "", // 清空筛选条件
            endDate: ""
          });
        })
        .catch((err) => {
          console.error(err);
          wx.showToast({
            title: '加载失败，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        })
        .finally(() => {
          wx.hideLoading();
        });
    }
    
})