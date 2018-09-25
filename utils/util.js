
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDiff(startData, endData) {
}

/* 毫秒级倒计时 */
function countdown(that, total_micro_second) {
  // 渲染倒计时时钟
  that.setData({
    clock: dateformat(total_micro_second)
  });

  if (total_micro_second <= 0 || isNaN(total_micro_second)) {
    that.setData({
      clock: [0, 0, 0].map(formatNumber)
    });
    // timeout则跳出递归
    return;
  }
  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 60;
    countdown(that, total_micro_second);
  }
    , 60)
}

// 时间格式化输出，如3:25:19 86。每10ms都会调用一次
function dateformat(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = Math.floor((second - hr * 3600) / 60);

  // 秒位
  var sec = (second - hr * 3600 - min * 60);// equal to => var sec = second % 60;

  // 毫秒位，保留2位
  var micro_sec = Math.floor((micro_second % 1000) / 10);

  return [hr, min, sec].map(formatNumber);
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


function ajax(obj) {

  var endtime = undefined;

  var retrunType = {
    'json': "Content-Type': 'application/json",
  };
  if (undefined == obj.retrunType) {
    obj.retrunType = 'json';
  }
  var returnType = obj.retrunType;

  var starttime = new Date().getTime();


  wx.request({
    url: obj.url,
    data: obj.data || [],
    method: obj.method || "GET",
    header: {
      returnType
    },
    success: function (data) {
      endtime = new Date().getTime();
      console.warn('Info : ' + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");
      if (data.statusCode == 200) {
        var data_core = data.data;
        if (config('appDebug')) {
          console.log(data_core);
        }
        if (data_core.result != undefined) {
          if (data_core.result == "fail") {
            var page = getCurrentPages();
            if (data_core.error_code == "40001") {
              wx.removeStorageSync('token');
              getApp().login();
              setTimeout(function () {
                page[(page.length - 1)].onLoad(page[(page.length - 1)].options);
              }, 3000)
            } else {
              wx.showToast({
                title: data_core.error_info,
              })
              //    page[0].error(data_core);
            }
            return false;
          }
        }
        obj.success(data_core);
      } else {
        console.error("Mes : " + "_状态码: " + data.statusCode + ' ERR: Args : ' + JSON.stringify(obj.data) + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");
      }
    },
    error: function ($data) {
      endtime = new Date().getTime();
      console.error('ERR: Args : ' + JSON.stringify(obj.data) + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");
      obj.error($data);
    },
    complete: function ($data) {
      if ($data.errMsg == "request:fail") {
        var info = { 'result': 'fail', 'error_info': config('error_text')[0] };
        if (typeof obj.error == "function") {
          obj.error(info);
        } else {
          var page = getCurrentPages();
          page[0].error(info);
        }
      }
    }
  })
}

function config(name) {
  var obj = require('../config')
  if (name) {
    return obj.config()[name];
  } else {
    return obj.config();
  }

}

function wxpay(self) {
  var url = self.baseApiUrl + "Api/Weuser/wxpay";
  var data = {
    "token": self.token,
    "order_id": self.order_id
  };

  var order_id = self.order_id;

  ajax({
    "url": url,
    "method": "GET",
    "data": data,
    "success": function (data) {
      if (data['result'] == "ok") {
        wx.requestPayment({
          'timeStamp': data.param.timeStamp,
          'nonceStr': data.param.nonceStr,
          'package': data.param.package,
          'signType': 'MD5',
          'paySign': data.param.paySign,
          'success': function (res) {
            wx.redirectTo({
              'url': '../orders/order?id=' + order_id
            });
          },
          'fail': function ($data) {
            if ($data.errMsg == "requestPayment:fail cancel") {
              self.error({ "result": 'fail', "error_info": '您选择取消付款', "url": '../orders/orders' });
            } else {
              self.error({ "result": 'fail', "error_info": $data.errMsg, "url": '../orders/orders' });
            }
          }
        })
      } else if (data['result'] == "fail") {
        self.error(data);
      } else {
        var data = { "result": 'fail', "error_info": '支付异常,请联系客服完成订单。', "url": '../orders/orders' };
        self.error(data);
      }
    }
  });
}

function wxlogin(that) {
  if (wx.getStorageSync('token')) {
    return true;
  }
  console.log("auto login");
  if (that.__route__ == "pages/personal/personal") return false;
  wx.login({
    success: function (res) {
      if (res.code) {
        var url = config('baseApiUrl') + "api/WeApp/login/code/" + res.code;
        ajax({
          "url": url,
          "method": "GET",
          "success": function (data) {
            var token = data.token;
            var value = wx.getStorageSync('token')
            while (!value) wx.setStorageSync('token', token);
            if (typeof (that.refresh) == "function") {
              that.refresh();
            } else {
              that.error({ "result": "fail", "error_info": "登录已经过期,请重新登录。", "url": "../personal/personal" });
            }

          }
        })
      }
    }
  });
}

function cutstr(str, len, flag) {
  var str_length = 0;
  var str_len = 0;
  var str_cut = new String();
  var str_len = str.length;
  for (var i = 0; i < str_len; i++) {
    var a = str.charAt(i);
    str_length++;
    if (escape(a).length > 4) {
      //中文字符的长度经编码之后大于4  
      str_length++;
    }
    str_cut = str_cut.concat(a);
    if (str_length >= len) {
      if (flag == 0) {
        str_cut = str_cut.concat("...");

      }

      return str_cut;
    }

  }
  //如果给定字符串小于指定长度，则返回源字符串；  
  if (str_length < len) {
    return str;
  }
}

function removeHTML(s) {
  var str = s.replace(/<\/?.+?>/g, "");
  return str.replace(/ /g, "");
}

//util.js 
function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.detail.width;//图片原始宽 
  var originalHeight = e.detail.height;//图片原始高 
  var originalScale = originalHeight / originalWidth;//图片高宽比 
  console.log('originalWidth: ' + originalWidth)
  console.log('originalHeight: ' + originalHeight)
  //获取屏幕宽高 
  wx.getSystemInfo({
    success: function (res) {
      var windowWidth = res.windowWidth;
      var windowHeight = res.windowHeight;
      var windowscale = windowHeight / windowWidth;//屏幕高宽比 
      console.log('windowWidth: ' + windowWidth)
      console.log('windowHeight: ' + windowHeight)
      if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比 
        //图片缩放后的宽为屏幕宽 
        imageSize.imageWidth = windowWidth;
        imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
      } else {//图片高宽比大于屏幕高宽比 
        //图片缩放后的高为屏幕高 
        imageSize.imageHeight = windowHeight;
        imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
      }

    }
  })
  console.log('缩放后的宽: ' + imageSize.imageWidth)
  console.log('缩放后的高: ' + imageSize.imageHeight)
  return imageSize;
}

module.exports = {
  formatTime: formatTime,
  ajax: ajax,
  cutstr: cutstr,
  removeHTML: removeHTML,
  config: config,
  formatDiff: formatDiff,
  countdown: countdown,
  wxpay: wxpay,
  wxlogin: wxlogin,
  imageUtil: imageUtil
}
