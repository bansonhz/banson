var app = getApp();

var weburl = app.globalData.weburl;

Page({
	data: {
		amount : 0,
		carts: [],
    cartIds: null,
		addressList: [],
		addressIndex: 0,
    username:null,
    token:null
	},
	addressObjects: [],
	onLoad: function (options) {
		this.readCarts(options);
	},
	onShow: function () {
		this.loadAddress();
	},
	readCarts: function (options) {
		var that = this;
		// from carts
		// amount
		var amount = parseFloat(options.amount);
    var cartIds = options.cartIds;
    var cartIdArray = cartIds.split(',')
    var carts = JSON.parse(options.carts)
    console.log('carts_info:')
    console.log(options.carts)
		that.setData({
			amount: amount,
      carts: carts,
      cartIds: cartIdArray,
      username: options.username,
      token: options.token,
		});
	},
  showGoods: function (e) {
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    var goods_price = e.currentTarget.dataset.goodsPrice;
    var goods_info = e.currentTarget.dataset.goodsInfo;
    //var carts = this.data.carts;
    var sku_id = objectId;
    wx.navigateTo({
      url: '../../details/details?id=' + goods_id + '&name=' + goods_name + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&token=' + token + '&username=' + username
    });
  },
  
	confirmOrder: function () {
		// submit order
		var carts = this.data.carts;
		var that = this;
    var cartIds = that.data.cartIds
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
		var status = 0;
    var amount = that.data.amount;
    var address = that.addressObjects[that.data.addressIndex];

    if (address['is_delivery']==0){
      wx.showModal({
        title: '错误',
        content: '不在配送区范围,请选其它地址',
        success: function (res) {
          if (res.confirm) {
           
          } else if (res.cancel) {
          
          }
        }
      })
      return
    }else{
      wx.request({
        url: weburl + '/api/client/add_order',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          sku_id: cartIds,
          buy_type: 'cart',
          address_id: address['id'],
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          var order_data = res.data.result;
          if (!res.data.info) {
            wx.showToast({
              title: '订单提交完成',
              icon: 'success',
              duration: 1500
            })
          } else {
            wx.showToast({
              title: res.data.info,
              icon: 'loading',
              duration: 1500
            })
            return
          }
          wx.navigateTo({
            url: '../../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay']
          });
        }
      })
    }
   
   
	},
	loadAddress: function () {
		var that = this;
    var addressList = [];
    var addressObjects = null;
    var address = [];
    var token = that.data.token;
    var username = that.data.username;
    //取送货地址
    wx.request({
      url: weburl + '/api/client/get_member_address',
      method: 'POST',
      data: { 
        username: username, 
        token: token,
        is_delivery:1,  //检查是否在配送区

        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log(res.data.result);
        address = res.data.result;
        for (var i = 0; i < address.length; i++) {
          // find the default address
          if (address[i]['isDefault'] == 1) {
            that.setData({
              addressIndex: i
            });
          }
          addressList[i] = address[i];
          //console.log(addressList[i]);
        }
        that.setData({
          addressList: addressList
        });
        that.addressObjects = address;
      }
    })

	},
	bindPickerChange: function (e) {
		this.setData({
	    	addressIndex: e.detail.value
	    })
	},
	bindCreateNew: function () {
		var addressList = this.data.addressList;
		if (addressList.length == 0) {
			wx.navigateTo({
				url: '../../address/add/add?username='+this.data.username
			});
		}
	},

})