const weekMap = [
  '星期天',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
]

Page({
  data: {
    city: '广州市',
    weekWeather: []
  },
  onLoad (options) {
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },
  onPullDownRefresh () {
    this.getWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather (callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      method: 'GET',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      success: res => {
        let result = res.data.result
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setWeekWeather (result) {
    let weekWeather = []
    for (let i = 0; i < result.length; i++) {
      let item = {}
      let elem = result[i]
      let date = new Date()
      date.setDate(date.getDate() + i)
      item.day = weekMap[date.getDay()]
      item.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      item.temp = `${elem.minTemp}°-${elem.maxTemp}°`
      item.iconPath = `/images/${elem.weather}-icon.png` 
      weekWeather.push(item)
      weekWeather[0].day="今天"
    }
    this.setData({
      weekWeather: weekWeather
    })
  }
})