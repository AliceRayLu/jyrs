const db = wx.cloud.database()

Page({
  data: {
    yearArray: ['2020', '2021', '2022', '2023', '2024'],
    yearIndex: -1,
    
    typeArray: ['点名', '主控'],
    typeEN:['call','control'],
    typeIndex: -1,

    list: []
  },

  bindYearChange: function(e) {
    this.setData({
      yearIndex: e.detail.value
    })
    if(e.detail.value >= 0 && this.data.typeIndex >= 0){
      this.onChange()
    }
  },
  
  bindTypeChange: function(e) {
    this.setData({
      typeIndex: e.detail.value
    })
    if(this.data.yearIndex >= 0 && e.detail.value >= 0){
      this.onChange()
    }
  },

  onChange(){
    let _this = this
    let type = this.data.typeEN[this.data.typeIndex]
    let year = this.data.yearArray[this.data.yearIndex]
    let title = type+year
    let total = 0
    db.collection('call_record').count().then(res => {
      total = res.total
      if(total%20 == 0){
        total = total/20
      }else{
        total = Math.floor(total/20)+1
      }
      console.log(total)
      let lists = []
      for(var i = 0;i < total;i++){
        db.collection('call_record').skip(i*20).field({
          call:true,
          [title]:true,
          man:true,
          _id:false
        }).get().then(res => {
          console.log(res)
          for(var i in res.data){
            let obj = {}
            obj['no'] = res.data[i]['call']
            obj['name'] = res.data[i]['man'],
            obj['times'] = res.data[i][title]? res.data[i][title].length:0
            lists.push(obj)
          }
          lists.sort(function(a,b){
            return b['times']-a['times']
          })

          let rank = 0;
          let prevTimes = null;
          for(let i = 0; i < lists.length; i++) {
            if(lists[i].times !== prevTimes) {
              rank = i + 1;
              prevTimes = lists[i].times;
            }
            lists[i].rank = rank;
          }
          
          _this.setData({
            list:lists
          })
        })
      }
    })
    
  },

  onLoad(){
    let now = new Date().getFullYear()
    let dif = now-2024
    let years = []
    for(let i = 0;i <= dif;i++){
      years.push(String(now));
      now--;
    }
    this.setData({
      yearArray:years
    })
  }
})

