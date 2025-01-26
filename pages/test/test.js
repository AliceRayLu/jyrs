// pages/test/test.js
const { formatTime } = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
   data:{
         templateId:'KDwXn39ni63_BS_nwF4D_jv7TsGG7JrpFlHX3bL3X78',
     },
    sendOne(){
      var app = getApp();
      wx.cloud.callFunction({
        name:"pushMessage",
        data:{
          openid:app.globalData.openid,
          date:app.globalData.expirationTime
        }
      }).then(res=>{
        console.log("成功",res)
      }).catch(res=>{
        console.log("失败",res)
      })
    },
      //获取用户授权
      shouquan() {
        const that = this; // 保存当前页面的 this
        var app = getApp();
        const openid = app.globalData.openid // 用户的openid
        wx.requestSubscribeMessage({
          tmplIds: ['KDwXn39ni63_BS_nwF4D_jv7TsGG7JrpFlHX3bL3X78'],
          success(res) {
            console.log('授权成功', res);
            const db = wx.cloud.database();
            const subscriptionsCollection = db.collection
            ('subscriptions')
            const currentTime = new Date();
            const formattedTime = formatTime(currentTime);
            subscriptionsCollection.where({
              _openid: openid
            }).get().then(res => {
              console.log('数据查询成功',res)//将返回值存到res里
              const subscribeTime = app.globalData.expirationTime
              if (res.data.length > 0){
                //更新
                subscriptionsCollection.doc(res.data[0]._id).update({
                  data: {
                    status: 0,  
                  }
                }).then(updateRes => {
                  console.log('更新成功', updateRes);
                }).catch(updateErr => {
                  console.log('更新失败', updateErr);
                });
              }
              else{
                //添加
                subscriptionsCollection.add({
                  data: {
                    status: 0,  //0表示未到时间，暂未推送
                    subscribeTime: subscribeTime, //到期时间
                    nowTime :formattedTime
                  }
                }).then(res => {
                  console.log('添加成功', res);
                }).catch(err => {
                  console.log('添加失败', err);
                });
              }
            }).catch(err => {
              console.log('查询失败', err);
            });
          },
          fail(res) {
            console.log('授权失败', res);
          }
        });
      },

      subscribetask() {
        wx.cloud.callFunction({
          name: 'subscribetask',
          success: res => {
            console.log('定期任务已部署并开始执行')
            console.log(res)
            wx.showToast({
              title: '开启成功',
          })
          },
          fail: err => {
            console.error('定期任务部署失败', err)
          }
        })
      },
       
})

