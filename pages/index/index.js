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

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = '点击获取当前位置'
const UNAUTHORIZED_TIPS = '点击开启位置权限'
const AUTHORIZED_TIPS = ''

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

Page({
  data: {
    nowTemp: 0,
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeathwer: [],
    todayDate: '',
    todayTemp: '',
    city: '广州市',
    locationTipsText: UNPROMPTED_TIPS,
    locationAuthType: UNPROMPTED
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'QLCBZ-QQNEX-FW442-ZHIUG-EVWSQ-BSBQA'
    })
    wx.getSetting({
      success: (res) => {
        var locationAuthType = UNPROMPTED
        var locationTipsText = UNPROMPTED_TIPS
        let auth = res.authSetting['scope.userLocation']
        if (auth) {
          locationAuthType = AUTHORIZED
          locationTipsText = AUTHORIZED_TIPS
        } else if (auth === false) {
          locationAuthType = UNAUTHORIZED
          locationTipsText = UNAUTHORIZED_TIPS
        }
        this.setData({
          locationAuthType: locationAuthType,
          locationTipsText: locationTipsText
        })
        if (auth) {
          this.getCityAndNow()
        } else {
          this.getNow()
        }
      }
    })
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
        city: this.data.city
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
      url: `/pages/list/list?city=${this.data.city}`,
    })
  },
  onTapLocation () {
    if (this.data.locationAuthType === UNAUTHORIZED) {
      wx.openSetting({
        success: (res) => {
          let auth = res.authSetting['scope.userLocation']
          if (auth) {
            this.getCityAndNow()
          }
        }
      })
    } else {
      this.getCityAndNow()
    }
  },
  getCityAndNow () {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
              locationTipsText: ''
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})
