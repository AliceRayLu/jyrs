// components/my-button/my-button.js
Component({
  properties: {
    text: String
  },
  methods: {
    handleTap() {
      this.triggerEvent('click');
    }
  }
})