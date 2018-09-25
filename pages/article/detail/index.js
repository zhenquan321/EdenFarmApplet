var app = getApp();
var WxParse = app.requirejs('wxParse/wxParse');
var util = require('../../../utils/util.js');
var wxRequest = app.requirejs('wxRequest');
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: [],
    userInfo: [],
    aid: 0,
    page_index: 0,
    page_size: 5,
    new_reader: 0,
    loading_hidden: true,
    loading_msg: '加载中...',
    ladingshow: false,
    zhezhao: '',

  },




  previewImage: function (e) {
    var current = e.target.dataset.src
    var urls = e.target.dataset.image_list;
    wx.previewImage({
      current: current,
      urls: urls,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      aid: options.aid,
    })

    this.reloadIndex(options.aid);


  },

  reloadIndex: function (id) {
    var that = this;
    var url= baseApiUrl + '/api/Cms/get_news_detailed';
    var data = {
      id: id,
    }
    var getDetail = wxRequest.getRequest(url, data);
    getDetail.then(response => {
      that.setData({
        article: response.data.news,
      })
      // 富文本
      WxParse.wxParse('thread_data.message', 'html', response.data.news.content, that, 5);
    })
  },


  //返回首页
  redictHome: function (e) {
    //console.log('查看某类别下的文章');  
    var url = '/pages/index/index';

    wx.switchTab({
      url: url
    });
  },

  //跳转至某分类下的文章列表
  redictIndex: function (e) {
    //console.log('查看某类别下的文章');  
    console.log(this)
    var id = this.data.thread_data.fid;
    var url = '../list/list?categoryID=' + id;
    wx.navigateTo({
      url: url
    });
  },

  onShareAppMessage: function (res) {
    return {

      title: '"' + app.globalData.userInfo.nickName + '"邀请您阅读' + this.data.thread_data.subject,
      path: '/pages/detail/detail?aid=' + this.data.tid,
      success: function (res) {
        console.log(res);
      },
    }
  },
})