//index.js
//获取应用实例
var app = getApp();
var WxParse = app.requirejs('wxParse/wxParse');
import icons from '../../../utils/icons.js';
var util = app.requirejs('util');
var wxRequest = app.requirejs('wxRequest');
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    pingcount: 0,
    isshow:true,
    icons:icons,
    hasMoreSelect: false,
    selectSize: "选择：",
    selectSizePrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 1,
    buyNumMin: 1,
    buyNumMax: 40,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    icons: ["/static/images/imgNew/kefu.png","/static/images/imgNew/gouwuce.png"]
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (options) {

    this.goods_id = options.goods_id;
    //  wx.showNavigationBarLoading();
    this.goodsDetail(options.goods_id);
    this.setData({
      image: options.image,
    })
    var that = this;
    wx.removeStorageSync('BuyNowInfo');
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        console.log(res);
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum,
          image: options.image,
        });
      }
    })

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
        WxParse.wxParse('goods_desc', 'html', response.data.goods.goods_desc, that, 5)
        that.setData({
          cate_id: response.data.goods.cate_id,
          goods: response.data.goods,
          info: util.cutstr(util.removeHTML(response.data.goods.goods_desc), 40, 0),
          gallery: response.data.goods.gallery,
          isshow:false,
        });


      }
    })
  },




  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/cart/index/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();

  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    var that=this;
    if (that.data.goods.price!=0)
    {
    this.setData({
      selectSizePrice: that.data.goods.price,
      hideShopPopup: false
    })
    }
    else{
      this.setData({
        selectSizePrice: that.data.goods.market_price,
        hideShopPopup: false
      })
    }
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    var that = this;
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      if (that.data.goods.price!=0)
      {
        var selectSizePrice = that.data.goods.price * currentNum;
      }
      else{
      var selectSizePrice = that.data.goods.market_price * currentNum;
      }
      this.setData({
        selectSizePrice: selectSizePrice.toFixed(2),
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
      if (that.data.goods.price != 0) {
        var selectSizePrice = that.data.goods.price * currentNum;
      }
      else {
        var selectSizePrice = that.data.goods.market_price * currentNum;
      }
      this.setData({
        selectSizePrice: selectSizePrice.toFixed(2),
        buyNumber: currentNum
      })
    }
  },

  /**
  * 加入购物车
  */
  addShopCar: function () {
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
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
  },
  buyNow: function () {
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }
    var BuyNowInfo = this.buliduBuyNowInfo();
    wx.setStorage({
      key: "BuyNowInfo",
      data: BuyNowInfo
    })
    this.closePopupTap();
    var amount=
    //组建立即购买信息
    wx.navigateTo({
      url: "/pages/order/buycheck/index"
    })

  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goods_id = this.data.goods.goods_id;
    shopCarMap.goods_name = this.data.goods.goods_name;
    shopCarMap.market_price = parseFloat(this.data.goods.market_price);
    shopCarMap.group_price = parseFloat(this.data.goods.price);
    shopCarMap.quantity = this.data.buyNumber;
    shopCarMap.image = this.data.image;
    shopCarMap.active=true;

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
	/**
	 * 组建立即购买信息
	 */
  btnOrderDone: function (e) {

    // 加入购物车
    var self = this;
    self.setData({
      isshow: true,
    });
    var url = baseApiUrl + "/Api/Weuser/orders?token=" + wx.getStorageSync('token');
    var data = {
      goods_id: self.data.goods.goods_id,
      quantity: self.data.buyNumber,
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
    var url = baseApiUrl + "/Api/Weuser/wxpay/token/" + wx.getStorageSync('token') + "/order_id/" + this.order_id;
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
            'complete': function (res) {
              console.log(res);
              if (res.errMsg == "requestPayment:fail cancel") {
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




  buliduBuyNowInfo: function () {
    var shopCarMap = {};
    shopCarMap.goods_id = this.data.goods.goods_id;
    shopCarMap.goods_name = this.data.goods.goods_name;
    shopCarMap.market_price = parseFloat(this.data.goods.market_price);
    shopCarMap.quantity = this.data.buyNumber;
    shopCarMap.image = this.data.image;
    shopCarMap.active=true;
    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = this.data.buyNumber;
    }
    if (!buyNowInfo.carts) {
      buyNowInfo.carts = [];
    }

    buyNowInfo.carts.push(shopCarMap);
    return buyNowInfo;
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + app.globalData.uid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})
