const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪',
}

const weatherColorMap = {
  'sunny': '#cdeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc',
}

Page({
  data: {
    nowTemp: 0,
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeathwer: [],
    todayDate: '',
    todayTemp: ''
  },
  onLoad() {
    this.getNow()
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow (callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '广州市'
      },
      success: res => {
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setNow (result) {
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    })
  },
  setHourlyWeather (result) {
    let nowHour = new Date().getHours()
    let forecast = result.forecast
    let hourlyWeathwer = []
    for (let i = 0; i < forecast.length; i++) {
      hourlyWeathwer.push({
        time: (nowHour + i * 3) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeathwer[0].time = '现在'
    this.setData({
      hourlyWeathwer: hourlyWeathwer
    })
  },
  setToday (result) {
    let temp = result.today
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let todayDate = `${year}-${month}-${day} 今天`
    let todayTemp = `${temp.minTemp}°-${temp.maxTemp}°`
    this.setData({
      todayDate: todayDate,
      todayTemp: todayTemp
    })
  },
  onTapDayWeather () {
    wx.showToast({})
    wx.navigateTo({
      url: '/pages/list/list',
    })
  }
})
