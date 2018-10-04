var app = getApp(),
  wxRequest = app.requirejs('wxRequest');
import icons from '../../utils/icons.js';
import config from '../../utils/config.js';
var baseApiUrl = config.getDomain;
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    icons: icons,
    interval: 3000,
    duration: 1000,
    loadingHidden: false,
    List: [],
    swiperCurrent: 0,
    selectCurrent: 0,
    hotgoods: [],
    goods: [],
    scrollTop: "0",
    loadingMoreHidden: true,
    nav: [
      {
        url: '../../pages/article/index/index',
        icon: '/static/images/imgNew/icon1.png',
        navname: '走进伊甸',
        _index: 1,
        cate_id: 1,
      },
    ],
    nav1: [
      {
        url: '/pages/categories/categories',
        icon: '/static/images/imgNew/icon4.png',
        navname: '伊甸食材',
        _index: 0,
        cate_id: 1,
      },
      {
        url: '/pages/categories/categories',
        icon: '/static/images/imgNew/icon3.png',
        navname: '伊甸客房',
        _index: 3,
        cate_id: 2,
      },
      {
        url: '/pages/categories/categories',
        icon: '/static/images/imgNew/icon2.png',
        navname: '伊甸套餐',
        _index: 1,
        cate_id: 17,
      },

    ],
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  scroll: function (e) {
    //  console.log(e) ;
    var that = this, scrollTop = that.data.scrollTop;
    that.setData({
      scrollTop: e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: '伊甸农场'
    })
    that.getsyList();


  },

  imagesHeight: function (t) {
    var a = t.detail.width, e = t.detail.height, i = t.target.dataset.type, s = this;
    wx.getSystemInfo({
      success: function (t) {
        s.setData({
          bannerheight: t.windowWidth / a * e
        });
      }
    });
  },

  getsyList: function () {
    var that = this;
    var url = baseApiUrl + '/api/GoodsCate/syList';
    var getLists = wxRequest.getRequest(url);
    getLists.then(response => {
      if (response.statusCode == 200 && response.data.result == "ok") {
        that.setData({
          banner: response.data.banner,
          List: response.data.list,
        })
      }
      else {
        wx.showToast({
          title: "加载失败",
          duration: 1500
        })


      }

    }).then(response => {
      var data = {
        is_new: 1,
        sort: 0,
        size:10,
      }
      var newUrl = baseApiUrl + '/api/Goods/lists';
      var getNewList = wxRequest.getRequest(newUrl, data);
      getNewList.then(response => {
        if (response.statusCode == 200 && response.data.result == "ok") {
          that.setData({
            newgoods: response.data.goods
          })
        }
        else {
          wx.showToast({
            title: "加载最新失败",
            duration: 1500
          })
        }

      })

    }).then(response => {
      that.getHotList(0, 3)
    })



  },


  getHotList: function (sort, size) {
    var that =this;
    var hotdata = {
      is_recommend: 0,
      sort: sort,
      size: size,
    }
    var hotUrl = baseApiUrl + '/api/Goods/lists';
    var gethotList = wxRequest.getRequest(hotUrl, hotdata);
    gethotList.then(response => {
      if (response.statusCode == 200 && response.data.result == "ok") {
        that.setData({
          goods: response.data.goods
        })
      }
      else {
        wx.showToast({
          title: "加载热门失败",
          duration: 1500
        })
      }



    })

  },


  sort: function (e) {

    console.log(e);
    var that = this;
    var data = {}
    if (e.currentTarget.dataset.sort == "count") {

      that.getHotList(0, 1);
    }
    else if (e.currentTarget.dataset.sort == "price") {

      that.getHotList(2, 5);
    }
    else {
      data = {
        is_recommend: 1,
      }
      that.getHotList(data);
    }


  },


  onShareAppMessage: function () {
    return getApp().share({title:'',desc:'',path:''});
  },

  //打开分类页
  toCategory: function (event) {
    var catid = event.currentTarget.dataset.catid;
    var indexz = event.currentTarget.dataset.indexz;
    console.log(catid, indexz);
    app.globalData.catid = catid;//设置全局变量(app已经定义 var app=getApp())
    app.globalData.indexz = catid == 2 ? 4:indexz;//设置全局变量(app已经定义 var app=getApp())
    console.log(app.globalData.indexz);
    wx.switchTab({
      url: '../categories/categories'
    });
  },
})
