import defaultData from '../../../data';
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var navList = [
  { id: "is_recommend", title: "推荐", value: "1" },
  { id: "activity_flag", title: "精品", value: "1" },
  { id: "is_qianggou", title: "送Ta", value: "1" },
  { id: "is_flag", title: "亲人", value: "1" },
  { id: "search_goodsname", title: "美食", value: "美食" },
  { id: "search_goodsname", title: "数码", value: "数码" }
];
var navList2 = [
  { id: "default", title: "最新" },
  { id: "hot", title: "人气" },
  { id: "price", title: "价格" },
];

Page({
  data: {
    activeIndex: 0,
    activeIndex2: 0,
    navList: navList,
    navList2: navList2,
    images: [],
    all_rows: 0,
    venuesItems: [],
    search_goodsname: null,
    keyword: '',
    page: 1,
    pagesize: 20,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: true, // loading
    msgList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    tab: 'is_recommend',
    tab_value: "1",
    tab2: 'default',
    updown: 0,     //升序 降序
    shop_type: 1,  //商家类型 1普通
    scrollLeft: 0,
    toView: 0,

  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
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
    var toView = index
    if (index > 2 && index < navList.length) {
      toView = index - 2
    } else {
      toView = 0
    }

    if (tab != 'search_goodsname') {
      search_goodsname = '';
    }

    that.setData({
      activeIndex: index,
      tab: tab,
      tab_value: tab_value,
      page: 1,
      search_goodsname: search_goodsname,
      toView: toView ? toView : 0,
    })
    console.log('toView:' + that.data.toView)
    that.get_goods_list()
  },
  onTapTag2: function (e) {
    var that = this;
    var tab = e.currentTarget.id;
    var index = e.currentTarget.dataset.index;
    var updown = that.data.updown == 1 ? 0 : 1;
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      updown: updown
    });

    that.get_goods_list()
  },

  //定位数据  
  getleft: function (e) {
    var that = this;
    this.setData({
      scrollLeft: that.data.scrollLeft + 10
    })
  },

  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.get_goods_list()
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
    that.get_goods_list()
  },

  onLoad: function (options) {
    console.log('onLoad');
    var that = this;
    var username = options.username;
    var token = options.token;
    that.setData({
      username: username,
      token: token,
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
          sliderLeft: 0,
          sliderOffset: res.windowWidth / that.data.navList.length * that.data.activeIndex,
        })
      }
    })
    console.log(that.data.sliderOffset)
    that.get_menubar()
    that.get_goods_list()
  },
  onShow: function () {
    var that = this

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
    console.log('scrollTop:' + that.data.scrollTop)
  },


  get_goods_list: function (event) {
    //venuesList
    var that = this;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var username = that.data.username;
    var token = that.data.token;
    var goods_type = that.data.tab;
    var goods_type_value = that.data.tab_value;
    var goods_sales = that.data.tab2;
    var updown = that.data.updown;
    var search_goodsname = that.data.search_goodsname;
    var keyword = that.data.keyword;
    var shop_type = that.data.shop_type
    var shape = 1

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
        shop_type: shop_type,
        shape: shape
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
        menu_type: 1,
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
          navList: navList_new
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
      title: '送心',
      desc: '送礼就是送心!',
      path: '/pages/list/list?id=123'
    }
  }
})
