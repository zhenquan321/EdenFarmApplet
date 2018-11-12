// order.js
var app = getApp();
var wxRequest = app.requirejs('wxRequest');
import config from '../../../utils/config.js';
var baseApiUrl = config.getDomain;
var is_no_more = false;
var is_loading = false;
var p = 2;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 2,
    order_list: [],
    show_no_data_tip: false,
    shoptoken:'',
    hide: 1,
    qrcode: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      var shoptoken = wx.getStorageSync('shoptoken');
      that.setData({
        shoptoken:shoptoken
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
      if (options.status != undefined) {
        that.getOrder(options.status);
        this.setData({
          status: options.status
        });
      }
      else {
        that.getOrder(2);
      }
      
},

  getOrder:function(status){
    var that=this;
    var data={};
    if(status!=6){
      data = {
      token: that.data.shoptoken,
      order_status: status,
    }
    }
    else{
      data = {
        token: that.data.shoptoken,
      }
    }
    var url = baseApiUrl + "/api/admin/get_order";
    var order = wxRequest.getRequest(url, data);
    order.then(res=>{
     if(res.data.result==0){
       that.setData({
         order_list:res.data.con.con,
       })
     }
    console.log(res);



    })



  },


  loadOrderList: function (status) {
    if (status == undefined)
      status = -1;
    var page = this;
    page.setData({
      status: status,
    });
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.order.list,
      data: {
        status: page.data.status,
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            order_list: res.data.list,
          });
        }
        page.setData({
          show_no_data_tip: (page.data.order_list.length == 0),
        });
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },


  onReachBottom: function () {
    var page = this;
    if (is_loading || is_no_more)
      return;
    is_loading = true;
    app.request({
      url: api.order.list,
      data: {
        status: page.data.status,
        page: p,
      },
      success: function (res) {
        if (res.code == 0) {

          var order_list = page.data.order_list.concat(res.data.list);
          page.setData({
            order_list: order_list,
          });
          if (res.data.list.length == 0) {
            is_no_more = true;
          }
        }
        p++;
      },
      complete: function () {
        is_loading = false;
      }
    });
  },

  orderPay: function (e) {
    wx.showLoading({
      title: "正在提交",
      mask: true,
    });
    app.request({
      url: api.order.pay_data,
      data: {
        order_id: e.currentTarget.dataset.id,
        pay_type: "WECHAT_PAY",
      },
      complete: function () {
        wx.hideLoading();
      },
      success: function (res) {
        console.log(res);
        if (res.code == 0) {

          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success: function (e) {
              console.log("success");
              console.log(e);
            },
            fail: function (e) {
              console.log("fail");
              console.log(e);
            },
            complete: function (e) {
              console.log("complete");
              console.log(e);

              if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
                wx.showModal({
                  title: "提示",
                  content: "订单尚未支付",
                  showCancel: false,
                  confirmText: "确认",
                  success: function (res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: "/pages/order/order?status=0",
                      });
                    }
                  }
                });
                return;
              }


              wx.redirectTo({
                url: "/pages/order/order?status=1",
              });


            },
          });
        }
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            image: "/images/icon-warning.png",
          });
        }

      }
    });
  },

  orderRevoke: function (e) {
    var page = this;
    wx.showModal({
      title: "提示",
      content: "是否取消该订单？",
      cancelText: "否",
      confirmText: "是",
      success: function (res) {
        if (res.cancel)
          return true;
        if (res.confirm) {
          wx.showLoading({
            title: "操作中",
          });
          app.request({
            url: api.order.revoke,
            data: {
              order_id: e.currentTarget.dataset.id,
            },
            success: function (res) {
              wx.hideLoading();
              wx.showModal({
                title: "提示",
                content: res.msg,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    page.loadOrderList(page.data.status);
                  }
                }
              });
            }
          });
        }
      }
    });
  },

  orderConfirm: function (e) {
    var page = this;
    wx.showModal({
      title: "提示",
      content: "是否确认已收到货？",
      cancelText: "否",
      confirmText: "是",
      success: function (res) {
        if (res.cancel)
          return true;
        if (res.confirm) {
          wx.showLoading({
            title: "操作中",
          });
          app.request({
            url: api.order.confirm,
            data: {
              order_id: e.currentTarget.dataset.id,
            },
            success: function (res) {
              wx.hideLoading();
              wx.showToast({
                title: res.msg,
              });
              if (res.code == 0) {
                page.loadOrderList(3);
              }
            }
          });
        }
      }
    });
  },
  confirm: function (e) {
    var page = this;
    wx.showModal({
      title: "提示",
      content: "是否确认订单？",
      cancelText: "否",
      confirmText: "是",
      success: function (res) {
        if (res.cancel)
          return true;
        if (res.confirm) {
          wx.showLoading({
            title: "操作中",
          });
          let url= baseApiUrl + "/api/admin/confirm";
          let data = {
            order_id: e.currentTarget.dataset.id,
            token: wx.getStorageSync("shoptoken")
          };
          var confirm2 = wxRequest.getRequest(url, data);
          confirm2.then(res => {
              wx.hideLoading();
              wx.showToast({
                title: res.msg,
              });
              if (res.code == 0) {
                page.loadOrderList(2);
              }
          })
        }
      }
    });
  },

  
  orderQrcode:function (e) {
    var page = this;
    var order_list = page.data.order_list;
    var index = e.target.dataset.index;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    if (page.data.order_list[index].offline_qrcode) {
      page.setData({
        hide: 0,
        qrcode: page.data.order_list[index].offline_qrcode
      });
      wx.hideLoading();
    } else {
      app.request({
        url: api.order.get_qrcode,
        data: {
          order_no: order_list[index].order_no
        },
        success: function (res) {
          if (res.code == 0) {
            page.setData({
              hide: 0,
              qrcode: res.data.url
            });
          } else {
            wx.showModal({
              title: '提示',
              content: res.msg,
            })
          }
        },
        complete: function () {
          wx.hideLoading();
        }
      });
    }
  },
  hide:function (e) {
    this.setData({
      hide: 1
    });
  }

});