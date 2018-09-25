var util = require('../../../utils/tools.js')
Page({
  data:{
      "URL" : 3,
      "is_over" : false,
      "no_order" : false,
      "modalHidden" : true,
      "expressOpen" : 0,
      "modalHidden1" : true,
      "express" : {
        'error' : false,
        'info' : '',
        'load' : true
      }
    // text:"这是一个页面"
  },
  onLoad:function(options) {
    this.options = options;
    // 页面初始化 options为页面跳转所带来的参数
    if(options.type && options.type != undefined) {
       var all_status = options.type == "0" ? 0 : 1;
       this.setData({"all_status" : all_status});
       this.order_status = all_status; 
    }
    this.getConfig();
    var orders = this.getData();//token,this.offset,this.size
  },

  //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.config('baseApiUrl'); 
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.token = token;
     this.page = 1;
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow: function( e ) {
    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  pullDown: function( e ) {
    this.page = this.page + 1;
    this.getData();
  },
  pullUpLoad: function(e) {
  },
  getData:function() {
    if(this.data.no_order == 1) return false;
    var offset = (this.page - 1) * this.size;
    var order_status = this.order_status;
    var size = this.size;
    var token = this.token;

    var url = this.baseApiUrl + "Api/Weuser/order/offset/"+offset+"/size/"+size+"/token/"+token;    
    if(order_status != undefined) {
      url = url + '/order_status/' + order_status;
    }
    var self = this;
     util.ajax({
        url : url,
        method : "GET",
        success : function(data){
            self.loaded();
            if(data.result == 'ok') {
              var order_list = data.order_list; 
              var order_status = util.config('order_status');
              var orders =  order_list.map(function (order) {
                    order.pay_time = util.formatTime(new Date(order.pay_time * 1000));
                    order.order_time = util.formatTime(new Date(order.order_time * 1000));
                    order.order_status_lang = order_status[order.order_status];
                    return order;
                });

              var allData = '';
              var agoData = self.data.orders;

              if(orders.length != 0) {
                  if(orders.length < self.size) {
                    self.setData({
                      "is_over" : 1,
                      "no_order" : 1
                    });
                  }
                 if(agoData) {
                      allData = agoData;
                      orders.map(function(order) {
                        allData.push(order);
                      });
                 } else {
                   allData = orders;
                 }
                self.setData({
                  "orders" : allData
                });

                
              }  else {
                self.setData({
                  "is_over" : 1,
                  "no_order" : 1
                });
              }               
            } else {
               self.error(data);
               return false;
            }
        }
     });
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  statusChange:function(e){
    this.setData({
      'orders' : [],
      'is_over' : 0,
      'no_order' : 0,
      "all_status" : e.currentTarget.dataset.all_status
    });
    this.order_status = e.currentTarget.dataset.all_status == '3' ? undefined : e.currentTarget.dataset.all_status;
    this.page = 1;
    this.getData();
  },
  orderBuy:function(e) {
    this.order_id = e.currentTarget.dataset.order_id;
    util.wxpay(this);
    this.order_id = false;
  },
  //取消訂單
  orderCancel:function(e) {
    this.order_id = e.currentTarget.dataset.order_id;
    this.setData({
      'modalHidden' : false,
      'titleModel' : '确定“取消订单”吗？'
    });

  },
  loadding:function() {
    this.setData({loaded:false});
 },
 loaded : function() {
    this.setData({loaded:true});
 },
 error:function(data) {
    //如果是 查询物流信息出错 不显示弹窗
    if(data.error_code == '41001') {
        this.setData({
          'express' : {
          "loading" : false,"error" : 1,"info" : util.config('error_text')[8]}
        });
        return true;
    }
    
    if(data['result'] == 'fail') {
      this.setData({
        error : data
      });
    } else {
      // console.log('接口获取数据错误！！！');
    }
  },
  modalConfirm:function(e) {
    console.log('1');
    if(e.target.dataset.callback != undefined && e.target.dataset.callback) {
      return this.orderReceiveFun();
    }

    var self = this;
    if(this.order_id == undefined) {
       self.setData({
        'modalHidden' : true
      });
      return false;
    }

   
    var token = this.token;
    var url = this.baseApiUrl + "Api/Weuser/cancelOrder";   
    
    var data = {
      token:	token,
      order_id:	this.order_id
    };
    this.loadding();
    util.ajax({
        "url" :  url,
        "method" :　"GET",
        "data" : data,
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.setData({
                'modalHidden' : true
              });
              self.loaded();
              self.refresh();
            } else {
               self.error(data);
            }  
        }
      });
    this.order_id = undefined;
  },
  modalCancel:function(e) {
     this.setData({
      'modalHidden' : true
    });
    this.order_id = undefined;
  },
  //初始化数据
  refresh:function() {
     this.setData({
      'orders' : [],
      'is_over' : 0,
      'no_order' : 0
    });
    this.page = 1;
    this.getData();
    this.order_id = undefined;
  },  
  onShareAppMessage: function () {
    var share_text = util.config('share_text');
    return {
      title : share_text.title,
      desc  : share_text.desc,
      path: 'pages/index/index'
    }
  },
  close_express: function () {
     this.setData( {
        'expressOpen' : 0,
        'shipping_info' : {},
        'express' : {"loading" : false}
     });
  }   
  ,
  expressShow : function(e) {
    this.setData({"expressOpen" : 1,'express' : {loading : true}});
    var order_id = e.currentTarget.dataset.order_id;
    
    var token = this.token;
    var url = this.baseApiUrl + "Api/Project/express/order_id/" +　order_id;   
    var self = this;
    util.ajax({
        "url" :  url,
        "method" :　"GET",
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.setData({
                'express' : {loading : false},
                "shipping_info" : data.shipping
                });
            } else {
                 
            }  
        }
      });
  },
  orderReceive : function(e) {
      this.setData({
        'modalHidden' : false,
        'callback' : '1',
         'titleModel' : '确定“确认收货”吗？'
      });

    this.order_id = e.currentTarget.dataset.order_id;
    
  },
  orderReceiveFun : function() {
    console.log(1);
    var order_id = this.order_id;
    var token = this.token;
    var url = this.baseApiUrl + "Api/Weuser/receivedOrder/token/" + token + "/order_id/" +　order_id;   
    var self = this;
    var data = {
    };
    
    this.loadding();
    util.ajax({
        "url" :  url,
        "method" :　"POST",
        "data" : data,
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.setData({
                'modalHidden' : true
              });
              self.loaded();
              self.refresh();
            } else {
              self.error(data);
            }  
        }
      });
  }
})