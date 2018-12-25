var app = getApp()
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var appsecret = app.globalData.secret;
var user_type = app.globalData.user_type;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : app.globalData.userInfo;

Page({
  navigateToAddress: function () {
    wx.navigateTo({
      url: '../address/list/list'
    });
  },
  
  navigateToOrder: function (e) {
    var status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: '../order/list/list?status=' + status
    })
  },
  navigateToMyOrder: function (e) {
    wx.navigateTo({
      url: '../order/mylist/mylist' 
    })
  },
  
  navigateToUserinfo: function(e) {
    wx.navigateTo({
      url: 'user_info/user_info'
    })
  },
  navigateToWallet: function (e) {
    wx.navigateTo({
      url: '../wallet/wallet'
    })
  },
  navigateToCoupon: function (e) {
    wx.navigateTo({
      url: '../member/couponmy/couponmy'
    })
  },
  
  logout: function () {

  },
  onGotUserInfo: function (e) {
    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
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
              console.log('获取用户OpenId:', user.openid)
              wx.navigateTo({
                url: '../login/login?wechat=1'
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  onShow: function () {
    
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  chooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePath = res.tempFilePaths[0];

      }
    })
  },
  navigateToAboutus: function () {
    wx.navigateTo({
      url: '/pages/member/aboutus/aboutus'
    });
  },
  navigateToDonate: function () {
    wx.navigateTo({
      url: '/pages/member/donate/donate'
    });
  },
  navigateToShare: function () {
    wx.navigateTo({
      url: '/pages/member/share/share'
    });
  }
})