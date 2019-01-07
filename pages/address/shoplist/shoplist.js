var util = require('../../../utils/util.js')
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js')
var qqmapsdk
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var qqmapkey = app.globalData.mapkey;
var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
var shop_id = app.globalData.shop_id;
var shop_type = app.globalData.shop_type;
Page({
  data: {
    username:null,
    token:null,
    qqmapkey: qqmapkey,
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
    shop_id:shop_id,
    shop_type: shop_type,

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
        var current_shop_info = wx.getStorageSync('current_shop_info')
        that.setData({
          is_machine: current_shop_info['type'] == 2 ? 1 : 0,
          machine_uuid: current_shop_info['machine_uuid'],    
        })
      
        if (that.data.is_machine > 0 || that.data.machine_uuid) {
          wx.setStorageSync('is_machine', that.data.is_machine)
          wx.setStorageSync('machine_uuid', that.data.machine_uuid) 
          that.get_shop_machine_goods()
          wx.showToast({
            title: '数据加载中...',
            icon: 'loading',
            duration: 2000
          })
          console.log('售货机:', current_shop_info)
          //获取售货机商品类目
          that.get_shop_machine_goods()
          wx.showToast({
            title: '数据加载中...',
            icon: 'loading',
            duration: 2000
          })
        } else {
          wx.setStorageSync('is_machine', 0)
          wx.setStorageSync('machine_uuid', 0) 
          that.get_shop_goods_category()
          console.log('店铺:', current_shop_info)
        }
      } else {
        shop_list[i]['selected'] = false
      }
    }
    that.setData({
      addressObjects: shop_list,
    })
   
  },
  //售货机商品信息
  get_shop_machine_goods: function () {
    var that = this
    var value = that.data.value
    var secid = that.data.secid
   
    var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
    var machine_uuid = current_shop_info['machine_uuid'] ? current_shop_info['machine_uuid'] : '114131'
    var machine_url = current_shop_info['machine_url']
    var machine_username = current_shop_info['machine_username'] ? current_shop_info['machine_username'] : 'C17705810977'
    var machine_password = current_shop_info['machine_password'] ? current_shop_info['machine_password'] : '123456'
    console.log('get_shop_machine_goods current_shop_info:', current_shop_info)
    wx.request({
      url: machine_url + '/apiusers/checkusername',
      method: 'GET',
      data: {
        userName: machine_username,
        password: machine_password,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('售货机主系统登录完成:', res.data)
        var shop_machine_auth = res.data
        if (!shop_machine_auth) return
        wx.request({
          url: machine_url + '/customgoods/querymachinegoods',
          method: 'GET',
          data: {
            machineUuid: machine_uuid,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': shop_machine_auth['data'],
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('售货机商品信息获取完成:', res.data.data)
            var shop_machine_goods = res.data.data
            if (shop_machine_goods){
              var goods_classify = []
              for (var i = 0; i < shop_machine_goods.length; i++) {
                var goods_classify_info = {}
                goods_classify_info['id'] = shop_machine_goods[i]['commGoodsModel']['uuid']
                goods_classify_info['name'] = shop_machine_goods[i]['commGoodsModel']['typeName']
                goods_classify_info['list'] = []
                goods_classify[i] = goods_classify_info;
               // console.log('售货机商品信息转换:', goods_classify)
                if (shop_machine_goods[i].goodsList.length > 0) {
                  for (var j = 0; j < shop_machine_goods[i].goodsList.length; j++) {
                    var goods_classify_list = {}
                    if (!shop_machine_goods[i]['goodsList'][j]['effEndTime']){
                      goods_classify_list['sec_id'] = shop_machine_goods[i]['goodsList'][j]['uuid']
                      goods_classify_list['image'] = shop_machine_goods[i]['goodsList'][j]['goodsUrl']
                      goods_classify_list['name'] = shop_machine_goods[i]['goodsList'][j]['goodsName']
                      goods_classify_list['link'] = shop_machine_goods[i]['goodsList'][j]['introduceUrl']
                      goods_classify_list['sell_price'] = shop_machine_goods[i]['goodsList'][j]['goodsPrice']
                      if (goods_classify_list['image'].indexOf('jpg')) {
                        goods_classify_list['image'] = 'http://pic.hnzczy.cn/' + goods_classify_list['image']
                      }
                      if (goods_classify_list['image'].indexOf('mp4')) {
                        //goods_classify_list['image'] = 'http://video.hnzczy.cn/' + goods_classify_list['image']
                      }
                      if (goods_classify_list['link'].indexOf('mp4')) {
                        // goods_classify_list['link'] = 'http://video.hnzczy.cn/' + goods_classify_list['link']
                      }
                      if (goods_classify_list['link'].indexOf('jpg')) {
                        goods_classify_list['link'] = 'http://pic.hnzczy.cn/' + goods_classify_list['link']
                      }

                      goods_classify[i]['list'].push(goods_classify_list)
                    }
                    
                  }
                }  
              }
            } 
          
            console.log('售货机商品信息转换完成:', goods_classify,' value:',value)
            if (value == 0) {
              that.setData({
                navLeftItems: goods_classify,
                navRightItems: goods_classify[0]['list'],
                curNav: goods_classify[0]['id'],
                curIndex: 0
              })
            } else {
              that.setData({
                navLeftItems: goods_classify,
              })
              
              for (var i = 0; i < goods_classify.length; i++) {
                if (goods_classify[i]['id'] == value) {
                  that.setData({
                    navRightItems: goods_classify[i]['list'],
                    curNav: goods_classify[i]['id'],
                    curIndex: i
                  })
                  break
                }
              }
              if (!that.data.curIndex || that.data.curIndex >= goods_classify.length) {
                that.setData({
                  navRightItems: goods_classify[0]['list'],
                  curNav: goods_classify[0]['id'],
                  curIndex: 0
                })
              }
            
            }
            console.log('售货机商品分类 curIndex:', that.data.curIndex, goods_classify)
            console.log('售货机商品分类 navLeftItems:', that.data.navLeftItems)
            that.setData({
              navLeftItems_name: that.data.navLeftItems[that.data.curIndex]['name'],
              lists: that.data.navLeftItems[that.data.curIndex]['list'],
              page: 1
            })
            wx.setStorageSync('navLeftItems', that.data.navLeftItems)
            wx.setStorageSync('navRightItems', that.data.navRightItems)  
            wx.setStorageSync('navLeftItems_name', that.data.navLeftItems_name)
            wx.setStorageSync('navLeftItems_lists', that.data.lists)
            wx.setStorageSync('navLeftItems_curNav', that.data.curNav)
            wx.setStorageSync('navLeftItems_curIndex', that.data.curIndex)
            // 等待半秒，toast消失后返回上一页
           
            setTimeout(function () {
              //wx.navigateBack()
              wx.switchTab({
                url: '/pages/main/main',
              })
            }, 200);
            //that.loadgoods_shop_machine(that.data.navLeftItems[that.data.curIndex]['id'], secid);
          }
        })
      }
    })
  },

//获取店铺商品类目
  get_shop_goods_category:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var value = that.data.value 
    var secid = that.data.secid
    var shop_id = that.data.shop_id
    var shop_type = that.data.shop_type
    console.log('get_shop_goods_category value:', value)
    wx.request({
      url: weburl + '/api/client/get_shop_goods_category',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_id: shop_id,
        shop_type: shop_type,
        reid: 0,
        category_type:0,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var goods_classify = res.data.result
        console.log('菜品分类:', goods_classify, goods_classify.length)
        if (goods_classify.length == 0) return
        
        if (value == 0) {
          that.setData({
            navLeftItems: goods_classify,
            navRightItems: goods_classify[0]['list'],
            curNav: goods_classify[0]['id'],
          })
         
        } else {
          that.setData({
            navLeftItems: goods_classify,
          })
          for (var i = 0; i < goods_classify.length; i++) {
            if (goods_classify[i]['id'] == value) {
              that.setData({
                navRightItems: goods_classify[i]['list'],
                curNav: goods_classify[i]['id'],
                curIndex: i
              })
              break
            }
          }
          if (!that.data.curIndex || that.data.curIndex >= goods_classify.length){
            that.setData({
              navRightItems: goods_classify[0]['list'],
              curNav: goods_classify[0]['id'],
              curIndex: 0
            })
          }
          
        }
        console.log('菜品分类 curIndex:', that.data.curIndex, goods_classify.length,'value:',value)
        console.log('菜品分类 navLeftItems:', that.data.navLeftItems)
        that.setData({
          navLeftItems_name: that.data.navLeftItems[that.data.curIndex]['name'],
          page:1
        })
        wx.setStorageSync('navLeftItems', that.data.navLeftItems)
        wx.setStorageSync('navRightItems', that.data.navRightItems)
        wx.setStorageSync('navLeftItems_name', that.data.navLeftItems_name)
        wx.setStorageSync('navLeftItems_lists', that.data.lists)
        wx.setStorageSync('navLeftItems_curNav', that.data.curNav)
        wx.setStorageSync('navLeftItems_curIndex', that.data.curIndex)
        //that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id'],secid);
        // 等待半秒，toast消失后返回上一页
        
        setTimeout(function () {
          //wx.navigateBack()
          wx.switchTab({
            url: '/pages/main/main',
          })
        }, 200);
      }
    })
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
    that.setData({
      address: address,
    })
    console.log('onload address:',that.data.address)
    that.location()
   
  },
	onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var cur_city = wx.getStorageSync('city') 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
        })
      }
    })
   
    if(!username){
      wx.navigateTo({
        url: '../../login/login'
      })
    }
    if (!cur_city){
      that.location()
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
	loadData: function () {
		//获取地址列表
		var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
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
        if (res.data.all_rows==0){
          wx.setStorageSync('city', '') //情况位置重新获取
        }
        
      }
    })
	},

  location: function () {
    var that = this
    var cur_city = wx.getStorageSync('city')  //默认杭州市 1213
    var cur_area = wx.getStorageSync('district') //默认老余杭 50142
    var cur_prov = wx.getStorageSync('province')  //默认浙江省15
    var prov = that.data.prov
    var city = that.data.city
    var area = that.data.area
    var qqmapkey = that.data.qqmapkey
    console.log('location cur_city:', cur_city)
    if (!cur_city){
     //获取当前位置
     wx.getSetting({
       success(res) {
         if (!res.authSetting['scope.userLocation']) {
           wx.authorize({
             scope: 'scope.userLocation',
             success() {
               console.log('位置授权成功' + res.errMsg)
             },
             fail() {
               return
             }
           })
         }
       }
     })

     // 实例化腾讯地图API核心类
     qqmapsdk = new QQMapWX({
       key: qqmapkey // 必填
     })
     wx.getLocation({
       type: 'wgs84',
       success: function (res) {
         var latitude = res.latitude
         var longitude = res.longitude
         var speed = res.speed
         var accuracy = res.accuracy
         wx.setStorageSync('latitude', latitude);
         wx.setStorageSync('longitude', longitude);
         wx.setStorageSync('speed', speed);
         wx.setStorageSync('accuracy', accuracy)
         qqmapsdk.reverseGeocoder({
           poi_options: 'policy=2',
           get_poi: 1,
           success: function (res) {
             console.log('qqmapsdk:', res);
             that.setData({
               address: res.result.address
             })
             wx.setStorageSync('mylocation', res.result.address)
             wx.setStorageSync('city', res.result.address_component.city)
             wx.setStorageSync('district', res.result.address_component.district)
             wx.setStorageSync('province', res.result.address_component.province)
             wx.setStorageSync('street', res.result.address_component.street)
             wx.setStorageSync('street_number', res.result.address_component.street_number)
             console.log('位置获取成功:' + res.result.address)
             prov.push(res.result.address_component.province)
             city.push(res.result.address_component.city)
             area.push(res.result.address_component.district)
             that.setData({
               prov: prov,
               city: city,
               area: area,
             })
             that.loadData()
           },
           fail: function (res) {
             console.log('位置获取失败')
             console.log(res)
           },
           complete: function (res) {
             console.log(res)
           }
         })
       }
     })
   } else {
     prov.push(cur_prov)
     city.push(cur_city)
     area.push(cur_area)
     that.setData({
       prov: prov,
       city: city,
       area: area,
     })
    that.loadData()
   }
  
  }
})