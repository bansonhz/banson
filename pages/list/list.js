import defaultData from '../../data';
var util = require('../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';

var navList = [
  { id: "is_create", title: "创业", value: "3" },
  { id: "is_idea", title: "创意", value: "4" },
  { id: "is_active", title: "活动", value: "5" },

];
var navList2 = [
  { id: "dinner_date", title: "时间", value: "", img: "" ,list:""},
  { id: "cuisinesystem", title: "菜系", value: "", img: "", list:"" },
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
    memberItems:[],
    memberSchedule:[],
    biz_area:[],
    search_goodsname: null,
    keyword: '',
    page: 1,
    pagesize: 6,
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
    shop_type: shop_type,  //商家类型 1普通 2百货超市 3生鲜
    scrollLeft: 0,
    toView: 0,
    member_type:3,  //厨师
    cuisinesystem: '',
    dinner_time:'',
    current_date: util.formatTime(new Date).substring(0,10), //年月日
    current_time: util.formatTime(new Date).substring(11,5),  //时分
    multiIndex2: [0, 0],
    dinner_order: [
      [{
        id: 0,
        name: util.getDateStr(util.formatTime(new Date).substring(0, 10), 1)
      },
      {
        id: 1,
        name: util.getDateStr(util.formatTime(new Date).substring(0, 10), 2)
      },
      {
        id: 2,
        name: util.getDateStr(util.formatTime(new Date).substring(0, 10), 3)
      },
      {
        id: 3,
        name: util.getDateStr(util.formatTime(new Date).substring(0, 10), 4)
      },
      {
        id: 4,
        name: util.getDateStr(util.formatTime(new Date).substring(0, 10), 5)
      },
      {
        id: 5,
        name: util.getDateStr(util.formatTime(new Date).substring(0, 10), 6)
      }
      ],
      [
        {
          id: 0,
          name: '09:00'
        },
        {
          id: 1,
          name: '09:30'
        },
        {
          id: 2,
          name: '10:00'
        },
        {
          id: 3,
          name: '10:30'
        },
        {
          id: 4,
          name: '11:00'
        },
        {
          id: 5,
          name: '11:30'
        },
        {
          id: 6,
          name: '12:00'
        },
        {
          id: 7,
          name: '12:30'
        },
        {
          id: 8,
          name: '13:00'
        },
        {
          id: 9,
          name: '13:30'
        },
        {
          id: 10,
          name: '14:00'
        },
        {
          id: 11,
          name: '14:30'
        },
        {
          id: 12,
          name: '15:00'
        },
        {
          id: 13,
          name: '15:30'
        },
        {
          id: 14,
          name: '16:00'
        },
        {
          id: 15,
          name: '16:30'
        },
        {
          id: 16,
          name: '17:00'
        },
        {
          id: 17,
          name: '17:30'
        },
        {
          id: 18,
          name: '18:00'
        },
        {
          id: 19,
          name: '18:30'
        },
        {
          id: 20,
          name: '19:00'
        },
        {
          id: 21,
          name: '19:30'
        },
        {
          id: 22,
          name: '20:00'
        },
        {
          id: 23,
          name: '20:30'
        },
        {
          id: 24,
          name: '21:00'
        }
      ]
    ],
   
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
  },
  // 点击获取对应分类的数据
  onTapTag: function (e) {
    var that = this;
    var headimgurl = e.currentTarget.dataset.headimgurl;
    var cuisine_username = e.currentTarget.dataset.username;
    var star = e.currentTarget.dataset.star;
    var cuisinesystem = e.currentTarget.dataset.cuisinesystem;
    that.setData({
      cuisine_username: cuisine_username,
    })
    wx.navigateTo({
      url: '../member/memberdetails/memberdetails?cuisine_username=' + cuisine_username + '&headimgurl=' + headimgurl + '&star=' + JSON.stringify(star) + '&cuisinesystem=' + JSON.stringify(cuisinesystem)
    })

    //that.get_kitchener_schedule()
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

    that.get_kitchener_list()
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
    that.get_kitchener_list()
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
    that.get_kitchener_list()
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var that = this
    var tab = e.currentTarget.dataset.id
    var tab_index = e.currentTarget.dataset.index
    var list_index = e.detail.value
    var navList2 = that.data.navList2
    var dinner_time = that.data.dinner_time
    var cuisinesystem = that.data.cuisinesystem
    if (tab == 'date') {
      navList2[tab_index]['default_title'] = list_index.replace(/-/g, '')
      dinner_time = navList2[tab_index]['default_title']
    } else if (tab == 'cuisinesystem') {
      navList2[tab_index]['default_title'] = navList2[tab_index]['list'][list_index]
      navList2[tab_index]['default_index'] = list_index
      cuisinesystem = navList2[tab_index]['default_title'] 
    }

    that.setData({
      navList2: navList2,
      dinner_time: dinner_time,
      cuisinesystem: cuisinesystem
    })
    that.get_kitchener_list()
  },

  bindMultiPickerChange2: function (e) {
    var that = this
    console.log('多列picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      multiIndex2: e.detail.value
    })
    that.get_kitchener_list()
  },
  bindMultiPickerColumnChange2: function (e) {
    var that = this
    console.log('多列修改的列为', e.detail.column, '，值为', e.detail.value)
    that.data.multiIndex2[e.detail.column] = e.detail.value
    that.data.multiIndex2[1] = 0
    //that.get_kitchener_list()
  },

  onLoad: function (options) {
    console.log('onLoad');
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    console.log(that.data.dinner_order)
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
        })
      }
    })
   
    that.get_menubar()
    that.get_kitchener_list()
  },
  onShow: function () {
    var that = this
    //that.get_menubar()
    //that.get_kitchener_list()
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

  get_kitchener_list: function (event) {
    //venuesList
    var that = this;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var member_type = that.data.member_type;
    var ordertime = that.data.dinner_order[0][that.data.multiIndex2[0]]['name'] + ' ' + that.data.dinner_order[1][that.data.multiIndex2[1]]['name'];
    var cuisinesystem = that.data.cuisinesystem;
    wx.request({
      url: weburl + '/api/client/get_kitchener_list',
      method: 'POST',
      data: {
        member_type: member_type,
        ordertime: ordertime,
        cuisinesystem:cuisinesystem,
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var memberItems = res.data.result;
        var page = that.data.page;
        var all_rows = res.data.all_rows;
        if (!memberItems) {
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({
  
            keyword: ''
          })
          return;
        }
       
        for (var i = 0; i < memberItems.length; i++) {
          memberItems[i]['cuisinesystem'] = memberItems[i]['biz_area'].split(',')
          var star = []
          for (var j = 0; j< memberItems[i]['user_level']; j++){
            star[j] = '../../images/star_on.png'
          }
          if (star.length == 0) star[0] = '../../images/star.png'
          memberItems[i]['star'] = star 
        }
       // console.log(memberItems)
        if (page > 1 && memberItems) {
          //向后合拼
          memberItems = that.data.memberItems.concat(memberItems);
        }
        that.setData({
          memberItems: memberItems,
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
        menu_type: 6,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('菜单项')
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
        for (var i = 0; i < navList_new.length; i++) {
          navList_new[i]['list'] = navList_new[i]['list'].split(',')
          navList_new[i]['default_title'] = navList_new[i]['list'][0]
          navList_new[i]['default_index'] = 0
          navList_new[i]['hidden'] = true
        }
        that.setData({
          navList2: navList_new
        })
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

  //预约时间表查询
  get_kitchener_schedule: function () {
    //venuesList
    var that = this;
    var cuisine_username = that.data.cuisine_username;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';

    wx.request({
      url: weburl + '/api/client/get_kitchener_schedule',
      method: 'POST',
      data: {
        member_username: cuisine_username,
        username: username,
        access_token: token,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('厨师预约时间表')
        console.log(res.data.result)
        var memberSchedule = res.data.result;
        if (!memberSchedule) {
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({

            keyword: ''
          })
          return;
        }

       
        that.setData({
          memberSchedule: memberSchedule,
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
      title: '唐巢',
      desc: '品质生活!',
      path: '/pages/list/list?refername='+username
    }
  }
})
