var app = getApp(),
  wxRequest = app.requirejs('wxRequest');
var util = require('../../utils/tools.js');
import icons from '../../utils/icons.js';
//var _function = require('../../utils/functionData');
//获取搜索应用实例
//var WxSearch = require('../../wxSearch/wxSearch.js')
// 最大行数
var max_row_height = 5;
// 行高
var cart_offset = 90;
// 底部栏偏移量
var food_row_height = 49;
var that;
Page({
  data: {
    "URL": 2,
   indicatorDots: false,
   autoplay: true,
   interval: 2500,
   duration: 1000,
    loaded: false,
    "is_over": false,
    "no_data": false,
    "goods_img": {
      "imageWidth": 0,
      "imageheight": 0
    },
    "banner_img": {
      "imageWidth": 0,
      "imageheight": 0
    },
    "nav_scroll_left": 0,
    cartData: {},
    isshow: true,
    icons: icons,
    cartObjects: [],
    maskVisual: 'hidden',
    amount: 0,
    thetype:'cart',
    shopCarInfo: {},
    show_menu: true,    
    hideShopPopup: true,
    seller: {
      'express_fee': 20,
      'min_amount': 50
    },
    delta_price: '50',
    amount_str: '0',
    buyNumber:1,
    buyNumMin: 1,
    buyNumMax: 40,
    selectSizePrice:0,
    show_calendar:true,
    wxSearchData: {
      value: ''
    }
  },

  //配置方法
  getConfig: function () {
    this.baseApiUrl = util.config('baseApiUrl');
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.page = 1;
  },

  onLoad: function (options) {
    that = this;
    var cate_id = app.globalData.catid||1;
    var indexz = app.globalData.indexz||0;
    this.search_title = '';
    //console.log(3);
    //wx.showNavigationBarLoading();
    var tcindex = indexz||options.tcindex;
    var tcid = options.tcid;
    this.setData({ "current_index": indexz });
    this.cate_id=1;
    if(options.id){
      this.cate_id = options.id;
    }
    if (tcid != null) {
      this.setData({ "current_index": tcindex });
    }
    if (tcid != null) {
      this.cate_id = tcid;
    }
    this.getConfig();
   // this.goodsList();
  //  this.getMap();
    this.goodsCate();
   // this.nc_goodsCate();
   
   // 获取分类id
   
    if (cate_id){
      this.dataRendered(cate_id, indexz)
    }
  },

  //获取地区
  getMap: function () {
    var userMap = wx.getStorageSync('userMap');
    if (userMap && userMap != undefined) {
      this.setData({ "address_info": userMap.city });
    } else {
      var self = this;
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          var url = self.baseApiUrl + "api/project/map/latitude/" + latitude + "/longitude/" + longitude;
          var data = { "latitude": latitude, "longitude": longitude };
          util.ajax({
            url: url,
            data: data,
            "success": function (data) {
              self.loaded();
              if (data.result == 'ok') {
                self.setData({ "address_info": data.ad_info.city });
                wx.setStorageSync('userMap', data.ad_info);
              }
            }
          })
        }
      })
    }
  },

  

  closePopupTap: function () {
    this.setData({
      hideShopPopup: true,
      buyNumber: 1,
      selectSizePrice: 0,
    })
  },

  toAddShopCar: function (e) {

    var that=this;

    console.log(that.data.goods);
    var index = e.currentTarget.dataset.index;
    this.setData({
      shopType: "addShopCar",
      index:index,
    })
    if (that.data.goods[index].group_price==0)
    {
      var price= that.data.goods[index].market_price;

    }
    else{
      var price = that.data.goods[index].group_price;
    }
    this.setData({
      image: that.data.goods[index].image_url,
      name: that.data.goods[index].goods_name,
      selectSizePrice: price,
    })
    this.bindGuiGeTap();
  },
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },

  numJianTap: function () {
    var that = this;
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      if (that.data.goods[that.data.index].group_price == 0) {
        var price = that.data.goods[that.data.index].market_price;

      }
      else {
        var price = that.data.goods[that.data.index].group_price;
      }
      this.setData({
        selectSizePrice: (price * currentNum).toFixed(2),
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    var that = this;
    console.log('1');
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      if (that.data.goods[that.data.index].group_price == 0) {
        var price = that.data.goods[that.data.index].market_price;

      }
      else {
        var price = that.data.goods[that.data.index].group_price;
      }
      this.setData({
        selectSizePrice: (price * currentNum).toFixed(2),
        buyNumber: currentNum
      })
    }
  },

  addShopCar: function () {

    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();
    console.log(shopCarInfo);
    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,carts:[]}
  },
  bulidShopCarInfo: function () {
    var that =this;
    // 加入购物车
    var shopCarMap = {};
    console.log(that.data.index);
    shopCarMap.goods_id = that.data.goods[that.data.index].goods_id;
    shopCarMap.goods_name = that.data.goods[that.data.index].goods_name;
    shopCarMap.market_price = parseFloat(that.data.goods[that.data.index].market_price);
    shopCarMap.group_price = parseFloat(that.data.goods[that.data.index].group_price);
    shopCarMap.quantity = that.data.buyNumber;
    shopCarMap.image = that.data.image;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.carts) {
      shopCarInfo.carts = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.carts.length; i++) {
      var tmpShopCarMap = shopCarInfo.carts[i];
      if (tmpShopCarMap.goods_id == shopCarMap.goods_id) {
        hasSameGoodsIndex = i;
        shopCarMap.quantity = shopCarMap.quantity + tmpShopCarMap.quantity;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.carts.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.carts.push(shopCarMap);
    }
    return shopCarInfo;
  },

//获取农产品分类
  nc_goodsCate: function (cid) {
    var offset = 0;
    var size = 100;
    var data = {
      "offset": offset,
      "size": size,
      "cid": cid
    };
    var url = this.baseApiUrl + "/api/goodsCate/nc_lists";
    var self = this;
    util.ajax({
      "url": url,
      "data": data,
      "success": function (data) {
        if (data.result == 'ok') {
          self.goodsList();
          for (var i = 0; i < data.cates.length; i++) {
            if (data.cates[i].cate_name == '会员卡' ||data.cates[i].cate_name != '每季新菜'){
              data.cates.splice(i, 1);
            }
          }
          self.setData({
            "nc_cates": data.cates
          });
        }
      }
    });
  },
  goodsList: function (nc) {
    if (this.data.no_data) return true;
    var offset = (this.page - 1) * this.size;
    var size = this.size;
    var ttoken = wx.getStorageSync('token');
    var data = {
      "offset": offset,
      "size": size,
      "token": ttoken
    };
    var url = this.baseApiUrl + "Api/Goods/lists";

    if (this.cate_id != undefined) {
      if (nc == 1 || nc == 17) {
        data.ncp_cate_id = this.cate_id;
      } else {
        data.cate_id = this.cate_id;
      }
    
    }

    var self = this;
    util.ajax({
      "url": url,
      "data": data,
      "success": function (data) {
        var allData = '';
        var agoData = self.data.goods;
        var goods = data.goods;
        if (data.goods.length != 0) {
          for (var a = 0; a < goods.length;a++){
            var imgList=[];
            var data0 = goods[a].goods_imgs || "a:3:{i:0;s:59:" + goods[a].image_url +";}";
            var data1 = data0.split('{')[1]
            var data2 = data1.split('}')[0];
            var data3 = data2.split('http:');
            for (var b = 1; b < data3.length; b++){
              var data4 = data3[b].split('.jpg')[0];
              var data5={
                "imgurl": 'http:' + data4 + '.jpg'
              }
              imgList.push(data5);
            }
            goods[a].imgList = imgList;
          }
          if (data.goods.length < self.size) {
            self.setData({
              "is_over": 1,
              "no_data": 1
            });
          }
       
          allData = goods;
          console.log(allData);

          self.setData({ loaded: true });
          self.setData({
            isshow: false,
            "goods": allData
          });
        } else {
          self.setData({
            isshow: false,
            "is_over": 1,
            "no_data": 1
          });

        }
        self.loaded();
      }
    });
  },
  cusImageLoad: function (e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    var data = {};
  //  data[id] = WxAutoImage.wxAutoImageCal(e);
    that.setData(data);
  },
  cusImageGoods: function (e) {
    var that = this;
    that.setData(util.imageUtil(e));
  },
  goodsCate: function (e) {
    var offset = 0;
    var size = 100;
    var data = {
      "offset": offset,
      "size": size
    };
    var url = this.baseApiUrl + "/api/goodsCate/lists";
    var self = this;
    util.ajax({
      "url": url,
      "data": data,
      "success": function (data) {
        console.log(data)
        if (data.result == 'ok') {
          //self.cate_id = data.cates[0].cate_id;
          //self.cate_id = 1;
          self.goodsList();
          self.setData({
             isshow:false,
            "cates": data.cates
          });
        }
      }
    });
  },
  loadding: function () {
    this.setData({ loaded: false });
  },
  loaded: function () {
    this.setData({ loaded: true });
  },

  tapleftmenu: function (e) {
    console.log(e);
    this.cate_id = e.currentTarget.dataset.cate_id;
    this.loadding();
    this.setData({
      'goods': [],
      'is_over': 0,
      'no_data': 0,
      "scroll_Top": -Math.random()
    });
    this.page = 1;
    this.goodsList(1);
  },

  //首页分类选择
  channelRendered: function (e) {
    var that=this;
    that.setData({
      isshow:true,
      thetype: 'cart',
    })
    var nav_scroll_left = 0;
    this.cate_id = e.currentTarget.dataset.cate_id;
    console.log(this.cate_id)
    if(this.cate_id==1){
      that.setData({
       show_menu:false,
       show_calendar: true,
       item:200,
      });
      //调用分类
      this.nc_goodsCate(this.cate_id);
    }
    else if (this.cate_id == 17) {
      that.setData({
        show_calendar: true,
        show_menu: false,
        item: 200,
      });
      //调用分类
      this.nc_goodsCate(this.cate_id);
    }else if(this.cate_id==2){
      that.setData({
        show_calendar: false,
        show_menu: true,
        item: 0,
      })
    }else{
      that.setData({
        show_calendar:true,
        show_menu: true,
        item: 0,
      })
    }
    if(this.cate_id==3){
      that.setData({
        thetype:'buy',
      })
    }
    this.current_index = e.currentTarget.dataset.index;
    console.log(this.current_index);
    var nav_temp = 0;
    if (this.data.current_index == undefined || this.data.current_index < this.current_index) {
      if (this.data.cates.length - this.current_index >= 2 && this.current_index >= 2) {
        nav_scroll_left = parseInt((this.current_index - 2)) * this.data.windowWidth + this.data.windowWidth / 5;
        this.setData({ "nav_scroll_left": nav_scroll_left });
      }
    } else if (this.data.current_index > this.current_index) {
      if (this.data.cates.length - this.current_index > 3) {
        if (this.current_index > 1) {
          nav_scroll_left = -(parseInt((this.current_index - 2)) * this.data.windowWidth - this.data.windowWidth / 5);
        }
        this.setData({ "nav_scroll_left": nav_scroll_left });
      }
    }
    this.setData({ "current_index": this.current_index });
    this.refresh();
  },

  //自动调用分类_______________________________________________
  dataRendered: function (cate_id, index) {
    var that = this;
    that.setData({
      isshow: true,
      thetype: 'cart',
    })
    var nav_scroll_left = 0;
    this.cate_id = cate_id;
    if (this.cate_id == 1) {
      that.setData({
        show_menu: false,
        show_calendar: true,
        item: 200,
      });
      //调用分类
      this.nc_goodsCate(this.cate_id);
    }
    else if (this.cate_id == 17) {
      that.setData({
        show_calendar: true,
        show_menu: false,
        item: 200,
      });
      //调用分类
      this.nc_goodsCate(this.cate_id);
    }else if (this.cate_id == 2) {
      that.setData({
        show_calendar: false,
        show_menu: true,
        item: 0,
      })
    } else {
      that.setData({
        show_calendar: true,
        show_menu: true,
        item: 0,
      })
    }
    if (this.cate_id == 3) {
      that.setData({
        thetype: 'buy',
      })
    }
    //this.current_index = e.currentTarget.dataset.index;
    this.current_index = index;
    var nav_temp = 0;
    if (this.data.current_index == undefined || this.data.current_index < this.current_index) {
      if (this.data.cates.length - this.current_index >= 2 && this.current_index >= 2) {
        nav_scroll_left = parseInt((this.current_index - 2)) * this.data.windowWidth + this.data.windowWidth / 5;
        this.setData({ "nav_scroll_left": nav_scroll_left });
      }
    } else if (this.data.current_index > this.current_index) {
      if (this.data.cates.length - this.current_index > 3) {
        if (this.current_index > 1) {
          nav_scroll_left = -(parseInt((this.current_index - 2)) * this.data.windowWidth - this.data.windowWidth / 5);
        }
        this.setData({ "nav_scroll_left": nav_scroll_left });
      }
    }
    this.setData({ "current_index": this.current_index });
    this.refresh();
  },
  //初始化数据
  refresh: function () {
    this.loadding();
    this.setData({
      'goods': [],
      'is_over': 0,
      'no_data': 0,
      "scroll_Top": -Math.random()
    });
    this.page = 1;
    this.goodsList();
  },
  //点击切换
  location: function (e) {
    self = this;
    //this.loadding();
    wx.chooseLocation({
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var url = self.baseApiUrl + "/api/project/map";
        var data = { "latitude": latitude, "longitude": longitude };
        util.ajax({
          "url": url,
          "data": data,
          "success": function (data) {
            self.loaded();
            if (data.result == 'ok') {
              self.setData({ "address_info": data.ad_info.city });
              wx.setStorageSync('userMap', data.ad_info);
            }
          }
        })
      },
      fail: function (res) {
        //self.loaded();
      }
    },
    );
  },
  //地址查看
  sendLocaltion: function (latitude, longitude) {
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 28,
      success: function (e) {
      }
    })
  },

  bindRedirect: function (e) {
    var url = e.currentTarget.dataset.url;
    if (!url) return false;
    wx.redirectTo({
      "url": url,
    })
  },

  checkout: function () {
    // 将对象序列化
    var cartObjects = [];
    that.data.cartObjects.forEach(function (item, index) {
      var cart = {
        goods_id: item.food.id,
        goods_name: item.food.title,
        market_price: item.food.price,
        quantity: item.quantity,
        image_url: item.food.img,
        alone_price: item.food.aprice,
      };
      cartObjects.push(cart);
    });

    wx.navigateTo({
      url: '../orders/ncheckout?quantity=' + that.data.quantity + '&amount=' + that.data.amount + '&express_fee=' + that.data.seller.express_fee + '&carts=' + JSON.stringify(cartObjects)
    });
  },

  buyNow: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel: false
      })
      return;
    }
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();

    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },

  //搜索框相关
  wxSearchFn: function (e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);

    //搜索按钮点击相关事件
    this.search_title = that.data.wxSearchData.value;
    this.refresh();

  },
  wxSearchInput: function (e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
  },
  wxSerchFocus: function (e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function (e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function (e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function (e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },


  calendarChoose: function () {
    //  url: '../hotel-calendar/calendar?sid='+ e.currentTarget.id
    wx.navigateTo({
      url: '../calendar/calendar'
    })
  },
  GetDateStr: function (AddDayCount) {
    //获取日期的方法 今天 AddDayCount=0 明天AddDayCount=1
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期 
    var y = String(dd.getFullYear());
    var m = String(dd.getMonth() + 1);//获取当前月份的日期 
    m = m.length >= 2 ? m : "0" + m;
    var d = String(dd.getDate());
    d = d.length >= 2 ? d : "0" + d;
    return y + "-" + m + "-" + d;
  },
  GetDateDiff: function (startDate, endDate) {  //获取时间间隔
    var startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
    var endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
    var dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
    return dates;
  },
  reserveRoom: function (event) {
    //预定房间
    var item = event.currentTarget.dataset.item;
    //var meal = event.currentTarget.dataset.mealdata;
    this.setData({
      details_is_show: "",
    });
    wx.navigateTo({
      url: '../hotel/hotel?roomname=' + item["goods_name"] + '&mealname=' + "含双早" + '&checkintime=' + this.data.checkintime + '&leavetime=' + this.data.leavetime + '&paytype=' + "1" + '&price=' + item["market_price"] + '&daysnum=' + this.data.daysNum + '&mealid=' + '&roomid=' + item["goods_id"] + '&roomimage=' + item['image_url'] + ''
      //url: '../hotel-yuding/hotel-yuding?roomname=' + item["goods_name"] + '&mealname=' + "含双早" + '&checkintime=' + this.data.checkintime + '&leavetime=' + this.data.leavetime + '&paytype=' + "1" + '&price=' + item["market_price"] + '&daysnum=' + this.data.daysNum + '&mealid=' + '&roomid=' + item["goods_id"] + '&roomimage=' + item['image_url'] + ''
    })

  },

  //农产品详情页面
  foodDetail: function (event) {
    //预定房间
    var item = event.currentTarget.dataset.item;
    //var meal = event.currentTarget.dataset.mealdata;
    this.setData({
      details_is_show: "",
    });
    wx.navigateTo({
      url: '../goods/goods?goods_id=' + item["goods_id"]
    })

  },




  onReachBottom: function (e) {
    console.log("2323");
    this.page = this.page + 1;
    console.log(this.data.current_index);
    if (this.data.current_index == 0) {
      this.goodsList(1);

    }
    else {
      this.goodsList();
    }


  },
  pullUpLoad: function (e) {

  },
  goTop: function (e) {
    this.setData({
      "scroll_Top": -Math.random()
    });
  },
  scroll: function (e) {
    if (this.data.windowHeight < e.detail.scrollTop) {
      this.setData({ "goTopId": "bottom: 15%; opacity: 1;" });
    } else {
      this.setData({ "goTopId": "bottom: -15%; opacity: 0;" });
    }
  },
  onReady: function () {
    //wx.hideNavigationBarLoading();
    // 页面渲染完成
  },
  onShow: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight - 100,
          windowWidth: res.windowWidth
        })
      }
    })

    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        console.log(res);
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum,
        });
      }
    })

    //设置房间预订 日期选择相关
    // Do something when show.
    let checkintime = wx.getStorageSync("checkintime");
    let leavetime = wx.getStorageSync("leavetime");
    this.data.checkintime = this.GetDateStr(0);
    this.data.leavetime = this.GetDateStr(1);
    if (checkintime != undefined && checkintime != "" && leavetime != undefined && leavetime != "") {
      this.data.checkintime = checkintime;
      this.data.leavetime = leavetime;
    }

    this.data.daysNum = this.GetDateDiff(this.data.checkintime, this.data.leavetime)
    this.setData({
      daysNum: this.data.daysNum,
      checkintime: this.data.checkintime,
      leavetime: this.data.leavetime
    });
    //获取客房信息
    //_function.getRoomListData(0, 0, wx.getStorageSync("token"), this.initRoomListData, this)

    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
    this.refresh();
    this.bannerList();

  },
  error: function (data) {
    if (data.url == undefined) {
      data.url = '../index/index';
    }
    if (data['result'] == 'fail') {
      this.setData({
        error: data
      });
    } else {
      //console.log('接口获取数据错误！！！');
    }
    this.setData({ loaded: true });
  },
  onShareAppMessage: function () {
    var share_path = "/pages/index2/index2?tcindex=" + this.data.current_index + "&tcid=" + this.cate_id;
    return getApp().share({ title: "", desc: "", path: share_path });
    //return getApp().share({ title: "", desc: "", path: "/pages/index/index?tcindex=3&tcid=4" });
  },

  btnOrderDone: function (e) {

    // 加入购物车
    var self = this;
    self.setData({
      isshow: true,
    });
    var url = this.baseApiUrl + "Api/Weuser/orders?token=" + wx.getStorageSync('token');
    var data = {
      goods_id: that.data.goods[that.data.index].goods_id,
      quantity: that.data.buyNumber,
    };

    util.ajax({
      "url": url,
      "method": "POST",
      "data": data,
      "success": function (data) {
        if (data['result'] == "ok") {
          //服务端生成订单成功
          //  self.setData({
          //   "btn_order_done" : false
          // });
          //微信支付
          self.order_id = data.order_id;
         // util.wxpay(self);
          self.wxpay();
        } else if (data['result'] == "fail") {
          self.error(data);
        } else {
          var data = { "result": 'fail', "error_info": util.config('error_text')[0] };
          self.error(data);
        }
      }
    });
  },
  error: function (data) {
    if (data['result'] == 'fail') {
      this.setData({
        error: data
      });
    } else {
      //console.log('接口获取数据错误！！！');
    }
  },
  wxpay: function () {
    console.log(1);
    var self = this;
    var url = this.baseApiUrl + "Api/Weuser/wxpay/token/" + wx.getStorageSync('token')+ "/order_id/" + this.order_id;
    util.ajax({
      "url": url,
      "method": "GET",
      "success": function (data) {
        if (data['result'] == "ok") {
          wx.requestPayment({
            'timeStamp': data.param.timeStamp,
            'nonceStr': data.param.nonceStr,
            'package': data.param.package,
            'signType': 'MD5',
            'paySign': data.param.paySign,
            'success': function (res) {
              //console.log(res);
              self.setData({
                isshow: false,
              });
              wx.showModal({
                title: '支付成功',
                content: '支付完成是否确认订单',
                showCancel: false,
                success: function () {
                  wx.redirectTo({
                    url: '../../pages/order/index/index?type=4',
                  })
                },
                fail: function () {
                  wx.redirectTo({
                    url: '../../pages/cart/index/index',
                  })
                }
              })
            },
            'fail': function (res) {
              self.setData({
                isshow: false,
              });
              //console.log(res);
            },
            'complete':function(res)
            {
              console.log(res);
              if (res.errMsg=="requestPayment:fail cancel"){
              self.setData({
                isshow: false,
              });
              }

            }
          })
        } else if (data['result'] == "fail") {
          self.error(data);
        } else {
          var data = { "result": 'fail', "error_info": util.config('error_text')[0], "url": '../orders/orders' };
          self.error(data);
        };
      }
    });
  },
  calendarChoose: function () {
    //  url: '../hotel-calendar/calendar?sid='+ e.currentTarget.id
    wx.navigateTo({
      url: '../hotel-calendar/calendar'
    })
  },
  gotoOrder:function(e){
    console.log(e);
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../hotel-yuding/hotel-yuding?goods_id=' + e.currentTarget.id+'&image='+url,
    })
  },
  gotoDetail:function(e){
    console.log(e);
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../goods/detail/detail?goods_id=' + e.currentTarget.id+'&image='+url,
    })
  }


})