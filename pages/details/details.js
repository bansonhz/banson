var app = getApp();
var wxparse = require("../../wxParse/wxParse.js");
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var from_page = app.globalData.from_page;
var deliverytype = app.globalData.deliverytype;
var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
Page({
    data: {
        title_name: '详情',
        title_logo: '../../images/footer-icon-05.png',
        this_page:'/pages/details/details',
        user:null,
        userInfo:{},
        username:null,
        indicatorDots: true,
        vertical: false,
        autoplay: true,
        page:1,
        interval: 3000,
        duration: 1200,
        goodsname:'',
        goodsshortname: '',
        goodsinfo:[],
        goodsprice: 0,
        goodssale: 0,
        goodsid: 0,
        goods_num:1, //only for machine goods
        sku_gov_price:0,
        sku_earnest_price:0,
        sku_sell_price: 0,
        sku_id:0,
        commodityAttr:[],
        attrValueList:[],
        includeGroup:[],
        firstIndex:0,
        image:'',
        hideviewgoodsinfo:true,
        hideviewgoodspara:true,
        dkheight: 300,
        scrollTop: 0,
        scrollTop_init:10,
        toView: 'red',
        hideviewgoodsinfoflag:true, 
        hideviewgoodsparaflag:true,
        modalHidden: true,//是否隐藏对话框  
        dkcontent:[],
        goodsPicsInfo:[],
        selectValueInfo:'',
        wishflag:0,
        goodsinfoshowflag:0,
        shop_type:shop_type,
        machine_uuid: current_shop_info['machine_uuid'], //售货机 uuid
        is_machine: current_shop_info['type'] == 2 ? 1 : 0, //是否售货机
        machine_shop_id: current_shop_info['shop_id'], //售货机 所属 shop_id
        machine_location_id: current_shop_info['id'], //售货机 所属 shop_id
        deliverytype:deliverytype,
    },
  bindMinus: function (e) {
    var that = this
    var num = that.data.goods_num
    var num_cur = num
    //  
    if (num_cur > 1) {
      num--
    } else {
      return
    }

    that.setData({
      goods_num: num,
    })
  },
  bindPlus: function (e) {
    var that = this
    var num = that.data.goods_num;
    var num_cur = num
    //  
    if (num_cur > 0) {
      num++
    }  

    that.setData({
      goods_num: num,
    })
  },
  setNavigation: function () {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
          startBarHeight = 44
        }
        that.setData({
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      app.globalData.from_page = '/pages/details/details'
      wx.switchTab({
        url: '../../hall/hall'
      })
    }

  },
  onLoad: function(options) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var page = that.data.page
    var goods_shape = options.goods_shape?options.goods_shape:0
    var goodsname = options.name
    var goodsshortname = goodsname?goodsname.substring(0,13)+'...':''
    var goodsid = options.id
    var goodsinfo = options.goods_info ? options.goods_info:''
    var goodsprice = options.goods_price
    var goodssale = options.sale
    var image = options.image
    var shop_type =  that.data.shop_type
    var machine = options.machine ? options.machine:0
    var goods_machine = options.goods_machine ? options.goods_machine : {}

    that.setData({
      goods_shape: goods_shape,
      machine: machine,
    })
    if (machine >0){
      var machine_goods_info = JSON.parse(goods_machine)
      var goodsPicsInfo = {}
      var goodsPicsInfo_image = {}
      var goodsPicsInfo_image_url = {}
      goodsPicsInfo_image_url['url'] = machine_goods_info['link'] ? machine_goods_info['link'] : machine_goods_info['image']
      goodsPicsInfo_image['0'] = goodsPicsInfo_image_url
      goodsPicsInfo['image'] = goodsPicsInfo_image
      console.log('detail machine goods info:', options.goods_machine);
      that.setData({
        goodsname: machine_goods_info['name'] ? machine_goods_info['name'] : '',
        image: machine_goods_info['link'] ? machine_goods_info['link'] : machine_goods_info['image'],
        goods_secid: machine_goods_info['sec_id'] ? machine_goods_info['sec_id'] : 0,
        goodsid: machine_goods_info['id'] ? machine_goods_info['id'] : 0,
        goodsprice: machine_goods_info['sell_price'] ? machine_goods_info['sell_price'] : 0,
        goodsPicsInfo: goodsPicsInfo,
      })
      console.log('detail machine goods image:', that.data.goodsPicsInfo);
      return
    }
    goodsinfo = goodsinfo == 'undefined' ? '' : goodsinfo
    that.setData({
          goodsname: goodsname ? goodsname:'',
          goodsinfo: goodsinfo ? goodsinfo:'',
          goodsshortname: goodsshortname ? goodsshortname:'',
          image: image ? image:'',
          goodsid: goodsid ? goodsid:0,
          goodsprice: goodsprice ? goodsprice:0,
          goodssale: goodssale ? goodssale:0,
          goods_shape: goods_shape ? goods_shape:0,
    })
    that.setNavigation()
    if (goodsid>0){
          wx.request({
            url: weburl + '/api/client/get_goods_list',
            method: 'POST',
            data: { 
              username: options.username ? options.username : username, 
              access_token: token, 
              goods_id: goodsid, 
              shop_type:shop_type,
              goods_shape:goods_shape,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var goods_info = res.data.result
              var ret_info = res.data.info
              console.log('获取单个产品信息', res.data, ' info:', goods_info);
              if (goods_info) {
                that.setData({
                  goodsname: goods_info[0]['name'],
                  goodsinfo: goods_info[0]['act_info'],
                  goodstag: goods_info[0]['goods_tag'],
                  goodsprice: goods_info[0]['sell_price'],
                  goodssale: goods_info[0]['sale'],
                  goodsshortname: goods_info[0]['name'] ? goods_info[0]['name'].trim().substring(0, 20) + '...' : '',
                  goodscoverimg: goods_info[0]['activity_image'],
                })
              }else{
                wx.showToast({
                  title: '商品已下架',
                  icon: 'loading',
                  duration: 3000
                })
                setTimeout(function () {
                  wx.navigateBack();
                }, 1500)
                return
              }
             
            }
          })
    }else{
          console.log('单个产品名称为空',goodsid);
          return
    }

        // 商品详情图片
    wx.request({
          url: weburl+'/api/client/get_goodsdesc_list',
          method: 'POST',
          data: { 
            username: username, 
            access_token: token, 
            goods_id: goodsid, 
            page: page ,
            shop_type: shop_type,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            that.setData({
              goodsPicsInfo: res.data.result,
              
            })
          that.showGoodsinfo()
          }
         
        })
        // 商品SKU
        wx.request({
          url: weburl+'/api/client/get_goodssku_list',
          method: 'POST',
          data: { 
            username: options.username ? options.username:this.data.username, 
            access_token: token, 
            goods_id: goodsid, 
            page: page 
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('goods_sku:',res.data.result);
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
            if (!attrValueList ) return
            for (var i = 0; i < attrValueList.length; i++) {
              if (!attrValueList[i].attrValueStatus) {
                attrValueList[i].attrValueStatus = true;
              } 
            }
           
            that.setData({
              attrValueList: attrValueList
            })

          }
    })
      

  },
    //事件处理函数 选择型号规格  
  goodsmodel: function () {
      var that = this;
      console.log('goodsmodel 商品属性:', that.data.attrValueList)
      that.setData({
        modalHidden: !that.data.modalHidden,
        //sku_id: that.data.commodityAttr[0].id,
        //sku_sell_price: that.data.commodityAttr[0].sell_price,
        add_cart_title: '商品名称',
        wishflag: 0,
      })
      if (that.data.attrValueList.length==0){
        that.setData({
          sku_id: that.data.commodityAttr[0].id,
          sku_sell_price: that.data.commodityAttr[0].sell_price,
          
        })
      }
    },
    wishCart: function () {
      var that = this
      var firstIndex = that.data.firstIndex ? that.data.firstIndex : 0
      var secondIndex = that.data.secondIndex ? that.data.secondIndex : 0
      that.setData({
        modalHidden: !that.data.modalHidden,
        //sku_id: that.data.commodityAttr[firstIndex].id,
        add_cart_title:'商品名称',
        wishflag: 1,
      })
    },
    //确定按钮点击事件  
    modalBindaconfirm: function () {
      this.setData({
        modalHidden: !this.data.modalHidden,
       
      }),
      this.addCart();
    },
    //取消按钮点击事件  
    modalBindcancel: function () {
      this.setData({
        modalHidden: !this.data.modalHidden
      })
    },  
    addCart: function () {
      var that = this
      var username = wx.getStorageSync('username')
     
      if (!username) {//登录
        wx.navigateTo({
          url: '../login/login?goods_id=' + that.data.goodsid
        })
      }else{
        if (that.data.sku_id){
          that.insertCart(that.data.sku_id, username,that.data.wishflag);
          
        }else{
          wx.showToast({
            title: '该产品无货',
            icon: 'loading',
            duration: 1500
          });
        }
      }
      
},
insertCart: function (sku_id,username,wishflag) {
      var that = this
      var shop_type = that.data.shop_type
      wx.request({
        url: weburl + '/api/client/add_cart',
        method: 'POST',
        data: {
          username: username,
          access_token: "1",
          sku_id: sku_id,
          wishflag: wishflag,
          shop_type:shop_type,
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
            duration: 1500
          })
          app.globalData.from_page = '/pages/details/details'
          if (wishflag == 1) {
            /*
            wx.navigateTo({
              url: '../wish/wish'
            })
            */
            wx.switchTab({
              url: '../wish/wish?'
            })
          } else {
            wx.switchTab({
              url: '../cart/cart?'
            })
          }

        }

      })
      /*
      // 加入购物车
      var title = wishflag == 1 ? '确认要加入心愿单吗' :'确认要购买送出吗'
      wx.showModal({
        title: '提示',
        content: title,
        success: function (res) {
          if (res.confirm) {
            // 加入购物车
            var that=this;
            

          }
        }
      })
      */
},
showCartToast: function (message) {
      wx.showToast({
        title: message ? message:'已加入购物车',
        icon: 'success',
        duration: 1000
      });
},

 
showCart: function () {
      app.globalData.from_page = '/pages/details/details'
      wx.switchTab({
        url: '../hall/hall'
      });
},

showGoodsinfo: function () {
      // 获得高度  
      let winPage = this;
     
      winPage.setData({
        //hideviewgoodsinfo: (!winPage.data.hideviewgoodsinfo),
        hideviewgoodsinfo:false,
      })
      
      if (winPage.data.hideviewgoodsinfoflag){
        if (winPage.data.goodsinfoshowflag==0){
          wxparse.wxParse('dkcontent1', 'html', winPage.data.goodsPicsInfo.desc['desc'], winPage, 1)
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
              dkheight: winHeight - winHeight * 0.05 - 100,
              scrollTop: winPage.data.scrollTop_init
            })
          }
        })
      wxparse.wxParse('dkcontent2', 'html', winPage.data.goodsPicsInfo.desc['desc2'], winPage, 1)
      }
      winPage.setData({
        hideviewgoodsparaflag: false
      })
},
confirmOrder: function () {
  var that = this  
  var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
  var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
  var goods_shape = that.data.goods_shape
  var machine = that.data.machine
  var status = 0;
  var amount = that.data.goodsprice;
  var order_type = 'xianshe_machine'
  var shop_id = that.data.machine_shop_id ? that.data.machine_shop_id:0
  var buy_type = 'sku' //立即购买
  var m_desc = that.data.is_machine>0?'售货机购买':'小程序购物'
  var deliverytype = that.data.deliverytype
  var machine_uuid = that.data.machine_uuid
  var order_price = that.data.goodsprice
  var shop_type = that.data.shop_type
  var goods_name = that.data.goodsname
  var goods_image = that.data.image
  var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
  var machine_uuid = current_shop_info['machine_uuid'] //售货机 uuid
  var is_machine = current_shop_info['type'] == 2 ? 1 : 0 //是否售货机
  var machine_shop_id = current_shop_info['shop_id'] //售货机 所属 shop_id
  var machine_location_id = current_shop_info['id'] //售货机 所属 shop_id
  var shop_delivery_id =  machine_location_id ? machine_location_id : 0
  var prov = current_shop_info['prov'] ? current_shop_info['prov']:0
  var city = current_shop_info['city'] ? current_shop_info['city'] : 0
  var area = current_shop_info['area'] ? current_shop_info['area'] : 0
  var town = current_shop_info['town'] ? current_shop_info['town'] : 0
  var address = current_shop_info['address'] ? current_shop_info['address'] : 0
  

  if (is_machine > 0 && machine == 1){
    var goods_id = that.data.goodsid
    var sku_id = that.data.goods_secid
    var goods_num = that.data.goods_num ? that.data.goods_num:1
    wx.request({
      url: weburl + '/api/client/add_order3',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        goods_id: goods_id,
        sku_id: sku_id,
        buy_type: buy_type,
        buy_num: goods_num,
        order_type: order_type,
        shop_id: shop_id,
        m_desc: m_desc,
        deliverytype: deliverytype,
        address_id: machine_uuid,
        order_price: order_price * goods_num,
        shop_delivery_id: shop_delivery_id,
        goods_name: goods_name,
        goods_image: goods_image,
        delivery_id: 0,
        shop_type:shop_type,
        prov:prov,
        city:city,
        area:area,
        town:town,
        address:address,
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
            title: '订单提交完成',
            icon: 'success',
            duration: 1500
          });
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          });
        }
        wx.navigateTo({
          url: '../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay'] + '&goods_num=' + goods_num
        });
      }
    })
  } else {
    var sku_id = that.data.sku_id
    if(sku_id == 0) {
      wx.showToast({
        title: '未选中商品',
        icon: 'loading',
        duration: 1500
      });
      return
    }
    wx.request({
      url: weburl + '/api/client/add_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        sku_id: sku_id,
        buy_type: buy_type,
        buy_num: 1,
        order_type: order_type,
        shop_id: shop_id,
        shop_type:shop_type,
        m_desc: m_desc,
        deliverytype: deliverytype,
        address_id: 0,
        shop_delivery_id: shop_delivery_id,
        goods_name: goods_name,
        goods_image: goods_image,
        delivery_id: 0,
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
            title: '订单提交完成',
            icon: 'success',
            duration: 1500
          });
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'none',
            duration: 1500
          });
        }
        wx.navigateTo({
          url: '../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay']
        });
      }
    })
  }
  

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
      var that = this
      var attrValueList = that.data.attrValueList;
      var index = e.currentTarget.dataset.index;//属性索引 
      var firstIndex = that.data.firstIndex
      var valueindex = e.currentTarget.dataset.valueindex;//属性索引 
      var key = e.currentTarget.dataset.key;
      var value = e.currentTarget.dataset.value;
      var status = e.currentTarget.dataset.status
      var selectedvalue = e.currentTarget.dataset.selectedvalue
      this.setData({
        //includeGroup: commodityAttr,
        firstIndex: index,
        secondIndex: valueindex,
      });
      if (status || valueindex == that.data.secondIndex) {
        if (attrValueList[index].type==2){
          value = attrValueList[index].note[valueindex]
        }
        if (selectedvalue == value) {
          // 取消选中 
          that.disSelectValue(index, key, value);
        } else {
          // 选中 
          that.selectValue( index, key, value);
        }

      }
      that.setData({
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        sku_sell_price: '',
      })
      var selectValueInfo='';
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          selectValueInfo = selectValueInfo + attrValueList[i].selectedValue+';';
        }
      }
      
      for (var i = 0; i < that.data.commodityAttr.length; i++) {
        if (selectValueInfo.indexOf(that.data.commodityAttr[i].sku_key)>=0) {
          that.setData({
            sku_id: that.data.commodityAttr[i].id,
            sku_gov_price: that.data.commodityAttr[i].gov_price,
            sku_earnest_price: that.data.commodityAttr[i].earnest_price,
            sku_sell_price: that.data.commodityAttr[i].sell_price,
          })
          //break
        }
        
      }

      
     
},
    /* 选中 */
selectValue: function (index, key, value) {
      var that = this
      var attrValueList = that.data.attrValueList
      attrValueList[index].selectedValue = value;
    
      that.setData({
        attrValueList: attrValueList,
        
        //includeGroup: includeGroup
      })
     // console.log('selectValueInfo 选中信息:', attrValueList,' index:',index); 
},
    /* 取消选中 */
disSelectValue: function (index, key, value) {
      //var commodityAttr = this.data.commodityAttr;
      var that = this
      var attrValueList = that.data.attrValueList
      attrValueList[index].selectedValue = '';
      this.setData({
        //includeGroup: commodityAttr,
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        attrValueList: attrValueList
      })
     // console.log('selectValueInfo 取消选中信息:', attrValueList,' index:',index); 
},
    
onShow: function () {
    var that = this
    var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
    that.setData({
      machine_uuid: current_shop_info['machine_uuid'], //售货机 uuid
      is_machine: current_shop_info['type'] == 2 ? 1 : 0, //是否售货机
    })
    /*
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }  
    */
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 100,
        })
      }
    })

},

onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
    this.videoContext.seek(1)
},

onShareAppMessage: function () {
    return {
      title: '送心',
      desc: '送礼就是送心!',
      path: '/pages/hall/hall?refername='+username
    }
  }
})
