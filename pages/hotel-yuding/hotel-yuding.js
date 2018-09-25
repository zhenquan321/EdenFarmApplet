var util = require('../../utils/tools.js');
var WxParse = require('../../utils/wxParse/wxParse.js');
import config from '../../utils/config.js';
var baseApiUrl = config.getDomain;
//var WxAutoImage = require('../../WxAutoImage/WxAutoImage.js');
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    loaded: false,

    roomname: '',
    mealname: '',
    checkintime: '',
    leavetime: '',
    paytype: 1,
    price: 0,
    daysnum: 1,
    mealid: 0,
    roomid: 0,
    roomimage: '',

    "imageWidth": 0,
    "imageheight": 0
  },
  onLoad: function (options) {
    this.goods_id = options.goods_id;
    console.log(this.goods_id);
    this.setData({
      images_url: options.image,
    })
    /*  wx.showNavigationBarLoading();
    this.setData({
      roomname: options.roomname,
      mealname: options.mealname,
      checkintime: options.checkintime,
      leavetime: options.leavetime,
      paytype: options.paytype,
      price: options.price,
      daysnum: options.daysnum,
      mealid: options.mealid,
      roomid: options.roomid,
      roomimage: options.roomimage
    });
    this.baseApiUrl = util.config('baseApiUrl');
    this.data.roomname = options.roomname;
    this.data.mealname = options.mealname;
    this.data.checkintime = options.checkintime;
    this.data.leavetime = options.leavetime;
    this.data.paytype = options.paytype;
    this.data.price = options.price;
    this.data.daysnum = options.daysnum;
    this.data.mealid = options.mealid;
    this.data.roomid = options.roomid;
    this.data.roomimage = options.roomimage;
    */
    this.goodsDetail(this.goods_id);
    //this.doneOrderBanner();
    //console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
    
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
  //监听用户下拉动作
  onPullDownRefresh: function () {
    this.goodsDetail(this.goods_id);
  },
  goodsDetail: function (goods_id) {

    this.loadding();
    var url = baseApiUrl + "/Api/Goods/detail/goods_id/" + goods_id;
    var self = this;
    util.ajax({
      url: url,
      success: function (data) {
        self.loaded();
        if (data.result == 'ok') {
          self.setData({
            cate_id: data.goods.cate_id,
            goods: data.goods,
            gallery: data.goods.gallery,
            wxParseData: WxParse.wxParse('goods_desc', 'html', data.goods.goods_desc, self, 5)//WxParse('html',data.goods.goods_desc)
          });
          self.setData({ loaded: true });
        } else {
          self.error(data);
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
  error: function (data) {
    data.url = '../index/index';
    if (data['result'] == 'fail') {
      this.setData({
        error: data
      });
    } else {
      //console.log('接口获取数据错误！！！');
    }
  },
  calendarChoose: function () {
    //  url: '../hotel-calendar/calendar?sid='+ e.currentTarget.id
    wx.navigateTo({
      url: '../hotel-calendar/calendar'
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
  inputquantity: function (e) {
    this.setData({
      quantity: e.detail.value
    });
  },
  userNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    });
  },
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },


  buyNow: function () {
    var  that=this;
    var quantity = that.data.quantity;
    if (quantity == null || quantity == undefined || quantity == '') {
      getApp().showErrModal('人数不能为空');
      return;
    }

    var userName = that.data.userName;
    if (userName == null || userName == undefined || userName == '') {
      getApp().showErrModal('名字不能为空');
      return;
    }
    var phone = that.data.phone;
    if (phone == null || phone == undefined || phone == '') {
      getApp().showErrModal('手机号不能为空');
      return;
    }
    //组建立即购买信息
    wx.navigateTo({
      url: "/pages/order/hotelcheck/index?goods_id=" + that.data.goods.goods_id + "&quantity=" + quantity + '&userName=' + userName + '&phone=' + phone + "&url=" + that.data.images_url,
    })

  },

  onShareAppMessage: function () {
    return getApp().share({ title: this.data.goods.goods_name, desc: this.data.goods.goods_name, path: "pages/goods/goods?goods_id=" + this.goods_id });
  }
})