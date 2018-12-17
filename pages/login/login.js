var utils = require('../../utils/util.js');
var interval = null; //倒计时函数
var app = getApp();
var weburl = app.globalData.weburl;
var openid = app.globalData.openid;
var appid = app.globalData.appid;
var appsecret = app.globalData.secret;
var shop_type = app.globalData.shop_type;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '请选择日期',
    fun_id: 2,
    time: '点击获取', //倒计时 
    currentTime: 60,
    phoneNo:'',
    scode:'',
    goods_id:null,
    username: null,
    m_id:null,
    token:null,
    shop_type:shop_type,
    background_img:weburl+'/uploads/xianshe_login.jpg'
    
  },
  onGotUserInfo: function (e) {
    var that = this
  
    //权限
    wx.getSetting({
      success(res) {
        //通讯录权限
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              // 
            }
          })
        }
        //保存到相册权限
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              //  

            }
          })
        }
      }
    })
  },
  codeInput: function (e) {
    this.setData({
      scode: e.detail.value
    })
  },
  phoneNoInput(e) {
    this.setData({
      phoneNo: e.detail.value,
      username: e.detail.value
    })
  },
  
  getCode: function (options) {
    var that = this;
    var currentTime = that.data.currentTime
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        time: currentTime + '秒',
        disables: true
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '点击获取',
          currentTime: 60,
          disabled: false
        })
      }
    }, 1000)
  },
  getVerificationCode: function () {
    this.getCode();
    console.log(this.data.phoneNo);
    console.log(this.data.code);
    var that = this
    that.setData({
      disabled: true
    })
  },
  vscode() {
    if (!this.data.phoneNo) {
      app.wxToast({
        title: '请输入手机号码'
      })
      return;
    }
    if(this.data.phoneNo.length!=11) {
      app.wxToast({
        title: '手机号码格式不对'
      })
      return;
    }
    console.log(this.data.phoneNo)
    var that= this;
    var shop_type = that.data.shop_type
    this.getVerificationCode();
    
    wx.request({
      url: weburl + '/api/web/user/login/login_sms_send',
      method: 'POST',
      data: { 
        phoneNo: this.data.phoneNo, 
        extensionCode: "09016" ,
        shop_type:shop_type,
      
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        that.setData({
          scode: res.data.data
        })
      }
    })
  },
  login() {
    console.log(this.data.scode);
    let that = this;
    var username  = that.data.username
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : openid;
    var shop_type = shop_type?shop_type:3
    if (!that.data.phoneNo) {
      app.wxToast({
        title: '请输入手机号码'
      })
      return;
    }
    if (that.data.phoneNo.length != 11) {
      app.wxToast({
        title: '手机号码格式不对'
      })
      return;
    }
    if (!that.data.scode) {
      app.wxToast({
        title: '请输入验证码'
      })
      return;
    }
   
    wx.request({
      url: weburl + '/api/web/user/login/user_xcx_login',
      method: 'POST',
      data: { 
        username: that.data.phoneNo, 
        smscode: that.data.scode,
        shop_type:shop_type,
        openid:openid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        that.setData({
          username: res.data.result['username'],
          token: res.data.result['token']
        });
        wx.setStorageSync('token', res.data.result['token']);
        wx.setStorageSync('extensionCode', res.data.result['extensionCode']);
        wx.setStorageSync('username', res.data.result['username']);
        wx.setStorageSync('m_id', res.data.result['m_id']);
        wx.showToast({
          title: '保存成功',
          duration: 500
        })
        that.onGotUserInfo()
        // 等待半秒，toast消失后返回上一页
        setTimeout(function () {
          wx.navigateBack();
        }, 500);
      },
      
    })
    //wx.navigateBack();
    /*
    wx.navigateTo({
      url: '../details/index?username=' + this.data.phoneNo+'&id='+this.data.goods_id
    })
    */
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      username: options.username,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})