var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
Page({
	data: {
		orderNo: '',
    orders: [],
    shop_type:shop_type,
    totalFee:0,
    current_date: util.formatTime(new Date).substring(0, 10), //年月日
    current_time: util.formatTime(new Date).substring(11, 19),  //时分秒
    machine_uuid: current_shop_info['machine_uuid'], //售货机 uuid
    is_machine: current_shop_info['type'] == 2 ? 1 : 0, //是否售货机
    machine_shop_id: current_shop_info['shop_id'], //售货机 所属 shop_id
    machine_location_id: current_shop_info['id'], //售货机 所属 shop_id
    machine_url: current_shop_info['machine_url'], //售货机 后端服务url
	},
	onLoad: function (options) {
    var that = this;
    var orderNo = options.orderNo
    var totalFee = options.totalFee ? options.totalFee:0;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var member_username = options.member_username ? options.member_username:''
    var shop_type = that.data.shop_type
    console.log('totalFee:' + totalFee)
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: orderNo,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var orderObjects = res.data.result;
        if (!res.data.info) {
          var order_price =0
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + orderObjects[i]['logo'];
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['sku_image'] = orderObjects[i]['order_sku'][j]['sku_image']
              orderObjects[i]['order_sku'][j]['sku_image'] = orderObjects[i]['order_sku'][j]['sku_image'].indexOf('http') > -1 ? orderObjects[i]['order_sku'][j]['sku_image'] : weburl + orderObjects[i]['order_sku'][j]['sku_image']
            }
            order_price = order_price + orderObjects[i]['order_price']
          }
          
          totalFee = order_price.toFixed(2) * 100
          console.log('order_price:'+order_price)
          that.setData({
            orders: orderObjects,
            orderNo: orderNo,
            username: username,
            token: token,
            totalFee: totalFee,
            member_username: member_username,
          })
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'none',
            duration: 1500
          });
        }
      }
    })
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
  pickcode:function(){
    var that = this
    var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
    var orders = that.data.orders
    var orderNo = that.data.orderNo
    var price = that.data.totalFee
    var orderTime = that.data.current_date + 'T' + that.data.current_time + 'Z'
    var shop_type = that.data.shop_type
    var machine_url = current_shop_info['machine_url']
    var machineUuid = current_shop_info['machine_uuid']
    var machine_username = current_shop_info['machine_username'] ? current_shop_info['machine_username'] : 'C17705810977'
    var machine_password = current_shop_info['machine_password'] ? current_shop_info['machine_password'] : '123456'
    var goodsList = [
      {
        goodsUuid:orders[0]['order_sku'][0]['sku_id'],
        goodsNumber:1,
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
        console.log('售货机主系统登录完成:', res.data, that.data.current_date, that.data.current_time,orderNo)
        var shop_machine_auth = res.data
        if (!shop_machine_auth) {
          console.log('售货机主系统登录失败:', res.data);
          return
        }
        //取货码申请
        console.log('取货码申请:', orderNo, price, orderTime,'machineUuid:',machineUuid,'goodsList:',goodsList)
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
            console.log('取货码申请完成:', res.data);
            //保存取货码
            var rcv_note
            var pick_code = ''
            var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
            var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
            if (res.data.result=='200'){
                pick_code = res.data.data
                rcv_note = '鲜社取货码' + pick_code
            }else{
              rcv_note = '鲜社取货码失败:' + res.data.resultDesc
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
                console.log('鲜社取货码保存:', res.data)
                if (res.data.info) {
                  wx.showToast({
                    title: res.data.info,
                    icon: 'none',
                    duration: 1500,
                  })
                } 

              }
            })
            wx.navigateTo({
              url: '../list/list?status=2'
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

  pay: function (e) {
		var that = this;
    var openId = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var totalFee = that.data.totalFee;
    var orderNo = that.data.orderNo;
    var member_username = that.data.member_username
    var shop_type = that.data.shop_type

    console.log('payment openid:' + openId, 'totalFee:' + totalFee, 'shop_type:', shop_type, 'orderNo:', orderNo)
   
    wx.request({
      url: weburl + '/api/WXPay',
      data: {
        openid: openId,
        body: '商城',
        tradeNo: orderNo,
        totalFee: totalFee,
        shop_type: shop_type,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (response) {
        // 发起支付
        if (response.data.timeStamp) {
          wx.requestPayment({
            'timeStamp': response.data.timeStamp,
            'nonceStr': response.data.nonceStr,
            'package': response.data.package,
            'signType': 'MD5',
            'paySign': response.data.paySign,
            'success': function (res) {
              
              wx.showToast({
                title: '支付完成',
                icon: 'success',
                duration: 1500
              })
              //获取取货码
              that.pickcode()
             
            }
          })
        } else {
          wx.showToast({
            title: response.data,
            icon: 'none',
            duration: 2000,
          })
          /*
          wx.request({
            url: weburl + '/api/client/release_member_schedule',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              order_no: orderNo,
              member_username: member_username,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var result = res.data.result
              
            }
          })
          */
        }

      },
      fail: function (response) {
        console.log('发起支付失败')
        console.log(response)
        wx.request({
          url: weburl + '/api/client/release_member_schedule',
          method: 'POST',
          data: {
            username: username,
            access_token: token,
            order_no: orderNo,
            member_username: member_username,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log(res.data.result);
            var result = res.data.result
           
          }
        })

      }
    })
    //锁定预约时间表
    /*
    wx.request({
      url: weburl + '/api/client/book_member_schedule',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: orderNo,
        member_username:member_username,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var result = res.data.result;
        if (result) {
          //统一下单接口对接
          wx.request({
            url: weburl + '/api/WXPay',
            data: {
              openid: openId,
              body: '商城',
              tradeNo: that.data.orderNo,
              totalFee: that.data.totalFee,
              shop_type:shop_type,
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (response) {
              // 发起支付
              if (response.data.timeStamp) {
                wx.requestPayment({
                  'timeStamp': response.data.timeStamp,
                  'nonceStr': response.data.nonceStr,
                  'package': response.data.package,
                  'signType': 'MD5',
                  'paySign': response.data.paySign,
                  'success': function (res) {
                    wx.showToast({
                      title: '支付成功'
                    })
                    // update order

                  }
                })
              } else {
                wx.showToast({
                  title: response.data,
                  icon: 'loading',
                  duration: 2000,
                })
                wx.request({
                  url: weburl + '/api/client/release_member_schedule',
                  method: 'POST',
                  data: {
                    username: username,
                    access_token: token,
                    order_no: orderNo,
                    member_username: member_username,
                  },
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                  },
                  success: function (res) {
                    console.log(res.data.result);
                    var result = res.data.result
                  }
                })
              }

            },
            fail: function (response) {
              console.log('发起支付失败')
              console.log(response)
              wx.request({
                url: weburl + '/api/client/release_member_schedule',
                method: 'POST',
                data: {
                  username: username,
                  access_token: token,
                  order_no: orderNo,
                  member_username: member_username,
                },
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                },
                success: function (res) {
                  console.log(res.data.result);
                  var result = res.data.result
                }
              })
            
            }
          })
          
        } else {
          wx.showToast({
            title: res.data.info ? res.data.info:'',
            icon: 'loading',
            duration: 1500
          })
        }
      }
    })
		*/
	}
})