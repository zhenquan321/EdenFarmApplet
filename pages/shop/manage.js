var app = getApp();
import config from '../../utils/config.js';
var baseApiUrl = config.getDomain;
var wxRequest = app.requirejs('wxRequest');

// pages/shop/manage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatisticsData:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getStatistics();
  
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
  onUnload: function () {
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
    //获取用户信息
  getStatistics: function (e) {
    var page = this;
    let url = baseApiUrl + "/api/Order/statistics";
    let data = {
      token: wx.getStorageSync("shoptoken")
    };
    var confirm2 = wxRequest.getRequest(url, data);
    confirm2.then(res => {
      console.log(res.data.content);
      this.setData({
        StatisticsData: res.data.content,
      })
    })
  },
})