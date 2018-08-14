import defaultData from '../../data';
var util = require('../../utils/util.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

//获取应用实例
var app = getApp();
//var weburl = "https://czw.saleii.com";
var weburl = app.globalData.weburl;
var qqmapkey = app.globalData.mapkey;
var shop_type = app.globalData.shop_type;
var navList = [
  { id: "is_recommend", title: "推荐", value: "1" },
  { id: "activity_flag", title: "精品", value: "1" },
  { id: "is_qianggou", title: "送Ta", value: "1" },
  { id: "is_flag", title: "亲人", value: "1" },
  { id: "search_goodsname", title: "美食", value: "美食" },
  { id: "search_goodsname", title: "数码", value: "数码" }
];
var navList2 = [
  { id: "systemdish", title: "传统菜系", value: "", img:"../../images/icon-2.png" },
  { id: "season", title: "时令新品", value: "", img:"../../images/baokunchexing.png" },
  { id: "fruitdessert", title: "水果点心", value: "", img: "../../images/icon-3.png"  },
  { id: "harddish", title: "私房硬菜", value: "", img: "../../images/icon-1.png" },
  { id: "traditionsoup", title: "特色煨汤", value: "", img: "../../images/icon-1.png" },
  { id: "health", title: "三高克星", value: "", img: "../../images/icon-1.png" },
  { id: "vegetable", title: "素食大餐", value: "", img: "../../images/icon-1.png" },
  { id: "prom", title: "会员特价", value: "", img: "../../images/icon-1.png" },
];
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
Page({
  data: {
    activeIndex: 0,
    activeIndex2: 0,
    navList: navList,
    navList2: navList2,
    images: [],
    all_rows: 0,
    all_rows2: 0,
    all_rows3: 0,
    venuesItems: [],
    venuesItems2: [],
    venuesItems3: [],
    venuesItems3_3: [],
    search_goodsname: null,
    searchhidden:false,
    lastX: 0,     //滑动开始x轴位置
    lastY: 0,     //滑动开始y轴位置
    currentGesture: 0, //标识手势
    keyword: '',
    page: 1,
    pagesize: 20,
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    interval: 900000,
    duration: 6000,
    circular:true,
    loadingHidden: true, // loading
    msgList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    tab: 'is_recommend',
    tab_value: "1",
    toView: '',
    tab2: 'default',
    updown: 0,     //升序 降序
    shop_type: shop_type,  //商家类型 1普通 2百货超市 7专业服务
    scrollLeft: 0,
    prom_hour:null,
    prom_limittime:0,
    left_sec: '0',
    left_min: '0',
    left_hour:'0',

  },
  
  //滑动移动事件
  touchstart: function (e) {
    var that = this;
    //开始触摸，获取触摸坐标  
    //console.log(e)
    that.setData({
      startpoint: [e.touches[0].pageX,e.touches[0].pageY] 
    })
  },
  //触摸点移动  
  touchmove: function (e) {
    //当前触摸点坐标  
    var that = this;
    var curPoint = [e.touches[0].pageX, e.touches[0].pageY];
    var startpoint = that.data.startpoint;
    //console.log(startpoint)
    //console.log(curPoint)
    //比较pagex值  
    if (curPoint[0] < startpoint[0]) {
      if (Math.abs(curPoint[0] - startpoint[0]) >= Math.abs(curPoint[1] - startpoint[1])) {
        //console.log(e.timestamp + '-touch left move')
        that.setData({
          dellStyle: "dellList"
        })
      } else {
        if (curPoint[1] >= startpoint[1]) {
          //console.log(e.timestamp + '-touch down move')
          that.setData({
            searchhidden: false
          })
        } else {
          //console.log(e.timestamp + '-touch up move')
          that.setData({
            searchhidden: true
          })
        }
      }
    } else {
      if (Math.abs(curPoint[0] - startpoint[0] >= Math.abs(curPoint[1] - startpoint[1]))) {
        //console.log(e.timestamp + '-touch right move')
        that.setData({
          dellStyle: "modList"
        })
      
      } else {
        if (curPoint[1] >= startpoint[1]) {
          //console.log(e.timestamp + '-touch down move')
          that.setData({
            searchhidden: false
          })
        } else {
          //console.log(e.timestamp + '-touch up move')
          that.setData({
            searchhidden: true
          })
        }
      }
    }
  },  

  handletap: function (event) {
    console.log(event)
  },
  

  //滑动结束事件
  handletouchend: function (event) {
    var that = this
    that.setData({
      currentGesture: 0   //没有滑动
    })
   
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  // 点击获取对应分类的数据
  onTapTag: function (e) {
    var that = this;
    //var tab = e.currentTarget.id;
    var tab = e.currentTarget.dataset.id;
    var tab_value = e.currentTarget.dataset.value;
    var sliderOffset = e.currentTarget.offsetLeft;
    var index = e.currentTarget.dataset.index;
    var search_goodsname = e.currentTarget.dataset.title;
    var navList = that.data.navList;
    var scrollLeft = 0
    scrollLeft = 120 * index
    if (tab != 'search_goodsname') {
      search_goodsname = '';
    }

    that.setData({
      activeIndex: index,
      tab: tab,
      tab_value: tab_value,
      scrollLeft: scrollLeft,
      page: 1,
      search_goodsname: search_goodsname,
    })
    //console.log('scrollLeft:' + that.data.scrollLeft)
    //that.get_goods_list()
  },
 
  onTapTag2: function (e) {
    var that = this
    var tab = e.currentTarget.id
    var index = e.currentTarget.dataset.index
    var updown = that.data.updown == 1 ? 0 : 1
    var value = e.currentTarget.dataset.value
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      updown: updown
    })

    that.goodsClassify()
  },
  goodsClassify: function (e) {
    var that = this 
    var value = that.data.navList2[that.data.activeIndex2]['value']
    wx.navigateTo({
      url: '../classify/classify?username=' + username + '&token=' + token+'&value='+value
    })
  },
  showGoods: function (e) {
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    //var carts = this.data.carts;
    var sku_id = objectId;
    wx.navigateTo({
      url: '../details/details?sku_id=' + objectId + '&id=' + goods_id + '&token=' + token + '&username=' + username
    })
  },
  addCart: function (e) {
    var that = this
    var goods_id = e.currentTarget.dataset.goodsId
    var username = wx.getStorageSync('username')
  
    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login?goods_id=' + that.data.goodsid
      })
    } else {
      if (goods_id) {
        that.insertCart(goods_id, username, 0);

      } else {
        wx.showToast({
          title: '该产品无货',
          icon: 'loading',
          duration: 1500
        });
      }
    }

  },
  insertCart: function (goods_id, username, sku_id = 0) {
    var that = this
    var wishflag = 0 

    // 加入购物车

    wx.request({
      url: weburl + '/api/client/add_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: "1",
        sku_id: sku_id,
        goods_id: goods_id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var title = wishflag == 1 ? '加入购物车完成' : '加入购物车完成'
        wx.showToast({
          title: title,
          duration: 1000
        })
        if (wishflag == 1) {
          wx.navigateTo({
            url: '../wish/wish'
          })
        } else {
          /*
          wx.switchTab({
            url: '../hall/hall'
          })
          */
        }

      }

    })
  },
  searchTapTag: function (e) {
    var that = this;
    //console.log('搜索关键字：' + that.data.search_goodsname)
    //that.get_goods_list()
    wx.navigateTo({
      url: '../goods/list/list?username=' + username + '&token=' + token
    })

  },

  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var all_rows = that.data.all_rows;
    if (page > all_rows) {
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
    //that.get_goods_list()
  },

  addressTapTag: function (e) {
    var that = this
    wx.navigateTo({
      url: '../address/list/list?address=' + that.data.address
    })
  },

  search_goodsnameTapTag: function (e) {
    var that = this;
    var keyword = e.detail.value;
    this.setData({
      keyword: keyword
    })

  },

  // 定位数据  
  menu_scroll: function (e) {
    var that = this;
    var scrollTop = e.detail.scrollTop
    that.setData({
      scrollTop: scrollTop + 10,
    });
    //console.log('scrollTop:' + that.data.scrollTop)
  },
  page_scroll: function (e) {
    var that = this;
    var scrollTop = e.detail.scrollTop
    that.setData({
      scrollTop: scrollTop + 10,
      searchhidden: !searchhidden,
    })
    //console.log('page_scroll:' + that.data.scrollTop)
  },

  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },

  onLoad: function (options) {
    console.log('onLoad');
    var that = this
    var username = username ? username : '';
    var token = token ? token : '1';
    var prom_hour = new Date();
    that.setData({
      username: username ? username : '',
      token: token ? token : '1',
      prom_hour: prom_hour.getHours(),
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })


    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
       
          
        })
      }
    })

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

    //获取当前位置
    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: qqmapkey // 必填
    });
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
        wx.setStorageSync('accuracy', accuracy);
        /*
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            that.setData({
              address: address
            })
            wx.setStorageSync('mylocation', address);
            console.log('位置获取成功:' + address)
          },
          fail: function (res) {
            console.log('位置获取失败')
            console.log(res)
          }
        })
        */
        qqmapsdk.reverseGeocoder({
          poi_options: 'policy=2',
          get_poi: 1,
          success: function (res) {
            console.log(res);
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
    
  },
  onShow: function () {
    var that = this
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var shop_type = that.data.shop_type;
    var venuesItems = that.data.venuesItems;
    var venuesItems2 = that.data.venuesItems2;
    var venuesItems3 = that.data.venuesItems3;
    var prom_hour = that.data.prom_hour ;
    
    wx.request({
      url: weburl + '/api/client/query_adv',
      method: 'POST',
      data: { position_id: "9" },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result)
        var advpicInfo = res.data.result
        for (var i = 0; i < advpicInfo.length; i++) {
          if (advpicInfo[i].ext == 'mp4') {
            that.setData({
              interval: 50000,
              duration: 12000,
            })
          }
        }
        that.setData({
          images: res.data.result
        })

      },
      fail: function (res) {
        console.log(res)
      },
      complete: function () {
        console.log('complete')
      }
    })

    that.get_menubar()
    
    //精品推荐
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        goods_type: 'is_recommend',
        goods_type_value: 1,
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
        shop_type: shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var venuesItems = res.data.result;
        var page = that.data.page;
        var all_rows = res.data.all_rows;
        if (!venuesItems) {
          wx.showToast({
            title: '没有搜到精品记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({
            venuesItems: [],
            all_rows: 0,
            keyword: ''
          })
          return;
        }
        for (var i = 0; i < venuesItems.length; i++) {
          venuesItems[i]['short_name'] = venuesItems[i]['name'].substring(0, 10) + '...'
          if (!venuesItems[i]['act_info']) {
            venuesItems[i]['act_info'] = ''
          } else {
            //venuesItems[i]['act_info'] = venuesItems[i]['act_info'].substring(0, 10) + '...'
          }
          if (!venuesItems[i]['goods_tag']) {
            venuesItems[i]['goods_tag'] = ''
          } else {
            venuesItems[i]['goods_tag'] = venuesItems[i]['goods_tag'].substring(0, 10)
          }
        }
        if (page > 1 && venuesItems) {
          //向后合拼
          venuesItems = that.data.venuesItems.concat(venuesItems);
        }
        that.setData({
          venuesItems: venuesItems,
          all_rows: all_rows,
          keyword: ''
        })
        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })

    //品味生活
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        goods_type: 'is_qianggou',
        goods_type_value: 1,
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
        shop_type: shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var venuesItems2 = res.data.result;
        var page = that.data.page;
        var all_rows2 = res.data.all_rows;
        if (!venuesItems2) {
          wx.showToast({
            title: '没有搜到品味记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({
            venuesItems2: [],
            all_rows2: 0,
            keyword: ''
          })
          return;
        }
        for (var i = 0; i < venuesItems2.length; i++) {
          venuesItems2[i]['short_name'] = venuesItems2[i]['name'].substring(0, 10) + '...'
          if (!venuesItems2[i]['act_info']) {
            venuesItems2[i]['act_info'] = ''
          } else {
           // venuesItems2[i]['act_info'] = venuesItems2[i]['act_info'].substring(0, 10) + '...'
          }
          if (!venuesItems2[i]['goods_tag']) {
            venuesItems2[i]['goods_tag'] = ''
          } else {
            venuesItems2[i]['goods_tag'] = venuesItems2[i]['goods_tag'].substring(0, 10)
          }
        }
        if (page > 1 && venuesItems2) {
          //向后合拼
          venuesItems2 = that.data.venuesItems2.concat(venuesItems2);
        }
        that.setData({
          venuesItems2: venuesItems2,
          all_rows2: all_rows2,
          keyword: ''
        })
        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
    //限时抢购
    
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        goods_type: 'prom_type',
        goods_type_value: 1,
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
        shop_type: shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var venuesItems3 = res.data.result;
        var venuesItems3_3 = that.data.venuesItems3_3;
        var page = that.data.page;
        var all_rows3 = res.data.all_rows;
       
        if (!venuesItems3) {
          /*
          wx.showToast({
            title: '没有搜到限时记录',
            icon: 'loading',
            duration: 1000
          })
          */
          that.setData({
            venuesItems3: [],
            venuesItems3_3: [],
            all_rows3: 0,
            keyword: ''
          })
          return;
        }
        var prom_limittime = venuesItems3[0]['end_time']
        var j = 0;
        var k = 0;
        var item_k = [];
        for (var i = 0; i < venuesItems3.length; i++) {
          venuesItems3[i]['short_name'] = venuesItems3[i]['name'].substring(0, 10) + '...'
          if (!venuesItems3[i]['act_info']) {
            venuesItems3[i]['act_info'] = ''
          } else {
            venuesItems3[i]['act_info'] = venuesItems3[i]['act_info'].substring(0, 10) + '...'
          }
          if (!venuesItems3[i]['goods_tag']) {
            venuesItems3[i]['goods_tag'] = ''
          } else {
            venuesItems3[i]['goods_tag'] = venuesItems3[i]['goods_tag'].substring(0, 10)
          }
          k = (i + 1) % 3
          if (k > 0 && i < venuesItems3.length) {
            item_k[k] = venuesItems3[i]
          } else {
            item_k[k] = venuesItems3[i]
            venuesItems3_3[j] = item_k
            item_k = []
            j++
          }

          if (prom_limittime > venuesItems3[i]['end_time'] && venuesItems3[i]['end_time']>0){
            prom_limittime = venuesItems3[i]['end_time']
          }
        }
       
        if (page > 1 && venuesItems3) {
          //向后合拼
          venuesItems3 = that.data.venuesItems3.concat(venuesItems3)
        }
        
        var now = new Date().getTime()
        var limittime = prom_limittime - parseInt(now/1000)
        var left_hour = parseInt(limittime / (60 * 60 ) )
        var left_min = parseInt((limittime - left_hour * 60*60) /60)
        var left_sec = limittime%60
        
        
        that.setData({
          venuesItems3: venuesItems3,
          venuesItems3_3: venuesItems3_3,
          all_rows3: all_rows3,
          keyword: '',
          prom_limittime: prom_limittime,
          left_sec: left_sec ? left_sec : '0',
          left_min: left_min ? left_min : '0',
          left_hour: left_hour ? left_hour : '0',
        })
      

        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)

        setInterval(function () {
          var now = new Date().getTime()
          var limittime = that.data.prom_limittime - parseInt(now / 1000)
          var left_hour = parseInt(limittime / (60 * 60) )
          var left_min = parseInt((limittime - left_hour * 60 * 60) / 60 )
          var left_sec = limittime % 60
         
          that.setData({
            left_sec: left_sec ? left_sec:'0',
            left_min: left_min ? left_min:'0',
            left_hour: left_hour ? left_hour:'0',
          })
        }, 3000)

      }
    })


  },

  
  get_goods_list: function (event) {
    //venuesList
    var that = this;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var username = that.data.username;
    var token = that.data.token;
    var goods_type = that.data.goods_type;
    var goods_type_value = that.data.goods_type_value;
    var goods_sales = that.data.goods_sales;
    var updown = that.data.updown;
    var search_goodsname = that.data.search_goodsname;
    var keyword = that.data.keyword;
    var shop_type = that.data.shop_type

    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        goods_type: goods_type,
        goods_type_value: goods_type_value,
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
        search_goodsname: search_goodsname,
        goods_sales: goods_sales,
        updown: updown,
        keyword: keyword,
        shop_type: shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var venuesItems = res.data.result;
        var page = that.data.page;
        var all_rows = res.data.all_rows;
        if (!venuesItems) {
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({
            venuesItems: [],
            all_rows: 0,
            keyword: ''
          })
          return;
        }
        for (var i = 0; i < venuesItems.length; i++) {
          venuesItems[i]['short_name'] = venuesItems[i]['name'].substring(0, 10) + '...'
          if (!venuesItems[i]['act_info']) {
            venuesItems[i]['act_info'] = ''
          } else {
            venuesItems[i]['act_info'] = venuesItems[i]['act_info'].substring(0, 10) + '...'
          }
          if (!venuesItems[i]['goods_tag']) {
            venuesItems[i]['goods_tag'] = ''
          } else {
            venuesItems[i]['goods_tag'] = venuesItems[i]['goods_tag'].substring(0, 10)
          }
        }
        if (page > 1 && venuesItems) {
          //向后合拼
          venuesItems = that.data.venuesItems.concat(venuesItems);
        }
        that.setData({
          venuesItems: venuesItems,
          all_rows: all_rows,
          keyword: ''
        })
        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },
  get_menubar: function (event) { //获取菜单项
    var that = this;
    wx.request({
      url: weburl + '/api/client/get_menubar',
      method: 'POST',
      data: {
        menu_type: 3,  //暂定
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var navList_new = res.data.result;
        if (!navList_new) {
          wx.showToast({
            title: '没有定义菜单项',
            icon: 'loading',
            duration: 1500
          });
          return;
        }
        that.setData({
          navList2: navList_new
        })
        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '做菜就是生活',
      desc: '品质生活从做菜开始!',
      path: '/pages/index/index?refername='+username
    }
  }
})
