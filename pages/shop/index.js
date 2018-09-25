//获取应用实例
var app = getApp();
var wxRequest = app.requirejs('wxRequest');
import config from '../../utils/config.js';
var baseApiUrl = config.getDomain;
Page({

  data: {
    username: '',
    password: '',
    mobileerr: ''
  },


  textinput:function(e){
    this.setData({
      username: e.detail.value,
    });
  },
  password: function (e) {
    this.setData({
      password: e.detail.value,
    });
  },

  submit: function () {
    var that=this;
    if (!that.data.username || !that.data.password) {
      wx.showToast({
        icon:'none',
        title: '请输入账号和密码!',
      })
    } else {
      var data = {
        username: that.data.username,
        password: that.data.password,
      }
      var url = baseApiUrl + "/api/admin/login";
      var login = wxRequest.getRequest(url, data);
      login.then(response=>{
        console.log(response);
        
        if (response.data.result==0)
        {
          wx.setStorageSync('shoptoken', response.data.con.token);
          wx.showToast({
            title: '登录成功',
          })
        setTimeout(function () {
          wx.redirectTo({
            url: './manage',
          })
        }, 1000);
        }
        else{
          wx.showToast({
            title: '账户或者密码错误！',
          })
        }
      })
      
      
     


/** 
      wxb.Post('/api/hotel.manage/mangelogin', {
        mobile: wxb.that.data.mobile,
        password: wxb.that.data.password
      }, function (data) {
        //console.log(data);
        wxb.setStoreCode(data.code);
        wx.showToast({
          title: '登录成功',
        })
        setTimeout(function () {
          var page = getCurrentPages();
          wx.navigateBack({ delta: page.length - 2 });
        }, 1000);
      });
      */
    }
    
  },

  onLoad: function (options) {

  }
}) 