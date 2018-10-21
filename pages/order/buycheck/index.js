var app = getApp(),
  wxRequest = app.requirejs('wxRequest');
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
    isshow: true,
    items: [
      { name: '1', value: '伊甸卡' },
      { name: '0', value: '微信', checked: 'true' },
    ]
    // text:"这是一个页面"
  },
  onLoad: function (options) {

    this.token = wx.getStorageSync('token');
    var cart = {};
    var shopCarInfoMem = wx.getStorageSync('BuyNowInfo');
    if (shopCarInfoMem && shopCarInfoMem.carts) {
      cart = shopCarInfoMem.carts;

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

    //console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
  },
  doneOrderBanner: function () {
    var url = this.baseApiUrl + "Api/Project/shippingBanner";
    var self = this;
    util.ajax({
      url: url,
      success: function (data) {
        self.setData({ 'shippingBanner': data.shipping });
      }
    });
  },
  order_tixinged: function (e) {
    this.setData({ 'order_tixinged': 1 });
  },
  radioChange: function (e) {
    console.log(e);
    if (e.detail.value == 1) {
    }
    this.getCartsDetail(e.detail.value);
    this.setData({
      isshow: true,
      paytype: e.detail.value,
    })

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.address_id = undefined;
    this.address();


  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
   getCartsDetail: function (iscard) {
    var that = this;
    //获取每个商品对用户的价格--折扣卡的存在
    var url = baseApiUrl + "/Api/Weuser/carts_detail/token/" + this.token;
    var carts = [];
    var data = {
      "address_id": this.data.address.address_id,
      "carts": this.data.cartinfo,
      'quantity': this.quantity,
      "express_fee": this.express_fee,
      'amount': 19,
      'total':39,
      'type': iscard,
    };

    console.log(data);

    var carDetail = wxRequest.postRequest(url, data);
    carDetail.then(response => {
      if (response.data['result'] == "ok") {

        console.log(response);
        //获取商品的详细信息
        var noptions = response.data.data;
        //  console.log(noptions);
        that.carts_detail = noptions.carts;
        that.tamount = parseFloat(noptions.amount);
        that.tcardfee = parseFloat(noptions.card_fee);
        that.ttotal = parseFloat(noptions.amount) + parseInt(noptions.express_fee);
        that.tneedpay = parseFloat(noptions.need_pay) + parseInt(noptions.express_fee);
        that.setData({
          isshow: false,
          'carts': noptions.carts,
          'amount': parseFloat(noptions.amount),
          'amount_str': that.tamount.toFixed(2),
          'quantity': parseInt(noptions.quantity),
          'express_fee': parseInt(noptions.express_fee),
          'total': parseFloat(noptions.amount) + parseInt(that.express_fee),
          'total_str': that.ttotal.toFixed(2),
          'card_str': that.tcardfee.toFixed(2),
          'needpay_str': that.tneedpay.toFixed(2),
          'balance': noptions.balance,
        });
      }



    })

  },
  btnOrderDone: function (e) {
    if (!this.data.address) {
      wx.showToast({
        title: '请先添加地址 再提交订单!',
      })
      return false;
    }
    if (this.data.btn_order_done) return true;
    var self = this;
    this.setData({
      isshow: true,
      "btn_order_done": true
    });

    var url = baseApiUrl + "/Api/Weuser/orders_new/token/" + this.token;
    let table = wx.getStorageSync("InQuery").table||0;
    var data = {
      "address_id": this.data.address.address_id,
      "carts": this.carts_detail,
      "express_fee": this.express_fee,
      'amount': this.tamount,
      'total': this.ttotal,
      'need_pay': this.tneedpay,
      "address_id": this.address_id,
      "type": this.data.paytype,
      "table": table,
    };

    var orderpost = wxRequest.postRequest(url, data);
    orderpost.then(response => {
      if (response.data['result'] == "ok") {
        //服务端生成订单成功
        //  self.setData({
        //   "btn_order_done" : false
        // });
        //微信支付
        self.order_id = response.data.order_id;
        if (self.data.paytype == 1) {
          self.yidianpay();
        }
        else {
          self.setData({
            isshow: false,
            "btn_order_done": false
          });
          self.wxpay();
        }
      }
      else if (response.data['result'] == "fail") {
       wx.showModal({
         title: '提交失败',
         content: response.data['error_info'],
         success:function(res){
         self.setData({
           btn_order_done:false,
         })
         },
         fail:function(){
           self.setData({
             btn_order_done: false,
           })
         }

       })
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

        for (let i = 0; i < self.data.carts.length; i++) {
          let curItem = self.data.carts[i];
          if (curItem.active) {
            self.data.carts.splice(i, 1);
          }
        }
        var shopCarInfo = {};
        var tempNumber = 0;
        shopCarInfo.carts = self.data.carts;
        for (var i = 0; i < self.data.carts.length; i++) {
          tempNumber = tempNumber + self.data.carts[i].quantity
        }
        shopCarInfo.shopNum = tempNumber;
        wx.setStorage({
          key: "shopCarInfo",
          data: shopCarInfo
        })
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

      } else if (response.data['result'] == "fail") {
        wx.showModal({
          title: '提交失败',
          content: response.data['error_info'],
        })
        self.setData({
          btn_order_done:false,
        })
       
      } else {
        var data = { "result": 'fail', "error_info": util.config('error_text')[0], "url": '../orders/orders' };
        self.error(data);
      };
    })




  },
  wxpay: function () {
    var self = this;
    var url = baseApiUrl + "/Api/Weuser/wxpay/token/" + this.token + "/order_id/" + this.order_id;
    var weixinoreder = wxRequest.getRequest(url);
    weixinoreder.then(response => {
      if (response.data['result'] == "ok") {
        for (let i = 0; i < self.data.carts.length; i++) {
          let curItem = self.data.carts[i];
          if (curItem.active) {
            self.data.carts.splice(i, 1);
          }
        }
        var shopCarInfo = {};
        var tempNumber = 0;
        shopCarInfo.carts = self.data.carts;
        for (var i = 0; i < self.data.carts.length; i++) {
          tempNumber = tempNumber + self.data.carts[i].quantity
        }
        shopCarInfo.shopNum = tempNumber;
        wx.setStorage({
          key: "shopCarInfo",
          data: shopCarInfo
        });
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

  address: function () {

    var self = this;
    var pra = '';
    if (this.address_id != undefined) {
      var pra = "&address_id=" + this.address_id;
    }
    var url = baseApiUrl + "/Api/Weuser/addresses/token/" + this.token + pra;
    var address = wxRequest.getRequest(url);
    address.then(response => {
      console.log(response);
      if (response.data['result'] == "ok") {
        //    self.setData({ loaded: true });
        if (response.data.address_list.length > 0) {
          var address = self.addressSort(response.data.address_list, self.address_id);
          self.setData({
            "address": address
          });
        }
        else {
          wx.showModal({
            title: '未设置收货地址',
            content: '设置正确收货地址才能进行购物',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/addresses/addresses',
                })
              }
              else {
                var pages = getCurrentPages();
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })

        }
        if (address) {
          self.address_id = address.address_id;
          self.express_fee = address.express_fee;
          self.getCartsDetail();
        }
      } else {
        self.error(data);
      }

    })

  },
  addressSort: function (list, address_id) {
    var address;
    if (list.length == 1) {
      return list[0];
    }
    if (list.length <= 0) {
      return null;
    }

    for (var i in list) {
      if (undefined != address_id) {
        if (list[i]['address_id'] == address_id) {
          address = list[i];
        }
      } else if (list[i]['status'] == "DEFAULT") {
        address = list[i];
      } else if (i >= list.length - 1) {
        address = list[0];
      }
    }
    return address;
  },

  errorGo: function (e) {
    wx.redirectTo({
      url: "../index/index"
    })
  },


})

