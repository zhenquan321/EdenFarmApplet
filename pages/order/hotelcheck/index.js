var util = require('../../../utils/tools.js');
var app = getApp(),
  wxRequest = app.requirejs('wxRequest');
var WxParse = app.requirejs('wxParse/wxParse');
import icons from '../../../utils/icons.js';
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;

Page({
  data: {
    "btn_order_done": false,
    "error": {
      "result": '',
      "error_info": ''
    },
    'order_tixinged': 0,
    icons: icons,
    paytype: 0,
    quantity: 1,
    items: [
      { name: '0', value: '微信', checked: 'true' },
    ]
    // text:"这是一个页面"
  },
  onLoad: function (options) {

    this.token = wx.getStorageSync('token');
    this.setData({
      goods_id: options.goods_id,
      quantity: options.quantity,
      userName: options.userName,
      url: options.url,
      phone: options.phone,
    })
    this.goodsDetail(options.goods_id);

    /* var cart = {};
     var shopCarInfoMem = wx.getStorageSync('BuyNowInfo');
     console.log(options);
     if (shopCarInfoMem && shopCarInfoMem.carts) {
       cart = shopCarInfoMem.carts;
       console.log('info')
       this.setData({
         cartinfo: cart,
       });
     }
     this.sell_type = 1;
     // 购物车获取参数
     console.log(options);
     this.carts = cart;
     this.quantity = parseInt(shopCarInfoMem.shopNum);
     this.express_fee = parseInt(options.express_fee);
     this.tamount = parseFloat(options.amount);
     this.ttotal = parseFloat(options.amount) + parseInt(options.express_fee);
     this.goods_id = options.goods_id;
     this.goodsDetail(this.goods_id);
     this.address_id = options.address_id;
     if (options.group_order_id != undefined) {
       this.group_order_id = options.group_order_id;
     }
 
     this.setData({
       sell_type: this.sell_type,
       goods_id: this.goods_id,
 
     });
 
     var self = this;
     setTimeout(function () {
       self.setData({ 'order_tixinged': 1 });
     }
       , 2500);
       */

    //console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
  },
  doneOrderBanner: function () {
    var url = baseApiUrl + "/Api/Project/shippingBanner";
    var self = this;
    util.ajax({
      url: url,
      success: function (data) {
        self.setData({ 'shippingBanner': data.shipping });
      }
    });
  },

  radioChange: function (e) {
    console.log(e);
    this.getCartsDetail(e.detail.value);
    this.setData({
      isshow: true,
      paytype: e.detail.value,
    })

  },
  order_tixinged: function (e) {
    this.setData({ 'order_tixinged': 1 });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
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
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  goodsDetail: function (goods_id) {
    var that = this;
    var data = {
      goods_id: goods_id,
      token: wx.getStorageSync('token'),
    }
    var url = baseApiUrl + "/api/Goods/detail";
    var getDetail = wxRequest.getRequest(url, data);
    getDetail.then(response => {

      if (response.data.result == 'ok') {
        var needpay_str = response.data.goods.market_price * that.data.quantity * that.data.daysNum;
        WxParse.wxParse('goods_desc', 'html', response.data.goods.goods_desc, that, 5)
        that.setData({
          cate_id: response.data.goods.cate_id,
          goods: response.data.goods,
          info: util.cutstr(util.removeHTML(response.data.goods.goods_desc), 40, 0),
          gallery: response.data.goods.gallery,
          needpay_str: needpay_str,
          isshow: false,
        });


      }
    })
  },
  btnOrderDone: function (e) {
    var self = this;
    if (this.data.btn_order_done) return true;
    var self = this;
    this.setData({
      isshow: true,
      "btn_order_done": true
    });

    var url = baseApiUrl + "/api/Weuser/orders_room/token/" + wx.getStorageSync('token');
    var data = {
      "goods_id": self.data.goods_id,
      "quantity": self.data.quantity,
      'start_date': self.data.checkintime,
      'end_date': self.data.leavetime,
      'book_days': self.data.daysNum,
      "book_name": self.data.userName,
      "book_phone": self.data.phone,
    };
    var orderpost = wxRequest.postRequest(url, data);
    orderpost.then(response => {
      if (response.data['result'] == "ok") {
        self.order_id = response.data.order_id;
        if (self.data.paytype == 1) {
          wx.showModal({
            title: "是否使用伊甸卡进行支付",
            success: function (res) {
              if (res.confirm) {
                self.yidianpay();
                // 用户点击了确定 可以调用删除方法了
              } else if (res.cancel) {
                self.setData({
                  isshow: false,
                  "btn_order_done": false
                });
                wx.redirectTo({
                  url: '../../../pages/order/index/index?type=0',
                })
              }

            },
            fail: function () {
              return;
            }

          });

        }
        else {
          self.wxpay();
        }
      }
      else if (data['result'] == "fail") {
        self.error(data);
      } else {
        var data = { "result": 'fail', "error_info": util.config('error_text')[0] };
        self.error(data);
      }
    })
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
  yidianpay: function () {
    var self = this;
    var url = baseApiUrl + "/Api/Weuser/yidianpay/token/" + this.token + "/order_id/" + this.order_id;

    var yidianoreder = wxRequest.getRequest(url);
    yidianoreder.then(response => {

      if (response.data['result'] == "ok") {
        this.setData({
          isshow: false,
        });
        wx.showModal({
          title: '支付成功',
          content: '支付完成是否确认订单',
          showCancel: false,
          success: function () {
            wx.redirectTo({
              url: '../../../pages/order/index/index?type=1',
            })
          },
          fail: function () {
            wx.redirectTo({
              url: '../../../pages/cart/index/index',
            })
          }
        })

      } else if (data['result'] == "fail") {
        self.error(data);
      } else {
        var data = { "result": 'fail', "error_info": util.config('error_text')[0], "url": '../orders/orders' };
        self.error(data);
      };
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


  wxpay: function () {
    var self = this;
    var url = baseApiUrl + "/Api/Weuser/wxpay/token/" + wx.getStorageSync('token') + "/order_id/" + this.order_id;
    var weixinoreder = wxRequest.getRequest(url);
    weixinoreder.then(response => {
      if (response.data['result'] == "ok") {
        wx.requestPayment({
          'timeStamp': response.data.param.timeStamp,
          'nonceStr': response.data.param.nonceStr,
          'package': response.data.param.package,
          'signType': 'MD5',
          'paySign': response.data.param.paySign,
          'success': function (res) {
            self.setData({
              isshow: false,
            });
            wx.showModal({
              title: '支付成功',
              content: '支付完成是否确认订单',
              showCancel: false,
              success: function () {
                wx.redirectTo({
                  url: '../../../pages/order/index/index?type=1',
                })
              },
              fail: function () {
                wx.redirectTo({
                  url: '../../../pages/cart/index/index',
                })
              }
            })
            //console.log(res);
          },
          'fail': function () {
            wx.redirectTo({
              url: '../../../pages/order/index/index?type=0',
            })
          }
        })
      }


      else if (data['result'] == "fail") {
        self.error(data);
      } else {
        var data = { "result": 'fail', "error_info": util.config('error_text')[0], "url": '../orders/orders' };
        self.error(data);
      };
    })
  },

  errorGo: function (e) {
    wx.redirectTo({
      url: "../index/index"
    })
  },
  onShareAppMessage: function () {
    return {
      title: '微信小商城',
      desc: '风靡全国的拼团商城，优质水果新鲜直供，快来一起拼好货吧',
      path: 'pages/index/index'
    }
  }
})