var app = getApp();
var wxparse = require("../../../wxParse/wxParse.js");
var util = require('../../../utils/util.js');
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;

Page({
    data: {
        shop_type:shop_type,
        user:null,
        userInfo:{},
        username:null,
        indicatorDots: false,
        vertical: false,
        autoplay: true,
        page:1,
        pagesize:10,
        all_rows:0,
        interval: 30000,
        duration: 12000,
        goodsname:'',
        goodsshortname: '',
        goodsinfo:[],
        goodsprice: 0,
        goodssale: 0,
        goodsid: 0,
        sku_gov_price:0,
        sku_earnest_price:0,
        sku_sell_price: 0,
        sku_id:0,
        commodityAttr:[],
        attrValueList:[],
        task_time:90,
        includeGroup:[],
        firstIndex:0,
        image:'',
        hideviewgoodsinfo:true,
        hideviewgoodspara:true,
        dkheight: 300,
        scrollTop: 0,
        scrollTop_init:350,
        toView: 'red',
        hiddenmodalput: true,
        hideviewgoodsinfoflag:true, 
        hideviewgoodsparaflag:true,
        modalHidden: true,//是否隐藏对话框  
        comment: '',
        comm_list: [],
        dkcontent:[],
        goodsPicsInfo:[],
        selectValueInfo:'',
        wishflag:0,
        goodsinfoshowflag:0,
        star:[],
        cuisinesystem:[],
        current_date: util.formatTime(new Date).substring(0, 10), //年月日
        current_time: util.formatTime(new Date).substring(11, 5),  //时分
        dinner_time:'',
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
        foodsIndex:0,
        foodsbuy:[
          {
            id: 0,
            name: '自备食材'
          },
          {
            id: 1,
            name: '厨师代买'
          },
        ],

        flavourIndex: 0,
        flavour: [
          {
            id: 0,
            name: '不辣'
          },
          {
            id: 1,
            name: '微辣'
          },
          {
            id: 2,
            name: '中辣'
          },
          {
            id: 3,
            name: '超辣'
          },
          {
            id: 4,
            name: '咸一点'
          },
          {
            id: 5,
            name: '淡一点'
          },
          {
            id: 6,
            name: '甜一点'
          },
        ],
    },
    commentTapTag: function (options) {
      var that = this
      that.setData({
        hiddenmodalput: false
      })
    },
    //点击按指定的hiddenmodalput弹出框  
    modalinput: function () {
      var that = this
      that.setData({
        hiddenmodalput: !that.data.hiddenmodalput
      })
    },
    //取消按钮  
    cancel: function () {
      var that = this
      that.setData({
        hiddenmodalput: true
      })
    },
    //确认  
    confirm: function () {
      var that = this
      that.setData({
        hiddenmodalput: true
      })
      that.submit_comment()
    },

    bindChange: function (e) {
      var that = this
      var comment = e.detail.value
      that.setData({
        comment: comment
      })
      //console.log('comment:' + that.data.comment)

    },  
    bindPickerChange: function (e) {
      console.log('foods picker发送选择改变，携带值为', e.detail.value)
      var that = this
      var foodsIndex = e.detail.value
    
      that.setData({
        foodsIndex: foodsIndex,
      })
      
    },
    bindFlavourChange: function (e) {
      console.log('flavour picker发送选择改变，携带值为', e.detail.value)
      var that = this
      var flavourIndex = e.detail.value

      that.setData({
        flavourIndex: flavourIndex,
      })

    },
    bindMultiPickerChange2: function (e) {
      var that = this
      var multiIndex2 = e.detail.value
      var dinner_order = that.data.dinner_order
      var dinner_time = dinner_order[0][multiIndex2[0]].name + ' ' + dinner_order[1][multiIndex2[1]].name
     
      that.setData({
        multiIndex2: multiIndex2,
        dinner_time:dinner_time
      })
      console.log('多列picker发送选择改变，携带值为', e.detail.value)
      console.log('多列picker发送选择改变，携带值为', dinner_time)
    },
    bindMultiPickerColumnChange2: function (e) {
      var that = this
      let now = util.formatTime(new Date)
      var current_time = now.substring(11, 16)  //时分
      var current_date = now.substring(0, 10) //年月日
     
      var current_hour = current_time.substring(0,2)
      var current_min = current_time.substring(3, 5)
      console.log('多列修改的列为', e.detail.column, '，值为', e.detail.value)
     // console.log('当前时间', now, current_date, current_time)
      that.data.multiIndex2[e.detail.column] = e.detail.value
      that.data.multiIndex2[1] = 0
      
     
      let column = e.detail.column ? e.detail.column:0// 当前选择栏号
      let val = e.detail.value; // 当前选择栏号索引值
      let book_list = that.data.book_list // 所有数据
      //console.log('多列信息表', book_list)
      //定义对应变量
      var order_day = that.data.dinner_order[0] // 一级列表
      var order_time = [] // 二级列表
      switch (column) {
        case 0:
          //此处是拖动第一栏的时候处理
          for (var u in book_list) {
            //console.log('book_day', u, order_day[val]['name'])
            if (u == order_day[val]['name']){
              var book_day = JSON.parse(book_list[u])
              var j = 0
              for (var i=0;i<book_day.length;i++){
                if (u == current_date ){
                  var book_hour = book_day[i]['name'].substring(0,2)
                  var book_min = book_day[i]['name'].substring(3, 5)
                  
                  if ((book_hour * 24 + book_min) < (current_hour * 24 + current_min+3*24)) {
                    book_day[i]['status'] == 1
                    //console.log('选中时间', book_hour * 24 + book_min, current_hour * 24 + current_min + 3 * 24)
                  }
                }

                if (book_day[i]['status'] == 0 ){
                  order_time[j] = book_day[i]
                  j++
                }
              }
              //console.log('order_time', JSON.stringify(order_time))
              that.setData({
                dinner_order: [order_day, order_time],
                multiIndex2: [val, 0] // 初始化二级列表回第一项
              })
              break
            }
            
          }
        
          break
        case 1:
          //此处是拖动第二栏的时候处理
          /*
          var u = that.data.dinner_order[0][that.data.multiIndex2[0]].name
          var book_day = JSON.parse(book_list[u])
          //console.log('选中二级', book_day )
          var j = 0
          for (var i = 0; i < book_day.length; i++) {
            if (u == current_date) {
              var book_hour = book_day[i]['name'].substring(0, 2)
              var book_min = book_day[i]['name'].substring(3, 5)

              if ((book_hour * 24 + book_min) < (current_hour * 24 + current_min + 3 * 24)) {
                book_day[i]['status'] == 1
               
              }
            }

            if (book_day[i]['status'] == 0) {
              order_time[j] = book_day[i]
              j++
            }
          }
          //console.log('order_time', JSON.stringify(order_time))
          that.setData({
            dinner_order: [order_day, order_time],
          
          })
          */
          break
          
      }
       
    },
    confirmOrder: function () {
      var that = this;
      var sku_id = that.data.sku_id
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
      var status = 0;
      var order_type = 'kitchener';
      var dinner_time= that.data.dinner_time
      var buy_num = 1
      var foodsbuy_note = that.data.foodsbuy[that.data.foodsIndex]['name']
      var flavour_note = that.data.flavour[that.data.flavourIndex]['name']
      var note = foodsbuy_note + ',' + flavour_note
      var task_time = that.data.task_time
      var member_username = that.data.cuisine_username
     
      if (!dinner_time){
        wx.showToast({
          title: '用餐时间未选',
          icon: 'loading',
          duration: 1500
        })
        return
      }
      
      wx.request({
        url: weburl + '/api/client/add_order',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          sku_id: sku_id,
          buy_type: 'sku',
          buy_num: buy_num,
          delivery_time:dinner_time,
          order_type: order_type,
          m_desc: note,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res.data.result);
          var order_data = res.data.result;

          if (!res.data.info) {
            wx.showToast({
              title: '预约提交完成',
              icon: 'success',
              duration: 1500
            })
            wx.navigateTo({
              url: '../../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay'] + '&member_username=' + member_username
            })
          } else {
            wx.showToast({
              title: res.data.info,
              icon: 'loading',
              duration: 1500
            })
            if (res.data.info == '收货地址不存在' || res.data.info == '收货地址不在配送区'){
              wx.navigateTo({
                url: '../../address/list/list'
              })  
            }
            
          }
         
        }
      })

    },

    get_comments_list: function () {
      var that = this
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var page = that.data.page
      var pagesize = that.data.pagesize
      var goods_id = that.data.goodsid
      var shop_type = that.data.shop_type
      if (goods_id > 0) {
        wx.request({
          url: weburl + '/api/client/get_comments_list',
          method: 'POST',
          data: {
            username: username,
            access_token: token,
            goods_id: goods_id,
            page: page,
            pagesize: pagesize,
            shop_type: shop_type,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            var comm_list = res.data.result
            var ret_info = res.data.info
            var all_rows = res.data.all_rows ? res.data.all_rows : 1
            console.log('获取评论信息 id:' + goods_id);
            console.log(res.data);
            if (comm_list) {
              for (var i = 0; i < comm_list.length; i++) {
                comm_list[i]['headimgurl'] = comm_list[i]['headimgurl'].indexOf('http') == -1 ? (weburl + comm_list[i]['headimgurl']) : comm_list[i]['headimgurl']

                comm_list[i]['pub_time'] = util.getDateDiff(comm_list[i]['addtime_str'] * 1000)
              }
              that.setData({
                comm_list: that.data.comm_list.concat(comm_list),
                all_rows: all_rows,
              })
              console.log(comm_list)
            } else {

              /*
              that.setData({
                comm_list: [],
              })
              wx.showToast({
                title: '评论不存在',
                icon: 'loading',
                duration: 3000
              })
              */
            }
          }
        })
      }
    },
    submit_comment: function () {
      var that = this
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var comment = that.data.comment
      var goods_id = that.data.goodsid
      var goods_owner = that.data.cuisine_username
      var shop_type = that.data.shop_type
      if (goods_id > 0) {
        wx.request({
          url: weburl + '/api/client/post_comment',
          method: 'POST',
          data: {
            username: username,
            access_token: token,
            goods_id: goods_id,
            goods_owner: goods_owner,
            content: comment,
            shop_type:shop_type,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            var comm_info = res.data.result
            var ret_info = res.data.info
            console.log('点评完成')
            console.log(comm_info, ret_info)
            if (comm_info) {
              comm_info['headimgurl'] = comm_info['headimgurl'].indexOf('http') == -1 ? (weburl + comm_info['headimgurl']) : comm_info['headimgurl']

              comm_info['pub_time'] = util.getDateDiff(comm_info['addtime_str'] * 1000)
              var comm_list = that.data.comm_list
              var newarray = [{
                headimgurl: comm_info['headimgurl'],
                pub_time: comm_info['pub_time'],
                nickname: comm_info['nickname'],
                content: comm_info['content'],
              }]

              comm_list = newarray.concat(comm_list);
              that.setData({
                comm_list: comm_list,
              })
              //console.log(comm_list)
            } else {
              
              wx.showToast({
                title: ret_info,
                icon: 'loading',
                duration: 1500
              })
              
            }
          }
        })
      }
    },

    onLoad: function(options) {
        var that = this;
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var page = that.data.page
        var cuisine_username = options.cuisine_username
        var headimgurl = options.headimgurl
        var star = options.star ? JSON.parse(options.star):[]
        var cuisinesystem = options.cuisinesystem ? JSON.parse(options.cuisinesystem):[]
        console.log('cuisine_username:' + cuisine_username)
        console.log('headimgurl:' + headimgurl)
       
        console.log('cuisinesystem:' + cuisinesystem)
        
        if (star){
          for (var i = 0; i < star.length; i++) {
            star[i] = '../' + star[i]
          }
        }
        console.log('star:' + star)
        that.setData({
          cuisine_username: cuisine_username ? cuisine_username:'',
          headimgurl: headimgurl ? headimgurl:'',
          cuisinesystem: cuisinesystem ? cuisinesystem:[],
          star: star ? star:[],
        })
        if (cuisine_username){
          that.get_goods_list()
          that.get_member_schedule()
        }

    },
    //获取商品信息
    get_goods_list:function(){
      var that = this
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var page = that.data.page
      var cuisine_username = that.data.cuisine_username
        
      wx.request({
        url: weburl + '/api/client/get_goods_list',
        method: 'POST',
        data: {
          username: username,
          goods_owner: cuisine_username,
          access_token: token,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          var goods_info = res.data.result
          var ret_info = res.data.info
          console.log('获取单个产品信息');
          //console.log(res.data);
          console.log(goods_info);
          if (goods_info) {
            that.setData({
              goodsid: goods_info[0]['id'],
              goodsname: goods_info[0]['name'],
              goodsinfo: goods_info[0]['act_info'],
              goodstag: goods_info[0]['goods_tag'],
              goodsprice: goods_info[0]['sell_price'],
              goodssale: goods_info[0]['sale'],
              goodsshortname: goods_info[0]['name'] ? goods_info[0]['name'].trim().substring(0, 20) + '...' : ''
            })
            that.get_comments_list()
            // 商品SKU
            wx.request({
              url: weburl + '/api/client/get_goodssku_list',
              method: 'POST',
              data: {
                username: username,
                access_token: token,
                goods_id: that.data.goodsid,
                page: page
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                console.log(res.data.result);
                var attrValueList = res.data.result.spec_select_list;
                var commodityAttr = res.data.result.sku_list;
                if (!commodityAttr) return;
                for (var i = 0; i < commodityAttr.length; i++) {
                  if (commodityAttr[i].attrValueStatus) {
                    commodityAttr[i].attrValueStatus = true;
                  } else {
                    commodityAttr[i].attrValueStatus = false;
                  }
                }
                that.setData({
                  commodityAttr: commodityAttr
                })
                if (!attrValueList) return
                for (var i = 0; i < attrValueList.length; i++) {
                  if (attrValueList[i].attrValueStatus) {
                    attrValueList[i].attrValueStatus = true;
                  } else {
                    attrValueList[i].attrValueStatus = false;
                  }
                }

                that.setData({
                  attrValueList: attrValueList
                })

              }
            })

            // 详情
            wx.request({
              url: weburl + '/api/client/get_goodsdesc_list',
              method: 'POST',
              data: {
                username: username,
                access_token: token,
                goods_id: that.data.goodsid,
                page: page
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                that.setData({
                  goodsPicsInfo: res.data.result,
                })
              }
            })
            
          } else {
            wx.showToast({
              title: '服务已暂停',
              icon: 'loading',
              duration: 3000
            })
            setTimeout(function () {
              wx.navigateBack();
            }, 1500);
          }

        }
      })
    },


    //获取预约时间表
    get_member_schedule:function(){
      var that = this 
      var cuisine_username = that.data.cuisine_username
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var dinner_order = that.data.dinner_order
      var book_list = []
      var book_today = []
      var current_date = util.formatTime(new Date).substring(0, 10)
      var multiIndex2 = that.data.multiIndex2
      // 
      wx.request({
        url: weburl + '/api/client/get_member_schedule',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          member_username: cuisine_username,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('schedule:',res.data.result);
          var schedule_list = res.data.result;
         
          if (!schedule_list) return;
          for (var i = 0; i < 6; i++) {
            dinner_order[0][i]['name'] = schedule_list[i]['sch_date']
            
            var m = 0
            for(var j=0;j<25;j++){
              var k = j+20  //早上9点~晚上9点
              var field = 'time'+k
              dinner_order[1][j]['status'] = schedule_list[i][field]>0 ? schedule_list[i][field]:0
              //初始化默认日期时间表
              if (dinner_order[0][i]['name'] == current_date && dinner_order[1][j]['status'] == 0 ) {
                book_today[m++] = dinner_order[1][j]
              }
            }
          
              book_list[dinner_order[0][i]['name']] = JSON.stringify(dinner_order[1])
             
            }
            //console.log('book_today:', JSON.stringify(book_today))
            dinner_order[1] = book_today
            that.setData({
              dinner_order: dinner_order,
              book_list: book_list,
              multiIndex2: multiIndex2,
            })
        }
      })

    
    },
    //事件处理函数 选择型号规格  
    goodsmodel: function () {
      var that = this;
      that.setData({
        modalHidden: !that.data.modalHidden,
        sku_id: that.data.commodityAttr[0].id,
        add_cart_title: '立即预约？',
        wishflag: 0,
      })
    },
    wishCart: function () {
      var that = this
      that.setData({
        modalHidden: !that.data.modalHidden,
        sku_id: that.data.commodityAttr[0].id,
        add_cart_title:'加入心愿单？',
        wishflag: 1,
      })
    },
    //确定按钮点击事件  
    modalBindaconfirm: function () {
      var that = this
      that.setData({
        modalHidden: !this.data.modalHidden,
       
      }),
        that.confirmOrder()
      // that.addCart();
    },
    //取消按钮点击事件  
    modalBindcancel: function () {
      this.setData({
        modalHidden: !this.data.modalHidden
      })
    },  
    addCart: function () {
      var that = this
      var username = wx.getStorageSync('username');
      if (!username) {//登录
        wx.navigateTo({
          url: '../login/login?goods_id=' + that.data.goodsid
        })
      }else{
        if (that.data.sku_id){
          that.insertCart(that.data.sku_id, username,that.data.wishflag);
          
        }else{
          wx.showToast({
            title: '该服务已停止',
            icon: 'loading',
            duration: 1500
          });
        }
      }
      
    },
    insertCart: function (sku_id,username,wishflag) {
      var that = this;
  
      // 加入购物车
      var title = wishflag == 1 ? '确认吗' :'确认要预约吗'
      wx.showModal({
        title: '提示',
        content: title,
        success: function (res) {
          if (res.confirm) {
            // 加入购物车
            var that=this;
            wx.request({
              url: weburl + '/api/client/add_cart',
              method: 'POST',
              data: { 
                username: username, 
                access_token: "1", 
                sku_id: sku_id,
                wishflag:wishflag 
                },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                console.log(res.data.result);
                var title = wishflag == 1 ?'加入心愿单完成':'加入购物车完成'
                wx.showToast({
                  title: title,
                  duration: 1500
                })
                if(wishflag==1){
                  wx.navigateTo({
                    url: '../wish/wish'
                  })
                }else{
                  wx.switchTab({
                    url: '../hall/hall'
                  })
                }
               
              }
              
            })

          }
        }
      })
    },
    showCartToast: function (message) {
      wx.showToast({
        title: message ? message:'已加入预约',
        icon: 'success',
        duration: 1000
      });
    },

 
    showCart: function () {
      wx.switchTab({
        url: '../hall/hall'
      });
    },

    showGoodsinfo: function () {
      // 获得高度  
      let winPage = this;

      winPage.setData({
        hideviewgoodsinfo: (!winPage.data.hideviewgoodsinfo),
      })
     
      if (winPage.data.hideviewgoodsinfoflag){
        if (winPage.data.goodsinfoshowflag==0){
          wxparse.wxParse('dkcontent1', 'html', winPage.data.goodsPicsInfo.desc['desc'], winPage, 1);
        }
      }
      winPage.setData({
        hideviewgoodsinfoflag: !winPage.data.hideviewgoodsinfoflag,
        goodsinfoshowflag: 1,
        scrollTop: winPage.data.scrollTop_init
      })
    },

    showGoodspara: function () {
      // 获得高度  
      var winPage = this;
      winPage.setData({
        hideviewgoodspara: (!winPage.data.hideviewgoodspara)
      })
      if (winPage.data.hideviewgoodsparaflag) {
        wx.getSystemInfo({
          success: function (res) {
            let winHeight = res.windowHeight;
            console.log(winHeight);
            winPage.setData({
              dkheight: winHeight - winHeight * 0.05 - 80,
              scrollTop: winPage.data.scrollTop_init
            })
          }
        })
      wxparse.wxParse('dkcontent2', 'html', winPage.data.goodsPicsInfo.desc['desc2'], winPage, 1);
      }
      winPage.setData({
        hideviewgoodsparaflag: false
      })
    },

    upper: function (e) {
      console.log(e)
    },
    lower: function (e) {
      console.log(e)
    },
    scroll: function (e) {
      console.log(e)
    },

    getAttrIndex: function (attrName, attrValueList) {
      // 判断数组中的attrKey是否有该属性值 
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrName == attrValueList[i].name) {
          break;
        }
      }
      return i < attrValueList.length ? i : -1;
    },
    isValueExist: function (value, valueArr) {
      // 判断是否已有属性值 
      for (var i = 0; i < valueArr.length; i++) {
        if (valueArr[i] == value) {
          break;
        }
      }
      return i < valueArr.length;
    },
    /* 选择属性值事件 */
    selectAttrValue: function (e) {
      /* 
      点选属性值，联动判断其他属性值是否可选 
      { 
      attrKey:'型号', 
      attrValueList:['1','2','3'], 
      selectedValue:'1', 
      attrValueStatus:[true,true,true] 
      } 
      console.log(e.currentTarget.dataset); 
      */
      var attrValueList = this.data.attrValueList;
      var index = e.currentTarget.dataset.index;//属性索引 
      var key = e.currentTarget.dataset.key;
      var value = e.currentTarget.dataset.value;
      this.setData({
        //includeGroup: commodityAttr,
        firstIndex: index,
      });
      if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
        if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
          // 取消选中 
          this.disSelectValue(attrValueList, index, key, value);
        } else {
          // 选中 
          this.selectValue(attrValueList, index, key, value);
        }

      }
      this.setData({
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        sku_sell_price: '',
        task_time:0,
      })
      var selectValueInfo='';
      for (var i = 0; i < this.data.attrValueList.length; i++) {
        if (this.data.attrValueList[i].selectedValue) {
          selectValueInfo = selectValueInfo+this.data.attrValueList[i].selectedValue+';';
        }
      }
      for (var i = 0; i < this.data.commodityAttr.length; i++) {
        if (selectValueInfo.indexOf(this.data.commodityAttr[i].sku_key)>=0) {
          this.setData({
            sku_id: this.data.commodityAttr[i].id,
            sku_gov_price: this.data.commodityAttr[i].gov_price,
            sku_earnest_price: this.data.commodityAttr[i].earnest_price,
            sku_sell_price: this.data.commodityAttr[i].sell_price,
            task_time: this.data.commodityAttr[i].task_time,
          })
          break;
        }
        
      }

      
     
    },
    /* 选中 */
    selectValue: function (attrValueList, index, key, value, unselectStatus) {
      // console.log('firstIndex', this.data.firstIndex); 
     // var includeGroup = [];
      /*
      if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选 
        var commodityAttr = this.data.commodityAttr;
        // 其他选中的属性值全都置空 
        // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus); 
        for (var i = 0; i < attrValueList.length; i++) {
          attrValueList[i].selectedValue = '';
        }
      } else {
        var commodityAttr = this.data.includeGroup;
      }

      // console.log('选中', commodityAttr, index, key, value); 
      for (var i = 0; i < commodityAttr.length; i++) {
        for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
          if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
            includeGroup.push(commodityAttr[i]);
          }
        }
      }
      */
      attrValueList[index].selectedValue = value;
      /*
      // 判断属性是否可选 
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].attrValueStatus[j] = false;
        }
      }
      for (var k = 0; k < attrValueList.length; k++) {
        for (var i = 0; i < includeGroup.length; i++) {
          for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
            if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
              for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
                if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                  attrValueList[k].attrValueStatus[m] = true;
                }
              }
            }
          }
        }
      }
      // console.log('结果', attrValueList); 
      */
      this.setData({
        attrValueList: attrValueList,
        //includeGroup: includeGroup
      });
      
      
    /*
      var count = 0;
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
      if (count < 2) {// 第一次选中，同属性的值都可选 
        this.setData({
          firstIndex: index
        });
      } else {
        this.setData({
          firstIndex: -1
        });
      }
      */
    },
    /* 取消选中 */
    disSelectValue: function (attrValueList, index, key, value) {
      //var commodityAttr = this.data.commodityAttr;
      attrValueList[index].selectedValue = '';
      this.setData({
        //includeGroup: commodityAttr,
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        attrValueList: attrValueList
      })
      
      /*
      // 判断属性是否可选 
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
      this.setData({
        includeGroup: commodityAttr,
        attrValueList: attrValueList
      });

      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          this.selectValue(attrValueList, i, attrValueList[i].name, attrValueList[i].selectedValue, true);
        }
      }
      */
    },
    
  onShow: function () {
     var that = this
      //console.log('App Show');
   // this.distachAttrValue(this.data.attrValueList);
      // 只有一个属性组合的时候默认选中 
      // console.log(this.data.attrValueList); 
      /*
      if (this.data.commodityAttr.length == 1) {
        for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
          this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
        }
        this.setData({
          attrValueList: this.data.attrValueList
        });
      }
      */
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        let winWidth = res.windowWidth;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 80,
          winHeight: winHeight,
          winWidth: winWidth,
        })
      }
    })

    //that.get_comments_list()
  },


  onShareAppMessage: function () {
    return {
      title: '半生',
      desc: '品质生活从做菜开始!',
      path: '/pages/index/index?refername='+username
    }
  }
})
