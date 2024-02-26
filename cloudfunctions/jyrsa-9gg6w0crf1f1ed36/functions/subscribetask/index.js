// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 导出云函数入口函数
exports.main = async (event, context) => {
  try {
    // 定时执行任务
    setInterval(async () => {
      // 获取当前用户的 openid
      const { OPENID } = cloud.getWXContext()

      // 查询订阅信息
      const db = cloud.database()
      const subscriptionsCollection = db.collection('subscriptions') 
      subscriptionsCollection.where({
        _openid: OPENID
      }).get().then(res => {
        console.log('数据查询成功',res)//将返回值存到res里
        if(res.data[0].status==0){
          // 计算时间差
          const dateStr = res.data[0].subscribeTime
          const targetDate = new Date(dateStr).getTime()
          const currentDate = new Date().getTime()
          // const timeToTarget = targetDate - currentDate
          const timeToTarget = -1

          console.log("还有多久:" + timeToTarget)
          if(timeToTarget < 0){
            //发送通知
            cloud.callFunction({
              name: "pushMessage",
              data: {
                openid: OPENID
              }
            }) .then(pushRes=>{
              console.log(pushRes)
                //更新
              subscriptionsCollection.where({
                //先查询
                _openid: OPENID
              }).update({
                data: {
                    status:1//1表示推送完成
                  }
              }).then(res => {
                console.log('更新成功')
                console.log(res)
              }).catch(err => {
                console.log('更新失败',err)//失败提示错误信息
              })
            })
          }
          else{
            console.log("还没到时间")
          }

        }
      }).catch(err => {
        console.log('查询失败', err);
      });
    }, 10 * 1000) // 每隔 10 秒执行一次

  } catch (err) {
    console.error(err)
    return err
  }
}
