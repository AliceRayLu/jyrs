// pages/callRecord/callRecord.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    file: {}, // 保存上传的文件信息
    remark: '', // 备注
    formData: {},// 表单信息 测试
  },

  
  /**
   * 监听备注输入框的输入事件
   */

  handleTextareaChange(event) {
    const { value } = event.detail;
    console.log('备注：', value);
    this.setData({
      remark: value,
      formData: {
        ...this.data.formData,
        remark: value,  // 更新formData
      },
    });
  },
  /**
   * 选择文件
   */
  chooseFile: function () {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        console.log(res.tempFiles[0]);
        that.setData({
          file: res.tempFiles[0],
          formData: {
            ...that.data.formData,
            file: res.tempFiles[0],  // 更新formData
          },
        });
      },
    });
  },  


  /**
   * 提交表单
   */
  handleSubmit: function () {
    console.log('提交表单', this.data.formData);
  },

  /**
   * 取消表单
   */
  handleCancel: function () {
    console.log('取消表单');
  },
});