Page({
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

