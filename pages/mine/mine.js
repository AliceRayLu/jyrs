// pages/mine/mine.js
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
    controlList: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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