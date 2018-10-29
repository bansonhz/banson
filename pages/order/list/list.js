var util = require('../../../utils/util.js');
var app = getApp();
var shop_type = app.globalData.shop_type;
var weburl = app.globalData.weburl;
var navList_order = [
  { id: "xianshe", title: "我送出的" },
  { id: "xianshe", title: "我收到的" },
];
var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
Page({
  data: {
    orders: [],
    page: 1,
    pagesize: 10,
    status: 0,
    navList_order: navList_order,
    tab2: 'xianshe',
    activeIndex2: 0,
    all_rows: 0,
    giftflag: 0,
    gift_send: 0,
    gift_rcv: 0,
    page_num: 0,
    shop_type:shop_type,
    current_date: util.formatTime(new Date).substring(0, 10), //年月日
    current_time: util.formatTime(new Date).substring(11, 19),  //时分秒
    machine_uuid: current_shop_info['machine_uuid'], //售货机 uuid
    is_machine: current_shop_info['type'] == 2 ? 1 : 0, //是否售货机
    machine_shop_id: current_shop_info['shop_id'], //售货机 所属 shop_id
    machine_location_id: current_shop_info['id'], //售货机 所属 shop_id
    machine_url: current_shop_info['machine_url'], //售货机 后端服务url
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
    })
  },
  gotoMap: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var address = e.currentTarget.dataset.address
    var addrname = e.currentTarget.dataset.addrname
    wx.request({
      url: weburl + '/api/client/get_chineseaddr_area',
      method: 'POST',
      data: {
        username: username,
        token: token,
        address: address,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result)
        var location = res.data.result
        that.setData({
          lat: location[1],
          lng: location[0],
        })
        wx.openLocation({
          latitude: Number(that.data.lat),
          longitude: Number(that.data.lng),
          scale: 14,
          name: addrname,
          address: address,
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
          }
        })

      },
      fail: function (res) {
        console.log('fail', res)
      },
      complete: function () {
        console.log('complete')
      }
    })
  },
  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this
    var status = parseInt(options.status ? options.status : 0)
    // 存为全局变量，控制支付按钮是否显示
    if (status) {
      that.setData({
        status: status
      })
      var title = ''
      if(status == 1){
        title = '待支付订单'
      } else if (status == 2){
        title = '待发货订单'
      } else if (status == 3) {
        title = '已发货订单'
      } else if (status == 4) {
        title = '已完成订单'
      }
      wx.setNavigationBarTitle({
        title: title ? title:'我的订单'
      })
    }

    that.reloadData();
  },
  onShow: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
        })
      }
    })
  },
  //取货码
  pickcode: function (e) {
    var that = this
    var shop_type = that.data.shop_type
    var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
    var orderNo = e.currentTarget.dataset.objectId;
    var price = e.currentTarget.dataset.totalFee;
    var orderSku = e.currentTarget.dataset.orderSku
    var orderSkunum = e.currentTarget.dataset.orderSkunum
    var orderIndex = e.currentTarget.dataset.orderIndex
    var orderTime = that.data.current_date + 'T' + that.data.current_time+'Z'
    var machine_url = current_shop_info['machine_url']
    var machineUuid = current_shop_info['machine_uuid']
    var machine_username = current_shop_info['machine_username'] ? current_shop_info['machine_username'] : 'C17705810977'
    var machine_password = current_shop_info['machine_password'] ? current_shop_info['machine_password'] : '123456'
    var goodsList = [
      {
        goodsUuid: orderSku[0]['sku_id'],
        goodsNumber: orderSkunum ? orderSkunum:1,
        goodsPrice: price,
      }
    ]

    wx.request({
      url: machine_url + '/apiusers/checkusername',
      method: 'GET',
      data: {
        userName: machine_username,
        password: machine_password,
      },
      header: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('售货机主系统登录完成:', res.data, goodsList, orderSkunum, orderNo)
        var shop_machine_auth = res.data
        if (!shop_machine_auth) {
          console.log('售货机主系统登录失败:', res.data);
          return
        }
        //取货码申请
        console.log('取货码申请:', orderNo, price, orderTime, 'machineUuid:', machineUuid, 'goodsList:', goodsList)
        wx.request({
          url: machine_url + '/commpick/productionpick',
          method: 'POST',
          data: {
            orderNo: orderNo,
            timeOut: 1,
            price: price,
            orderTime: orderTime,
            goodsNumber: 1,
            machineUuid: machineUuid,
            goodsList: goodsList,
          },
          header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json;text/plain,*/*',
            'Authorization': shop_machine_auth['data'],
          },
          success: function (res) {
            console.log('取货码申请完成:', res.data)
            var rcv_note
            var pick_code = ''
            var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
            var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
            //保存取货码
            if (res.data.result == '200') {
               pick_code = res.data.data
               rcv_note = '唐巢取货码成功:' + pick_code
             
              
            } else {
              rcv_note = '唐巢取货码失败:' + res.data.resultDesc
              wx.showToast({
                title: res.data.resultDesc,
                icon: 'none',
                duration: 2000,
              })
            }
            wx.request({
              url: weburl + '/api/client/update_order_note',
              method: 'POST',
              data: {
                username: username,
                access_token: token,
                order_no: orderNo,
                rcv_note: rcv_note,
                pick_code: pick_code,
                shop_type: shop_type,
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                console.log('唐巢取货码保存:', res.data)
                if (res.data.info) {
                  wx.showToast({
                    title: res.data.info,
                    icon: 'none',
                    duration: 1500,
                  })
                } else {
                  var orders = that.data.orders
                  orders[orderIndex]['pick_code'] = pick_code
                  that.setData({
                    orders: orders,
                  })
                  console.log('取货码本地更新:', orders[orderIndex])
                  
                }
              }
            })
          },
          fail: function (res) {
            console.log('fail:', res)
            wx.showToast({
              title: res.data.resultDesc,
              icon: 'loading',
              duration: 2000,
            })
          }
        })
      }
    })
  },

  reloadData: function () {
    var that = this;
    var order_type = that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var status = that.data.status
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    if (status == 4) {
        status = '4,5,6,7,10'
    }
    console.log('reloadData shop_type:' + shop_type + ' pagesize:' + pagesize);

    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        status: status,
        shop_type:shop_type,
        openid: openid,
        order_type: order_type,
        page: page,
        pagesize: pagesize,
         
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
            title: '没有订单了',
            icon: 'loading',
            duration: 1500
          });
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
              orderObjects[i]['order_sku'][j]['sku_image'] = orderObjects[i]['order_sku'][j]['sku_image'].indexOf('http')>-1 ? orderObjects[i]['order_sku'][j]['sku_image']:weburl + orderObjects[i]['order_sku'][j]['sku_image']
              if (orderObjects[i]['order_sku'][j]['sku_value'].length>0){
                for (var k = 0; k < orderObjects[i]['order_sku'][j]['sku_value'].length; k++) {
                  if (orderObjects[i]['order_sku'][j]['sku_value'][k]['type'] == 2) {
                    orderObjects[i]['order_sku'][j]['sku_value'][k]['value'] = orderObjects[i]['order_sku'][j]['sku_value'][k]['value'].indexOf('http') > -1 ? orderObjects[i]['order_sku'][j]['sku_value'][k]['value'] : weburl + orderObjects[i]['order_sku'][j]['sku_value'][k]['value']
                  }
                }
             
              }
            
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
    var totalFee = e.currentTarget.dataset.totalFee ? e.currentTarget.dataset.totalFee:0;
    var orderSkunum = e.currentTarget.dataset.orderSkunum ? e.currentTarget.dataset.orderSkunum:1;
    console.log('order_no', objectId,'price:',totalFee,'goods_num:',orderSkunum)
   
    wx.navigateTo({
      url: '../payment/payment?orderNo=' + objectId + '&totalFee=' + totalFee + '&goods_num=' + orderSkunum
    });
  },
  receive: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    wx.showModal({
      title: '请确认',
      content: '确认要收货吗',
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
                  title: '确认收货完成',
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
    
    if (shape<=1){  //普通商品订单
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
          console.log('result:',res.data.result, ' info:',res.data.info)
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
              url: '../../member/memberdetails/memberdetails?cuisine_username=' + member_username + '&headimgurl=' + headimgurl+'&star='+JSON.stringify(star)+'&cuisinesystem='+JSON.stringify(cuisinesystem)
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