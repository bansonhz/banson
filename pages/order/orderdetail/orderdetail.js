var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
Page({
  data: {
    orders: [],
    order_no:'',
    order_id: '',
    sendtime:'',
    orderprice:0,
    orderaddress:'',
    fullname:'',
    deliverycode:'',
    deliveryname:'',
    deliverystepinfo:'',
    deliveryinfo:[],
    delivery_status:[],
    deliveryflag:0,
    tel:'',
    rcvtime:'',
    page: 1,
    pagesize: 10,
    status: 0,
    order_id:0,
    sku_num:0,
    giftflag:0,
    modalHidden:true,
    comment_level:0,
    shop_type:shop_type,
     
  },
  onTapTag2: function (e) {
    var that = this;
    var tab = e.currentTarget.id;
    var index = e.currentTarget.dataset.index;
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
    });

    //that.reloadData()
  },
  
  comment: function () {
    var that = this
    that.setData({
      modalHidden: !that.data.modalHidden,
      comment_title: '评价订单',
    })
  },
  comment_star: function (e) {
    var that = this
    var star_id = e.currentTarget.dataset.starId
    var comment_level = that.data.comment_level
    if (star_id == comment_level){
      comment_level = comment_level - 1
    }else{
      comment_level = star_id
    }
    that.setData({
      comment_level: comment_level
    })
  },
  //确定按钮点击事件  
  modalBindaconfirm: function () {
    var that = this
    var order_id = that.data.order_id
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var comment_level = that.data.comment_level

    that.setData({
      modalHidden: !that.data.modalHidden,
    })

    wx.request({
      url: weburl + '/api/client/order_comment',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_id: order_id,
        product_comment_level:comment_level,
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
            title: '订单评价完成',
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

  },
  //取消按钮点击事件  
  modalBindcancel: function () {
    var that = this
    that.setData({
      modalHidden: !that.data.modalHidden
    })
  },  
  expressTapTag: function (e) {
    var that = this
    var shop_type = that.data.shop_type
    var order_no = that.data.order_no
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var deliveryflag = that.data.deliveryflag ;
     
    console.log('物流详情:'+order_no+' '+username+' '+token)
    if (deliveryflag==1) return;
    //从服务器获取订单物流信息
    wx.request({
      url: weburl + '/api/client/query_delivery_info',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no:order_no,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        if (!res.data.result) {
          wx.showToast({
            title: '没有该订单的物流信息',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            //wx.navigateBack();
          }, 500);
        } else {
          var deliveryinfo = res.data.result
          var status_list = deliveryinfo['status_list']
          var delivery_status = that.data.delivery_status
          if (status_list){
            var index = status_list.length-1;
            for (var i = 0; i < status_list.length; i++){
                delivery_status[index-i] = status_list[i];
            }
          }
          
          that.setData({
            deliveryinfo: deliveryinfo,
            delivery_status: delivery_status,
            deliveryflag:1
          });
        }
      }
    })
     
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that =  this;
  
    var orders = that.data.orders;
    var order_id = options.order_id;
    var giftflag = options.giftflag;
    var order_object = JSON.parse(options.order_object);
    var sku_num = 0;
    var status = order_object['status'];
    var gift_status = order_object['gift_status'];
    var order_no = order_object['order_no'];
    var sendtime =  order_object['paytime'];
    var rcvtime = order_object['rcvtime'];
    var orderprice = order_object['order_price'];
    var orderaddress = order_object['address'];
    var fullname = order_object['full_name'];
    var tel = order_object['tel'];
    var deliverycode = order_object['deliverycode'];
    var deliveryname = order_object['deliveryname'];
    var deliverystepinfo = order_object['deliverystepinfo'];
    var shape = order_object['shape'];
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    console.log('订单详情')
    console.log(order_object)
    if (order_object) sku_num = order_object['order_sku'].length ;
    orders.push(order_object);
    that.setData({
        order_id: order_id,
        orders: orders,
        status:status,
        giftflag: giftflag,
        gift_status: gift_status,
        sku_num:sku_num,
        order_no:order_no,
        sendtime:sendtime,
        rcvtime:rcvtime,
        orderprice: orderprice,
        orderaddress: orderaddress,
        tel:tel,
        fullname:fullname,
        deliverycode:deliverycode,
        deliveryname:deliveryname,
        deliverystepinfo:deliverystepinfo,
        username:username,
        token:token,
        shape:shape,
      });
    

  },
  onShow: function () {
    //this.reloadData();
  },

  reloadData: function () {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var status = that.data.status;
    var order_id = that.data.order_id;
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        status: status,
        order_id: order_id,

      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows;
        if (!res.data.result) {
          wx.showToast({
            title: '没有订单了',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 500);
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo'];
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image'];
              if (orderObjects[i]['order_sku'][j]['sku_value']){
                for (var k = 0; k < orderObjects[i]['order_sku'][j]['sku_value'].length; k++){
                  orderObjects[i]['order_sku'][j]['sku_value'][k]['value'] = weburl + orderObjects[i]['order_sku'][j]['sku_value'][k]['value']
                }
              }
            }
          }
          console.log(orderObjects);
          that.setData({
            orders: orderObjects,
            all_rows: all_rows,
          
          });
        }


      }
    })

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
    return
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