import defaultData from '../../data';
var util = require('../../utils/util.js');
//获取应用实例
var app = getApp();

var weburl = app.globalData.weburl;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';

Page({
  data: {
    images: [],
    all_rows:0,
    venuesItems: [],
    search_goodsname: null,
    keyword:'',
    page: 1,
    pagesize: 20,
    page_num:0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: true, // loading
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    showmorehidden: true,
    rshowmorehidden: true,
    shareflag:0,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
 
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
  },
  // 点击获取对应分类的数据

  shareTapTag: function (e) {
    var that = this;
    var shareflag = !that.data.shareflag
    that.setData({
      shareflag: shareflag,
    });
 
  },

  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.query_wish_cart()
  },
  
  sendGoodsTapTag: function (e) {
    var that = this;
    var username = wx.getStorageSync('username');
    var index = parseInt(e.currentTarget.dataset.index);
    var sku_id = that.data.carts[index]['id'];
    if (sku_id) {
      that.insertCart(sku_id, username, 0);
    } else {
      wx.showToast({
        title: '该产品无货',
        icon: 'loading',
        duration: 1500
      });
    }
  },

  insertCart: function (sku_id, username, wishflag) {
    var that = this;

    // 加入购物车
    var title = wishflag == 1 ? '确认要加入心愿单吗' : '确认要购买送出吗'
    wx.showModal({
      title: '提示',
      content: title,
      success: function (res) {
        if (res.confirm) {
          // 加入购物车
          var that = this;
          wx.request({
            url: weburl + '/api/client/add_cart',
            method: 'POST',
            data: {
              username: username,
              access_token: "1",
              sku_id: sku_id,
              wishflag: wishflag
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var title = wishflag == 1 ? '加入心愿单完成' : '加入购物车完成'
              wx.showToast({
                title: title,
                duration: 1500
              })
              if (wishflag == 1) {
                wx.navigateTo({
                  url: '../wish/wish'
                })
              } else {
                wx.switchTab({
                  url: '../hall/hall'
                })
              }

            }

          })

        }
      }
    })
  },

  deleteTapTag: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var index = parseInt(e.currentTarget.dataset.index);
    var carts = that.data.carts;
    var sku_id = that.data.carts[index]['id'];

    // 购物车单个删除
    var objectId = e.currentTarget.dataset.objectId;
    console.log(objectId);
    
    wx.showModal({
      title: '提示',
      content: '确认要删除吗',
      success: function (res) {
        if (res.confirm) {
          // 从网络上将它删除
          // 购物车单个删除
          
          wx.request({
            url: weburl + '/api/client/delete_cart',
            method: 'POST',
            data: { 
              username: username, 
              access_token: token, 
              sku_id: sku_id,
              wishflag:1, 
              },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var new_carts = [];
              var j = 0;
              for (var i = 0; i < carts.length; i++) {
                if (i != index) {
                  //剔除删除产品
                  new_carts[j++] = carts[i];
                }
              }
              if (new_carts.length == 0) {
                var all_rows = 0;
                var showmorehidden = true;
              } else {
                var all_rows = new_carts.length;
                var showmorehidden = false;
              }
              that.setData({
                carts: new_carts,
                all_rows: all_rows,
                showmorehidden: showmorehidden
              })
            }
          })
 
        }
      }
    })
  },
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  onLoad: function (options) {
    console.log('onLoad');
    var that = this;

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
          scrollTop: that.data.scrollTop + 10
        })
      }
    })

    that.query_wish_cart()
  },


  // 定位数据  
  scroll: function (event) {
    var that = this;
    that.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  query_wish_cart: function (event) {
    //venuesList
    var that = this;
    var minusStatuses = [];
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var useranme = username;
    var token = token;

    // cart info
    wx.request({
      url: weburl + '/api/client/query_cart',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token,
        page:page,
        pagesize:pagesize, 
        wishflag:1,
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var carts = [];

        var cartlist = res.data.result.list;
        var showmorehidden = that.data.showmorehidden;

        var index = 0;
        for (var key in cartlist) {
          for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
            cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
            cartlist[key]['sku_list'][i]['short_name'] = cartlist[key]['sku_list'][i]['name'].substr(0, 10) + '...';
            cartlist[key]['sku_list'][i]['selected'] = '';
            cartlist[key]['sku_list'][i]['shop_id'] = key;
            cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
            if (index > 1) {
              cartlist[key]['sku_list'][i]['hidden'] = 1;
            }
            carts[index] = cartlist[key]['sku_list'][i];
            minusStatuses[index] = cartlist[key]['sku_list'][i]['num'] <= 1 ? 'disabled' : 'normal';
            index++;
          }
        }
        var page_num = that.data.page_num
        var pagesize = that.data.pagesize
        page_num = (carts.length/pagesize+0.5)
        that.setData({
          carts: carts,
          minusStatuses: minusStatuses,
          showmorehidden: showmorehidden,
          all_rows: carts.length,
          page_num:page_num.toFixed(0),
        });
      }
    })
  },
  onShow:function(){
    //调用应用实例的方法获取全局数据
    var that=this
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  onShareAppMessage: function () {
    return {
      title: '送心',
      desc: '送礼就是送心!',
      path: '/pages/list/list?id=123'
    }
  }
})
