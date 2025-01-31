Component({
  properties: {},
  data:{
    location: "",
    places: ["江阴","无锡","张家港","苏州"],
    code: ["JY","WX","ZJG","SZ"],
  },
  methods: {
    bindDataChange(event){
      let index = event.detail.value
      let detail = {
        "location": this.data.code[index]
      }
      this.setData({
        location: this.data.places[index]
      })
      this.triggerEvent("setLocation", detail,{});
    }
  }
})