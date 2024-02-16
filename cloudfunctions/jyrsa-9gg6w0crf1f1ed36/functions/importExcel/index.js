// 云函数入口文件
const cloud = require('wx-server-sdk')
const xlsx = require('xlsx');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
exports.main = async (event, context) => {
  const fileID = event.fileID; // 传入的Excel文件在云存储的fileID
  const buffer = await cloud.downloadFile({
    fileID: fileID,
  });

  const workbook = xlsx.read(buffer.fileContent, { type: 'buffer' });
  const worksheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];

  const data = xlsx.utils.sheet_to_json(worksheet);

  // 导入到云数据库
  const db = cloud.database();
  const collection = db.collection('call_record');

  try {
    const res = await collection.add({
      data: data,
    });

    return {
      success: true,
      data: res,
    };
  } catch (err) {
    return {
      success: false,
      errMsg: err.message,
    };
  }
};