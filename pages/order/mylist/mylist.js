var app = getApp();
var weburl = app.globalData.weburl;
var navList_order = [
  { id: "send", title: "我送出的" },
  { id: "receive", title: "我收到的" },
];

Page({
  data: {
    orders: [],
    page: 1,
    pagesize: 10,
    status: 0,
    navList_order: navList_order,
    tab2: '',
    activeIndex2: 0,
    all_rows: 0,
    giftflag: 0,
    gift_send: 0,
    gift_rcv: 0,
    page_num: 0,
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.id;
    var index = e.currentTarget.dataset.index;
    var giftflag = that.data.giftflag;
    if (tab == 'send') {
      giftflag = 0;
    } else {
      giftflag = 1;
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      giftflag: giftflag,
    });

    that.reloadData()
  },
  getMoreOrdersTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多的数据',
        icon: 'loading',
        duration: 1000
      });
      return
    }
    that.setData({
      page: page,
    });
    that.reloadData()
  },

  sendAginTapTag: function (e) {
    var that = this;

    wx.navigateTo({
      url: '../list/list'
    });
  },
  detailTapTag: function (e) {
    var that = this;
    var order_object = e.currentTarget.dataset.orderObject;
    var order_id = order_object['id'];
    console.log('订单ID:' + order_id)
    wx.navigateTo({
      url: '../orderdetail/orderdetail?order_id=' + order_id + '&order_object=' + JSON.stringify(order_object) + '&giftflag=' + that.data.giftflag
    });
  },

  onLoad: function (options) {
    var that = this
    that.reloadData();
  },
  onShow: function () {
    //
  },

  reloadData: function () {
    var that = this;
    var order_type = 'kitchener'
    var shape = 2
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var status = that.data.status;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    console.log('page:' + page + ' pagesize:' + pagesize);
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        status: status,
        openid: openid,
        order_type: order_type,
        shape:shape,
        page: page,
        pagesize: pagesize
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows;
        if (!res.data.result) {
          wx.showToast({
            title: '没有该类型订单',
            icon: 'loading',
            duration: 1500
          })
           /*
          setTimeout(function () {
            wx.navigateBack();
          }, 500);
         
          that.setData({
            orders: [],
            all_rows: 0
          });
          */
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo'];
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image'];
            }

          }
          if (page > 1 && orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          var gift_send = that.data.gift_send
          var gift_rcv = that.data.gift_rcv
          var page_num = that.data.page_num
          page_num = (all_rows / pagesize + 0.5)
          if (order_type == 'send') {
            gift_send = all_rows
          } else {
            gift_rcv = all_rows
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows,
            gift_send: gift_send,
            gift_rcv: gift_rcv,
            page_num: page_num.toFixed(0),
          });
          console.log('gift_send:' + gift_send + ' gift_rcv:' + gift_rcv);
        }
      }
    })

  },
  accept: function (e) {
    var objectId = e.currentTarget.dataset.objectId;
    var totalFee = e.currentTarget.dataset.totalFee;
    console.log('接受礼物order_no:');
    console.log(objectId);
    wx.navigateTo({
      url: '../receive/receive?order_no=' + objectId + '&receive=1'
    });
  },
  pay: function (e) {
    var objectId = e.currentTarget.dataset.objectId;
    var totalFee = e.currentTarget.dataset.totalFee;
    console.log('order_no');
    console.log(objectId);
    wx.navigateTo({
      url: '../payment/payment?orderNo=' + objectId + '&totalFee=' + totalFee
    });
  },
  complete: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    wx.showModal({
      title: '请确认',
      content: '订单已完成?',
      success: function (res) {
        if (res.confirm) {
          var objectId = e.currentTarget.dataset.objectId;

          wx.request({
            url: weburl + '/api/client/order_confirm',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              id: objectId,
              order_type:'kitchener'
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              console.log(res.data.info);
              if (!res.data.info) {
                wx.showToast({
                  title: '订单确认完成',
                  icon: 'success',
                  duration: 1000
                });
              } else {
                wx.showToast({
                  title: res.data.info,
                  icon: 'loading',
                  duration: 1500,

                });
              }

            }
          })

        }
      }
    })
  },
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    var member_username = e.currentTarget.dataset.goodsOwner;
    var shape = e.currentTarget.dataset.shape;
    var member_type = 3

    if (shape <= 1) {  //普通商品订单
      wx.navigateTo({
        url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
      })
    }
    if (shape == 2) {  //人物预约单
      //获取人物头像信息
      wx.request({
        url: weburl + '/api/client/get_kitchener_list',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          member_type: member_type,
          member_username: member_username,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('result:', res.data.result, ' info:', res.data.info)
          var member_info = res.data.result
          var star = []
          var cuisinesystem = []
          var headimgurl = member_info[0]['headimgurl']
          cuisinesystem = member_info[0]['biz_area'].split(',')
          for (var j = 0; j < member_info[0]['user_level']; j++) {
            star[j] = '../../images/star_on.png'
          }
          if (member_info) {
            wx.navigateTo({
              url: '../../member/memberdetails/memberdetails?cuisine_username=' + member_username + '&headimgurl=' + headimgurl + '&star=' + JSON.stringify(star) + '&cuisinesystem=' + JSON.stringify(cuisinesystem)
            })
          } else {
            wx.showToast({
              title: res.data.info,
              icon: 'loading',
              duration: 1500,
            })
          }
        }
      })
    }
  }
});