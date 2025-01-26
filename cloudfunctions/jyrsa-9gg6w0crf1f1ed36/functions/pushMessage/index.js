// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { date } = event
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openid,
      page: 'pages/index/index',
      data: {
        name1: {
          value: '会员到期'
        },
        date2: {
          value: date
        },
        thing3: {
          value: '尊敬的会员，您的无线电执照即将到期'
        },
      },
      templateId: 'KDwXn39ni63_BS_nwF4D_jv7TsGG7JrpFlHX3bL3X78'
    })
    console.log(result)
    return result
  } catch (err) {
    console.error(err)
    return err
  }
}
