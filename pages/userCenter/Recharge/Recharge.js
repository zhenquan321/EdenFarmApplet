
var app = getApp(),
  wxRequest = app.requirejs('wxRequest');
var util = require('../../../utils/tools.js');
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icons: ["/static/images/imgNew/payIcon1.png", "/static/images/imgNew/beijing.png"],
    baseApiUrl:'',
    CardList:[],
    balance:'',
    sel_id:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("sadwadadw");
    this.getConfig();
    this.goodsList();
    console.log(options)
    this.setData({
        balance: options.balance
      }
    )
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function (opt) {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getConfig: function () {
    this.baseApiUrl = util.config('baseApiUrl');
    // this.size = util.config('page_size');
    // this.offset = util.config('page_offset');
    // this.page = 1;
  },
  /**
   * 获取会员卡
   */
  goodsList: function () {
    console.log("sadwadadw");
    var url = this.baseApiUrl + "Api/Goods/lists";
    var data={
      cate_id:3,
      offset:0,
      size:100,
      cid:17
    }
    util.ajax({
      "url": url,
      "data": data,
      "success":  (data)=>{
        var allData = '';
        var goods = data.goods;
        if (data.goods.length != 0) {
          for (var a = 0; a < goods.length; a++) {
            var imgList = [];
            var data0 = goods[a].goods_imgs || "a:3:{i:0;s:59:" + goods[a].image_url + ";}";
            var data1 = data0.split('{')[1]
            var data2 = data1.split('}')[0];
            var data3 = data2.split('http:');
            for (var b = 1; b < data3.length; b++) {
              var data4 = data3[b].split('.jpg')[0];
              var data5 = {
                "imgurl": 'http:' + data4 + '.jpg'
              }
              imgList.push(data5);
            }
            goods[a].imgList = imgList;
          }
          this.setData({
            CardList: goods,
            sel_id: goods[1].goods_id,
          });
          this.sel_id = goods[1].goods_id;
          console.log(goods);
        } else {
          self.setData({
            isshow: false,
            "is_over": 1,
            "no_data": 1
          });
        }
      
      }
    });
  },
  //首页分类选择
  selCard: function (e) {
    this.sel_id = e.currentTarget.dataset.goodsid;
    this.setData({
      sel_id: this.sel_id ,
    });
 
  },

  gotoDetail: function (e) {
    console.log(e);
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../../goods/detail/detail?goods_id=' + e.currentTarget.id + '&image=' + url,
    })
  },

  /**
	 * 组建立即购买信息
	 */
  btnOrderDone: function (e) {
    // 加入购物车
    var self = this;
    var url = baseApiUrl + "/Api/Weuser/orders?token=" + wx.getStorageSync('token');
    var data = {
      goods_id: this.sel_id,
      quantity: 1,
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

})