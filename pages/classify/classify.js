import defaultData from '../../data';
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var page = 1;
var pagesize = 6;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '15355813859';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
var shop_id = app.globalData.shop_id;
var shop_type = app.globalData.shop_type;
// 请求数据

Page({
  data: {
    navLeftItems: [],
    navRightItems: [],
    navLeftItems_name:'',
    navLeftItems_slogon:'我们保证食品的新鲜，隔日不用，每日更新',
    lists: [],
    curNav: 1,
    curIndex: 0,
    secid: 0,
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    scrollLeft:0,
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    activeIndex:-1,
    all_rows:0,
    page_num:0,
    page:page,
    pagesize:pagesize,
    hiddenallclassify:true,
    machine_uuid: current_shop_info['machine_uuid'], //售货机 uuid
    is_machine: current_shop_info['type']==2?1:0, //是否售货机
   
  },
  //滑动移动事件
  touchstart: function (e) {
    var that = this;
    //开始触摸，获取触摸坐标  
    //console.log(e)
    that.setData({
      startpoint: [e.touches[0].pageX, e.touches[0].pageY]
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
  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.loadgoods()
  },

  search_goodsnameTapTag: function (e) {
    var that = this;
    var keyword = e.detail.value;
    this.setData({
      keyword: keyword
    })

  },
  showGoods: function (e) {
    // 点击购物车某件商品跳转到商品详情
    var that = this
    var curIndex = e.currentTarget.dataset.goodsIndex
    var objectId = e.currentTarget.dataset.objectId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var machine_goods_info = that.data.navLeftItems[that.data.curIndex]['list']
    var goods_machine = []
    goods_machine = machine_goods_info[curIndex]
    goods_machine['id'] = that.data.navLeftItems[that.data.curIndex]['id']
    console.log('showGoods machine goods info:', goods_machine, ' curIndex:', curIndex);
    //var carts = this.data.carts;
    var sku_id = objectId
    var machine = that.data.is_machine>0?1:0
     
    wx.navigateTo({
      url: '../details/details?id=' + goods_id + '&machine=' +machine+ '&goods_machine=' + JSON.stringify(goods_machine) + '&token=' + token + '&username=' + username
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
  loadgoods: function (cat_id,sec_cat_id) {
    var that = this
    var catid = cat_id ? cat_id : 0
    var sec_catid = sec_cat_id ? sec_cat_id:0
    var search_goodsname = that.data.search_goodsname
    var goods_type = ''
    var page = that.data.page
    var pagesize = that.data.pagesize
    var page_num = that.data.page_num
    goods_type = search_goodsname?'search_goodsname':''
    console.log('loadgoods cat_id:', cat_id, ' sec_cat_id:', sec_cat_id, ' page:', page)
    
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        shop_cat_id: catid,
        shop_sec_cat_id: sec_catid,
        goods_type: goods_type,
        search_goodsname: search_goodsname,
        page: page,
        pagesize: pagesize,
        username: username,
        access_token: token,
        shop_type: shop_type,
        shop_id: shop_id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        var list = that.data.lists;
        if (!res.data.result){
          return
        }
        if (page == 1) list = []
       
        var all_rows = res.data.all_rows
        page_num = all_rows //(all_rows / pagesize + 0.5)
        for (var i = 0; i < res.data.result.length; i++) {
          //res.data.result[i]['short_name'] = res.data.result[i]['name'].substring(0, 15) + '...';
          if (res.data.result[i]['activity_image']) res.data.result[i]['image'] = weburl + res.data.result[i]['activity_image'];
         
          list.push(res.data.result[i]);
        }
        
        that.setData({
          lists: list,
          all_rows: all_rows,
          page:page,
          page_num: page_num.toFixed(0),
        });
        that.setData({
          hidden: true
        })
        
      },
      fail: function (res) {
        console.log('fail')
        that.setData({
          hidden: true
        });
      },
      complete: function () {
        that.setData({
          hidden: true
        });
      }
      
    })
  },

  // 点击获取对应分类的数据
  onTapTag: function (e) {
    var that = this;
    var secid = e.currentTarget.dataset.id;
    var secname = e.currentTarget.dataset.name
    var index = e.currentTarget.dataset.index
    var navRightItems = that.data.navRightItems
    var scrollLeft = that.data.scrollLeft
    var toView=index
    if (index > 2 && index < navRightItems.length) {
      toView = index -2
    }else{
      toView = 0
    }
    
    that.setData({
      activeIndex: index,
      scrollLeft: scrollLeft,
      toView: toView ? toView:'0',
      secid:secid,
      lists:[], 
      hiddenallclassify: true,
      page:1,
    })
    console.log('子分类数据 onTapTag index:' + index, that.data.curIndex)
    if(that.data.is_machine>0 && that.data.machine_uuid){
      that.setData({
        lists: that.data.navLeftItems[that.data.curIndex]['list'],
      })
    }else{
      that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id'], navRightItems[index]['sec_id']);
    }
    
    
  },
  // 打开全部子分类
  openAllTapTag: function (e) {
    var that = this
    var hiddenallclassify = that.data.hiddenallclassify
    that.setData({
      hiddenallclassify: !hiddenallclassify,
    })
   // console.log('打开全部子分类', hiddenallclassify)
  },
  // 定位数据  
  getleft: function (e) {
    var that = this;
    this.setData({
      scrollLeft: that.data.scrollLeft+10
    })
  },
 
  onLoad: function (options) {
    var that = this
    var value = options.value ? options.value:0
    var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
    var is_machine = wx.getStorageSync('is_machine')
    var machine_uuid = wx.getStorageSync('machine_uuid') 
    that.setData({
      value: value,
      current_shop_info: current_shop_info,
      is_machine: is_machine,
      machine_uuid: machine_uuid,

    })
    
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight - 0,
          scrollTop: that.data.scrollTop + 10
        })
      }
    }) 
   

    //sliderList
    /*
    wx.request({
      url: weburl + '/api/client/query_adv',
      method: 'POST',
      data: { position_id: "8" },
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
        console.log('fail')
      },
      complete: function () {
        console.log('always')
      }
    })
*/
    //that.get_shop_goods_category()
    
  },

onShow:function(){
  var that = this
  var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
  var is_machine = wx.getStorageSync('is_machine')
  var machine_uuid = wx.getStorageSync('machine_uuid') 
  
  that.setData({
    is_machine: current_shop_info['type'] == 2 ? 1 : 0,
    machine_uuid: current_shop_info['machine_uuid'],
  })
  if (that.data.is_machine > 0) {
    that.get_shop_machine_goods()
    console.log('售货机:', current_shop_info)
  } else {
    that.get_shop_goods_category()
    console.log('店铺:', current_shop_info)
  }
},
get_shop_goods_category:function(){
  var that = this
  var value = that.data.value 
  var secid = that.data.secid

  var navLeftItems = wx.getStorageSync('navLeftItems')
  var navRightItems = wx.getStorageSync('navRightItems')
  var navLeftItems_name = wx.getStorageSync('navLeftItems_name')
  var navLeftItems_lists = wx.getStorageSync('navLeftItems_lists')
  var navLeftItems_curNav = wx.getStorageSync('navLeftItems_curNav')
  var navLeftItems_curIndex = wx.getStorageSync('navLeftItems_curIndex')
  console.log('get_shop_goods_category value:', value)
  if (!navLeftItems){
    wx.request({
      url: weburl + '/api/client/get_shop_goods_category',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_id: shop_id,
        reid: 0,
        category_type: 0,
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
          if (!that.data.curIndex || that.data.curIndex >= goods_classify.length) {
            that.setData({
              navRightItems: goods_classify[0]['list'],
              curNav: goods_classify[0]['id'],
              curIndex: 0
            })
          }

        }
        console.log('菜品分类 curIndex:', that.data.curIndex, goods_classify.length, 'value:', value)
        console.log('菜品分类 navLeftItems:', that.data.navLeftItems)
        that.setData({
          navLeftItems_name: that.data.navLeftItems[that.data.curIndex]['name'],
          page: 1
        })
      }
    })
  }else{
    that.setData({
      navLeftItems_name: navLeftItems_name,
      lists: navLeftItems_lists,
      navLeftItems: navLeftItems,
      navRightItems: navRightItems,
      curNav: navLeftItems_curNav,
      curIndex: navLeftItems_curIndex,
      page: 1
    })
  }
  that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id'], secid);
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
    var navLeftItems = wx.getStorageSync('navLeftItems')
    var navRightItems = wx.getStorageSync('navRightItems')
    var navLeftItems_name = wx.getStorageSync('navLeftItems_name')
    var navLeftItems_lists = wx.getStorageSync('navLeftItems_lists')
    var navLeftItems_curNav = wx.getStorageSync('navLeftItems_curNav')
    var navLeftItems_curIndex = wx.getStorageSync('navLeftItems_curIndex')
    console.log('get_shop_machine_goods current_shop_info:', current_shop_info)
    if (!navLeftItems){
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
              if (shop_machine_goods.length > 0) {
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

              console.log('售货机商品信息转换完成:', goods_classify, goods_classify.length, ' value:', value)
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
              //that.loadgoods_shop_machine(that.data.navLeftItems[that.data.curIndex]['id'], secid);
            }
          })
        }
      })
    }else{
      that.setData({
        navLeftItems_name: navLeftItems_name,
        lists: navLeftItems_lists,
        navLeftItems: navLeftItems,
        navRightItems: navRightItems,
        curNav: navLeftItems_curNav,
        curIndex: navLeftItems_curIndex,
        page: 1
      })
    }
  },
  //事件处理函数
  switchRightTab: function (e) {
    var that = this
    // 获取item项的id，和数组的下标值
    let id = e.target.dataset.id
    let index = parseInt(e.target.dataset.index)
   
    // 把点击到的某一项，设为当前index
    that.setData({
      curNav: id,
      curIndex: index,
      navRightItems: that.data.navLeftItems[index]['list'],
      navLeftItems_name: that.data.navLeftItems[index]['name'],
      value: that.data.navLeftItems[index]['id'],
      hiddenallclassify: true,
     
    })
    console.log('switchRightTab curIndex:', that.data.curIndex, 'id:', id)
    that.setData({
      lists: [],
      activeIndex:-1,
      toView:0,
      secid:0,
      all_rows:0,
      page:1,
    })
    
    if(that.data.is_machine>0 && that.data.machine_uuid){
      that.setData({
        lists: that.data.navLeftItems[that.data.curIndex]['list'],
      })
      console.log('switchRightTab page:', that.data.page, 'list:', that.data.lists)
    }else{
      that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id']);
    }
    
  },

  getMoreGoodsTapTag: function () {
    var that = this
    var page = that.data.page
    if(page>=that.data.all_rows){
      wx.showToast({
        title: '没有更多记录',
        icon: 'loading',
        duration: 1000
      })
      return
    }
    that.setData({
      page: page+1
    });
    that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id'], that.data.secid);
    console.log("getMoreGoodsTapTag");
  },

  //页面滑动到底部
  bindDownLoad: function () {
    var that = this;
    that.setData({
      page: page++
    });
    that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id'],that.data.secid);
    console.log("lower");
  },
  scroll: function (event) {
    //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      scrollTop: event.detail.scrollTop+10
    })
    console.log('scrollTop:' + scrollTop)
  },
  topLoad: function (event) {
    //   该方法绑定了页面滑动到顶部的事件，然后做上拉刷新
    //page = 1;
    this.setData({
      //list: [],
      scrollTop: 0
    });
    //loadMore(this);
    console.log("lower");
  },

})
