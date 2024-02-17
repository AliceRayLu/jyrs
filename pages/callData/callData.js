Page({
  data: {
    yearArray: ['2020', '2021', '2022', '2023', '2024'],
    yearIndex: -1,
    
    typeArray: ['点名', '主控'],
    typeIndex: -1,

    list: [
      {
        no: 'BD4TS',
        name: '张三',
        times: '3'
      },
      {
        no: 'BT4TW',
        name: '李四',
        times: '4'
      },
      {
        no: 'BT4TA',
        name: '王五',
        times: '5'
      }
    ]
  },

  bindYearChange: function(e) {
    this.setData({
      yearIndex: e.detail.value
    })
  },
  
  bindTypeChange: function(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  //云函数add
  importExcel(){
    wx.cloud.callFunction({
      name: 'importExcel',
      data: {
        fileID: 'cloud://jyrsa-9gg6w0crf1f1ed36.6a79-jyrsa-9gg6w0crf1f1ed36-1322866588/calls/test.xls', // 替换成实际的Excel文件在云存储的fileID
      },
      success: res => {
        console.log('导入成功', res.result);
      },
      fail: err => {
        console.error('导入失败', err);
      }
    });
  }
})

