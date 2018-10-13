var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
Page({
  data: {
    username:null,
    token:null,
    addressIndex:null,
    currentlocationhidden:true,
    currentaddresshidden:true,
    is_delivery:0,
    shop_type:shop_type,

  },
	add: function () {
		wx.navigateTo({
			url: '../add/add'
		});
	},
  onLoad: function (options) {
    var that = this
    var address = options.address ? options.address:''
    var currentlocationhidden = that.data.currentlocationhidden
    var currentaddresshidden = that.data.currentaddresshidden
    if (options.address) {
      currentlocationhidden  = false
      currentaddresshidden = false
    }
    that.setData({
      address:address,
      currentlocationhidden: currentlocationhidden,
      currentaddresshidden: currentaddresshidden
    })

  },
	onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var is_delivery = wx.getStorageSync('is_delivery') ? wx.getStorageSync('is_delivery') : '0'

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,


        })
      }
    })
    that.setData({
      username: username,
      token: token,
      is_delivery: is_delivery,
    })
    if(username){
      this.loadData(username, token);
    }else{
      wx.navigateTo({
        url: '../../login/login'
      })
    }
	
	},
	setDefault: function (e) {
		// 设置为默认地址
		var that = this;
    var username = that.data.username;
    var token =  that.data.token;
    var shop_type = that.data.shop_type
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 遍历所有地址对象设为非默认
		var addressObjects = that.data.addressObjects;
  
		for (var i = 0; i < addressObjects.length; i++) {
			// 判断是否为当前地址，是则传true
      if (i == index){
        addressObjects[i]['is_default'] = 1;
      }else{
        addressObjects[i]['is_default'] = 0;
      }
		}
    that.setData({
      addressObjects: addressObjects
    })
		// 提交网络更新该用户所有的地址
    //保存地址到服务器
    wx.request({
      url: weburl + '/api/client/update_member_address',
      method: 'POST',
      data: {
        'username': username,
        'shop_type':shop_type,
        'id': addressObjects[index]['id'],
        'access_token': token,
        'full_name': addressObjects[index]['full_name'],
        'prov': addressObjects[index]['prov'],
        'city': addressObjects[index]['city'],
        'area': addressObjects[index]['area'],
        'town': addressObjects[index]['town'],
        'address': addressObjects[index]['address'],
        'tel': addressObjects[index]['tel'],
        'is_default': addressObjects[index]['is_default'],
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        // 成功同时更新本地数据源
        // 设置成功提示
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 2000
        });
      }
    })
	},
	edit: function (e) {
		var that = this;
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 取出id值
		var objectId = this.data.addressObjects[index]['id'];

		wx.navigateTo({
			url: '../add/add?objectId='+objectId
		});
	},
	delete: function (e) {
		var that = this;
    var username = that.data.username;
    var token = that.data.token;
    var shop_type = that.data.shop_type
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 找到当前地址AVObject对象
		var address = that.data.addressObjects[index];
		// 给出确认提示框
		wx.showModal({
			title: '确认',
			content: '要删除这个地址吗？',
			success: function(res) {
				if (res.confirm) {
					// 真正删除对象
          wx.request({
            url: weburl + '/api/client/delete_member_address',
            method: 'POST',
            data: {
              'username': username,
              'access_token': token,
              'shop_type':shop_type,
              'address_id': address['id'],
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var address = that.data.addressObjects;
              var new_address=[];
              var j=0;
              for (var i = 0; i < address.length; i++) {
                // find the default address
                if (i != index) {
                  new_address[j++] = address[i];
                }
              }
              that.setData({
                addressObjects: new_address,
              });
              // 成功同时更新本地数据源
              // 设置成功提示
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
            }
          })

				}
			}
		})
		
	},
	loadData: function (username,token) {
		// 加载网络数据，获取地址列表
		var that = this
    var shop_type = that.data.shop_type
    wx.request({
      url: weburl + '/api/client/get_member_address',
      method: 'POST',
      data: { 
        username: username, 
        token: token,
        is_delivery:1,
        shop_type:shop_type,
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log(res.data.result);
        var address = res.data.result;
        var currentaddresshidden = that.data.currentaddresshidden
        var is_delivery = that.data.is_delivery
        
        for (var i = 0; i < address.length; i++) {
          // find the default address
          if (address[i]['is_default'] == 1) {
            if (address[i]['is_delivery']==1){
              is_delivery = true
              
            }else{
              is_delivery = false
            }
            that.setData({
              addressIndex: i,
              is_delivery: is_delivery,
              currentaddresshidden:true
            })
          }
        }
        that.setData({
          addressObjects: address,
        });
      }
    })
	}
})