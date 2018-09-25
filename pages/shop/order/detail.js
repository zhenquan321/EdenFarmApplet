// pages/order-detail/order-detail.js
var app = getApp();
var wxRequest = app.requirejs('wxRequest');
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: null,
    getGoodsTotalPrice: function () {
      return this.data.order.total_price;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    var that = this;
    var shoptoken = wx.getStorageSync('shoptoken');
    that.setData({
      shoptoken: shoptoken
    })
    if (shoptoken == '') {
      wx.showModal({
        title: '未登录',
        content: '请登陆后重试',
      })
      setTimeout(function () {
        wx.redirectTo({
          url: '../index',
        })
      }, 1000);
    }

    this.options = options;
    console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id != undefined) {
      that.getOrderdetail(options.id);
    }
  
  },

  getOrderdetail: function (id) {
    var that = this;
    var data = {
      token: that.data.shoptoken,
      order_id: id,
    }
    var url = baseApiUrl + "/api/admin/get_order_edit";
    var order = wxRequest.getRequest(url, data);
    order.then(res => {
      if (res.data.result == 0) {
        that.setData({
          order: res.data.con,
        })
      }
      console.log(res);



    })



  },

  copyText: function (e) {
    var page = this;
    var text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({
          title: "已复制"
        });
      }
    });
  },
  location: function () {
    var page = this;
    var shop = page.data.order.shop;
    wx.openLocation({
      latitude: parseFloat(shop.latitude),
      longitude: parseFloat(shop.longitude),
      address: shop.address,
      name: shop.name
    })
  }

});