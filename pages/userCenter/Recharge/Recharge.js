
var app = getApp(),
  wxRequest = app.requirejs('wxRequest');
var util = require('../../../utils/tools.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icons: ["/static/images/imgNew/payIcon1.png", "/static/images/imgNew/beijing.png"],
    baseApiUrl:'',
    CardList:[],
    balance:''
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
          });
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
})