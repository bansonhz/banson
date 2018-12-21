//app.js
var util = require('./utils/util.js')

var wxToast = require('toast/toast.js')
var weburl = "https://sendheart.dreamer-inc.com";
App({
  globalData: {
    appid: 'wxbfca73e39314bd08',//  小程序开发账号  wxe59fb5712b45adb7
    secret: '0e098a2fbd661ac8a44d4064fda42b3f',//   9666f44dd87410cf85949f3a053dc14a
    weburl:'https://sendheart.dreamer-inc.com',
    webwss: 'wss://sendheart.dreamer-inc.com',
    openid: null,
    username: null,
    code: null,
    mapkey:'SSPBZ-ALR32-4BWUC-CLUXY-HAFM3-3ABQF',
    shop_type:3,
    shop_id:3610,
    deliverytype:1, //默认自提模式
   
  },
 
    onLaunch: function() {
      console.log('App Launch');
      var that = this
      //调用API从本地缓存中获取数据
      var appid = that.globalData.appid;
      var appsecret = that.globalData.secret
      wx.setStorageSync('appid', appid);
      wx.setStorageSync('appsecret', appsecret);
        
      wx.login({
          success: function (res) {
            if (res.code) {
              console.log('获取用户登录态 code:' + res.code);
              wx.request({
                url: weburl + '/api/WXPay/getOpenidAction',
                data: {
                  js_code: res.code,
                  appid: appid,
                  appsecret: appsecret
                },
                method: 'POST',
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                },
                success: function (res) {
                  var user = res.data//返回openid
                  wx.setStorageSync('openid', user.openid);
                  wx.setStorageSync('session_key', user.session_key)
                  getApp().globalData.openid = user.openid
                  console.log('获取用户OpenId:', user.openid)
                  //console.log(user.openid);
                  that.location()
                  
                }
              })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        })
        
    },
    
    getUserInfo: function (cb) {
      var that = this
      if (that.globalData.userInfo) {
        typeof cb == "function" && cb(that.globalData.userInfo)
      } else {
        wx.login({
          success: function (res) {
            if (res.code) {
              that.globalData.code = res.code
              wx.setStorageSync('code', res.code)
              wx.getUserInfo({
                success: function (res) {
                  that.globalData.encrypted = { encryptedData: res.encryptedData, iv: res.iv }
                  that.globalData.userInfo = res.userInfo
                  typeof cb == "function" && cb(that.globalData.userInfo)
                  console.log('getUserInfo获取用户登录态:' + res.userInfo.nickName)
                }

              })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          },
          fail: function (res) {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        })
      }

    },
    
  location: function () {
    var that = this
    
    var city = wx.getStorageSync('city')  //默认杭州市 1213
   
    if (!city) {
      //获取当前位置
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success() {
                console.log('位置授权成功' + res.errMsg)
              },
              fail() {
                return
              }
            })
          }
        }
      })

      // 实例化腾讯地图API核心类
      var QQMapWX = require('./utils/qqmap-wx-jssdk.js')
      var qqmapsdk
      qqmapsdk = new QQMapWX({
        key: that.globalData.mapkey // 必填
      })
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          var speed = res.speed
          var accuracy = res.accuracy
          wx.setStorageSync('latitude', latitude);
          wx.setStorageSync('longitude', longitude);
          wx.setStorageSync('speed', speed);
          wx.setStorageSync('accuracy', accuracy)
          qqmapsdk.reverseGeocoder({
            poi_options: 'policy=2',
            get_poi: 1,
            success: function (res) {
              console.log('qqmapsdk:', res);
              wx.setStorageSync('mylocation', res.result.address)
              wx.setStorageSync('city', res.result.address_component.city)
              wx.setStorageSync('district', res.result.address_component.district)
              wx.setStorageSync('province', res.result.address_component.province)
              wx.setStorageSync('street', res.result.address_component.street)
              wx.setStorageSync('street_number', res.result.address_component.street_number)
              console.log('位置获取成功:' + res.result.address)
              
            },
            fail: function (res) {
              console.log('位置获取失败')
              console.log(res)
            },
            complete: function (res) {
              console.log(res)
            }
          })
        }
      })
    }  

  },

  onShow: function() {
        console.log('App Show')
        var that = this;
  },
  
  onHide: function() {
        console.log('App Hide')
  },
   
})
