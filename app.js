// app.js
App({
  onLaunch() {
    // // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }
     // 在小程序启动时执行的操作
    // 可以在这里获取用户信息、登录、获取 openid 等
    // 将获取到的 openid 存储在 globalData 中
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        const openid = res.result.openid;
        this.globalData.openid = openid;
        console.log('获取到 openid:', openid);
        const db = wx.cloud.database();
      const membersCollection = db.collection('members') 
      membersCollection.where({  _openid: this.globalData.openid  }).get().then(res=>{
        
          const originalDate = new Date(res.data[0].due);
          const year = originalDate.getFullYear();
          const month = originalDate.getMonth() + 1;
          const day = originalDate.getDate();
    
          const formattedDate = `${year}年${month < 10 ? '0' + month : month}月${day < 10 ? '0' + day : day}日`;
    
          this.globalData.expirationTime=formattedDate
          console.log("到期时间" +this.globalData.expirationTime)
      })
      }
    });
    
  },
  globalData: {
    uname:"",
    current_act:-1,
    admin:"BI4SSB",
    openid: null ,
    expirationTime: null,
    helpee:"", //帮助他人修改
  },
})
