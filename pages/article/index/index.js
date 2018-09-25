var app = getApp();
var util = require('../../../utils/util.js');
var wxRequest = app.requirejs('wxRequest');
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;
Page({
  data: {
    postsList: [],
    postsShowSwiperList: [],
    isLastPage: false,
    page: 0,
    catid: 1,
    search: '',
    windowHeight: '',
    ishot: false,
    categories: 0,
    showerror: "none",
    showCategoryName: "",
    categoryName: "",
    showallDisplay: "block",
    displayHeader: "none",
    displaySwiper: "none",
    floatDisplay: "none",
    lastLoadTime: "",
    isloading: true,
    navbarArray: {},
    navbarShowIndexArray: Array.from(Array(4).keys()),
    navbarHideIndexArray: [],
    windowWidth: 375,
    scrollNavbarLeft: 0,
    currentChannelIndex: 0,
    startTouchs: {
      x: 0,
      y: 0
    },
    articlesHide: false,
    articleContent: '',
    loadingModalHide: false,
    temporaryArray: Array.from(new Array(9), (val, index) => index + 1)
  },

  onShareAppMessage: function () {
    return {
      title: '农场资讯',
      path: 'pages/article/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onReachBottom: function () {

  },
  onLoad: function (options) {
    var that = this;
    this.fetchcate();

    this.getArticles(0);

    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        });
      }
    });

  },
  onShow: function (options) {


  },


  //获取文章列表数据
  fetchPostsData: function () {
    var self = this;
    var url = baseApiUrl + "/api/Cms/get_news";
    var param = {
      catid: self.data.catid,
      size: 5,
      offset: self.data.page,
    };
    var getDetail = wxRequest.getRequest(url, param);
    getDetail.then(response => {
      if (response.statusCode == '200') {
      self.setData({
        floatDisplay: "block",
        postsList: self.data.postsList.concat(response.data.news.map(function (item) {
          return item;
        })),

      });
      }

    })



  },
  fetchcate: function () {
    var that = this;
    var url = baseApiUrl + "/api/Cms/get_news_cate";
    var getNavbar = wxRequest.getRequest(url);
    getNavbar.then(response => {
      console.log(response);
      if (response.statusCode == '200') {
        that.setData({
          navbarArray: response.data.cates,
        })
      }
    })

  },


  //加载分页
  loadMore: function (e) {
    var curTime = e.timeStamp;
    var lastTime = this.data.lastLoadTime;
    if (curTime - lastTime < 2000) {
      return;
    }
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1,
        isloading: false,
        lastLoadTime: curTime
      });
      this.fetchPostsData(self.data);
    }
    else {
      self.setData({
        isloading: true,
      });
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    var id = e.currentTarget.id,
      url = '../detail/index?aid=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //返回首页
  redictHome: function (e) {
    var id = e.currentTarget.dataset.id,
      url = '/pages/index/index';
    wx.switchTab({
      url: url
    });
  },
  // 导航栏
  onTapNavbar: function (e) {
    this.switchChannel(parseInt(e.currentTarget.id));

  },
  switchChannel: function (targetChannelIndex) {
    var cateid = this.data.navbarArray[targetChannelIndex].cate_id;
    let navbarArray = this.data.navbarArray;
    navbarArray.forEach((item, index, array) => {
      item.type = '';
      if (index === targetChannelIndex) {
        item.type = 'navbar-item-active';
      }
    });
    this.setData({
      navbarArray: navbarArray,
      currentChannelIndex: targetChannelIndex,
      page: 0,
      catid: cateid,
    });
    this.getArticles(targetChannelIndex);
  },
  getArticles: function (index) {
    this.setData({
      loadingModalHide: false,
      postsList: [],
    });
    this.fetchPostsData(this.data);
  },


  rpx2px: function (rpx) {
    return this.data.windowWidth * rpx / 750;
  },
  resetNavbar: function () {
    let navbarArray = this.data.navbarArray;
    navbarArray.forEach((item, index, array) => {
      item.type = '';
      if (0 === index) {
        item.type = 'navbar-item-active';
      }
    });
    this.setData({
      navbarArray: navbarArray,
      scrollNavbarLeft: 0
    });
  }
})
