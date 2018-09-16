var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;

Page({
  data: {
    username:null,
    token:null,
    addressIndex:[],
    prov:[],
    city:[],
    area:[],
    town:[],
    curIndex:0,
    shop_type:shop_type,
    page: 1,
    pagesize: 10,
    all_rows:0,
    page_num: 0,

  },
	add: function () {
		wx.navigateTo({
			url: '../add/add'
		});
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
          lng:location[0],
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
        console.log('fail',res)
      },
      complete: function () {
        console.log('complete')
      }
    })
  },
  bindSelectShop: function (e) {
    var that = this
    var selected_shop_index = e.currentTarget.dataset.shopindex ? e.currentTarget.dataset.shopindex : 0;
    var selected_shop_id = e.currentTarget.dataset.shopid ? e.currentTarget.dataset.shopid : 0
    var selected_shop_prov = e.currentTarget.dataset.shopprov ? e.currentTarget.dataset.shopprov : 0
    var selected_shop_city = e.currentTarget.dataset.shopcity ? e.currentTarget.dataset.shopcity : 0
    var selected_shop_area = e.currentTarget.dataset.shoparea ? e.currentTarget.dataset.shoparea : 0
    var selected_shop_town = e.currentTarget.dataset.shoptown ? e.currentTarget.dataset.shoptown : 0
    
    var shop_list = that.data.addressObjects
    for (var i = 0; i < shop_list.length; i++) {
      if (i == selected_shop_index) {
        shop_list[selected_shop_index]['selected'] = !shop_list[selected_shop_index]['selected']
        wx.setStorageSync('current_shop_info', shop_list[selected_shop_index]) //当前选中的门店信息
      } else {
        shop_list[i]['selected'] = false
      }
    }
    that.setData({
      addressObjects: shop_list,
    })
    // 等待半秒，toast消失后返回上一页
    setTimeout(function () {
      wx.navigateBack();
    }, 500);
  },
  getMore: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多记录了',
        icon: 'loading',
        duration: 1000
      });
      return
    }
    that.setData({
      page: page,
    })
    that.loadData()
  },
  onLoad: function (options) {
    var that = this
    var address = options.address ? options.address:''
    var cur_city = wx.getStorageSync('city') ? wx.getStorageSync('city'):1213  //默认杭州市 1213
    var cur_area = wx.getStorageSync('district') ? wx.getStorageSync('district') : 50142 //默认老余杭 50142
    var cur_prov = wx.getStorageSync('province') ? wx.getStorageSync('province'):15  //默认浙江省15
    var prov = that.data.prov
    var city = that.data.city
    var area = that.data.area
    prov.push(cur_prov)
    city.push(cur_city)
    area.push(cur_area)
    that.setData({
      address:address,
      prov:prov,
      city:city,
      area:area,
    })

  },
	onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    
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
      
    })
    if(username){
      that.loadData(username, token);
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
              'address_id': address['id'],
              'access_token': token,
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
    var curIndex = that.data.curIndex
    var city = that.data.city[curIndex]
    var area = that.data.area[curIndex]
    var addressObjects = that.data.addressObjects
    var page = that.data.page
    var pagesize = that.data.pagesize
    var page_num = that.data.page_num
    var shop_type = that.data.shop_type
    wx.request({
      url: weburl + '/api/client/get_shop4s_address',
      method: 'POST',
      data: { 
        username: username, 
        token: token,
        city:city,
        page:page,
        pagesize:pagesize,
        shop_type:shop_type,
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('get_shop4s_address:', res.data.result, res.data.all_rows);
        var address = res.data.result
        var all_rows = res.data.all_rows
        if(address){
          for (var i = 0; i < address.length; i++) {
            address[i]['selected'] = false
          }
          if (page > 1) {
            //向后合拼
            address = addressObjects.concat(address);
          }
          
          page_num = (all_rows / pagesize + 0.5)
          that.setData({
            addressObjects: address,
            all_rows:all_rows,
            page_num: page_num.toFixed(0),
          })
        }
        
      }
    })
	}
})