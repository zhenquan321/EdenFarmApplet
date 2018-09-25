//app.js
import config from 'utils/config.js';
var tools = require('utils/tools.js')
var baseApiUrl = config.getDomain;
var wxApi = require('utils/wxApi.js')
var wxRequest = require('utils/wxRequest.js')
App({
  onLaunch: function () {
    wx.removeStorageSync('token')
    if (!wx.getStorageSync('token')) {
      this.login(this);
      //this.goLogin();
    }

  },
  share: function (obj) {
    var token = wx.getStorageSync('token');
    var url = baseApiUrl + "/Api/Weuser/share/token/" + token;
    var share_text = tools.config('share_text');
    console.log(share_text);
    return {
      title: obj.title || share_text.title,
      desc: obj.desc || share_text.desc,
      path: obj.path || share_text.path,
      complete: function ($data) {
        if ($data.errMsg == "shareAppMessage:cancel") {
          util.ajax({
            url: url,
            data: { 'share_type': '分享给好友', 'share_status': 0, 'share_url': obj.path || share_text.path },
            method: "POST",
            success: function (e) {
            }
          });
        } else if ($data.errMsg == "shareAppMessage:ok") {
          util.ajax({
            url: url,
            data: { 'share_type': '分享给好友', 'share_status': 1, 'share_url': obj.path || share_text.path },
            method: "POST",
            success: function (e) {
            }
          });
        }
      }
    }
  },
  goLogin() {
    wx.redirectTo({ url: '/pages/login/index' })
  },
  login: function (self = '', istoken = '') {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          var url = baseApiUrl + "/api/WeApp/login/code/" + res.code;
          var getPostsRequest = wxRequest.getRequest(url);
          getPostsRequest.then(response => {
            if (response.data.result == "ok") {
              var token = response.data.token;
              wx.setStorageSync('token', token);
              that.getUserInfo(self, token);
            }
          })
        }
      },
      fail: function () {
        console.log('获取用户登录态失败！' + res.errMsg)

      }

    });
  },
  showErrModal: function (err_msg) {
    wx.showModal({
      content: err_msg,
      showCancel: false
    });
  },
  getUserInfo: function (self, token) {
    var url = baseApiUrl + "/api/WeApp/login/token/" + token;
    var data = [];
    //获取微信信息
    wx.getUserInfo({
      success: function (res) {
        var putuserinfo = wxRequest.putRequest(url, res);
        putuserinfo.then(response => {
        wx.showToast({
          title:'欢迎回来,'+res.userInfo.nickName,
          duration: 1000,
        })
        })
      },
      fail: function (res) {

      }
    })
  },

  requirejs: function (e) {
    return require("utils/" + e + ".js")
  },
  globalData: {
    userInfo: null
  }
})