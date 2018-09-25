
const conf = {
  data: {
    hasEmptyGrid: false,
    hasEmptyGrid1: false,
    hasEmptyGrid2: false,
    checkintime: "",
    leavetime: "",
    stopIndex: "",
    startIndex: ""
  },
  getSystemInfo() {
    try {
      const res = wx.getSystemInfoSync();
      this.setData({
        scrollViewHeight: res.windowHeight * res.pixelRatio || 667
      });
    } catch (e) {
      // console.log(e);
    }
  },
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  onLoad(options) {

    options.checkintime = "11111";
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    //进入默认选中今天入住明天离店
    if (wx.getStorageSync("stopIndex") != undefined && wx.getStorageSync("stopIndex") != "") {
      this.data.checkintime = wx.getStorageSync("checkintime");
      this.data.leavetime = wx.getStorageSync("leavetime");
      this.setData({
        startIndex: wx.getStorageSync("startIndex"),
        stopIndex: wx.getStorageSync("stopIndex")
      })
    }
    else {
      const cur_date = new Date();
      //当年  当月
      let cur_Year = cur_date.getFullYear();
      let cur_Month = cur_date.getMonth() + 1;
      let cur_Day = cur_date.getDate();
      const thisMonthDays = this.getThisMonthDays(cur_Year, cur_Month);

      //默认入住和离店时间是 当日 和次日

      this.data.checkintime = this.GetDateStr(0);
      this.data.leavetime = this.GetDateStr(1);
      //如果当天是一个月的最后一天
      if (cur_Day == thisMonthDays) {
        this.setData({
          startIndex: cur_Day - 1,
          stopIndex: 100
        })
      }
      else {
        this.setData({
          startIndex: cur_Day - 1,
          stopIndex: cur_Day
        })
      }

    }

    //

    this.curCalendar();
    this.nextCalendar();
    this.next_two_Calendar();
    this.getSystemInfo();
    const date = new Date();
    this.setData({
      weeks_ch
    })
  },
  curCalendar() {
    //当前月
    const date = new Date();
    let newYear = date.getFullYear();
    let newMonth = date.getMonth() + 1;
    if (newMonth > 12) {
      newYear = cur_year + 1;
      newMonth = newMonth - 12;
    }
    //当前年月
    this.setData({
      cur_year: newYear,
      cur_month: newMonth
    })

    let days = [];
    const thisMonthDays = this.getThisMonthDays(newYear, newMonth);
    for (let i = 1; i <= thisMonthDays; i++) {
      days.push(i);
    }
    this.setData({
      days: days
    });
    //空格
    const firstDayOfWeek = this.getFirstDayOfWeek(newYear, newMonth);
    const empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids: empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }

  },
  nextCalendar() {
    //下一月
    const date = new Date();
    let cur_year = date.getFullYear();
    let cur_month = date.getMonth() + 1;
    let newMonth = cur_month + 1;
    let newYear = cur_year;
    if (newMonth > 12) {
      newYear = cur_year + 1;
      newMonth = newMonth - 12;
    }
    this.setData({
      next_year: newYear,
      next_month: newMonth
    })

    let next_days = [];

    const thisMonthDays = this.getThisMonthDays(newYear, newMonth);

    for (let i = 1; i <= thisMonthDays; i++) {
      next_days.push(i);
    }
    this.setData({
      next_days: next_days
    });
    //空格
    const firstDayOfWeek = this.getFirstDayOfWeek(newYear, newMonth);
    const empytGrids1 = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids1.push(i);
      }
      this.setData({
        hasEmptyGrid1: true,
        empytGrids1: empytGrids1
      });
    } else {
      this.setData({
        hasEmptyGrid1: false,
        empytGrids1: []
      });
    }

  },
  next_two_Calendar() {
    //下下月
    const date = new Date();
    let cur_year = date.getFullYear();
    let cur_month = date.getMonth() + 1;
    let newMonth = cur_month + 2;
    let newYear = cur_year;
    if (newMonth > 12) {
      newYear = cur_year + 1;
      newMonth = newMonth - 12;
    }
    this.setData({
      next_two_year: newYear,
      next_two_month: newMonth
    })

    let next_two_days = [];
    const thisMonthDays = this.getThisMonthDays(newYear, newMonth);

    for (let i = 1; i <= thisMonthDays; i++) {
      next_two_days.push(i);
    }

    this.setData({
      next_two_days: next_two_days
    });

    //空格
    const firstDayOfWeek = this.getFirstDayOfWeek(newYear, newMonth);
    const empytGrids2 = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids2.push(i);
      }
      this.setData({
        hasEmptyGrid2: true,
        empytGrids2: empytGrids2
      });
    } else {
      this.setData({
        hasEmptyGrid2: false,
        empytGrids2: []
      });
    }
  },
  dayDidSelected: function (event) {

    //选择的时候进行判断
    var year = String(event.currentTarget.dataset.year);
    var month = String(event.currentTarget.dataset.month);
    month = month.length >= 2 ? month : "0" + month;
    var day = String(event.currentTarget.dataset.day);
    day = day.length >= 2 ? day : "0" + day;
    var index = event.currentTarget.dataset.index;


    //当选择的两个日期都有值时  再次点击时  为选择开始时间
    const cur_date = new Date();
    //当日
    let cur_Day = cur_date.getDate();
    //小于今天日期的日期无法选中
    if (cur_Day <= index + 1) {
      //判断是选择的第一个点 还是第二个
      if (this.data.checkintime != "" && this.data.leavetime != "") {
        this.data.checkintime = year + "-" + month + "-" + day;
        this.data.leavetime = "";
        this.data.startIndex = index;
        this.setData({
          startIndex: index,
          stopIndex: index
        })
      }
      else {
        //判断当第二次选中是同一天或者比第一个日期小的时候
        if (index <= this.data.startIndex) {
          this.data.checkintime = year + "-" + month + "-" + day;
          this.data.leavetime = "";

          this.setData({
            startIndex: index,
            stopIndex: index
          })
        }
        else {
          this.data.leavetime = year + "-" + month + "-" + day;
          this.setData({
            stopIndex: index
          })

          wx.setStorage({
            key: "checkintime",
            data: this.data.checkintime,
            key: "leavetime",
            data: this.data.leavetime
          })
          wx.setStorageSync('checkintime', this.data.checkintime);
          wx.setStorageSync('leavetime', this.data.leavetime);
          wx.setStorageSync('startIndex', this.data.startIndex);
          wx.setStorageSync('stopIndex', this.data.stopIndex);
          //  console.log(this.data.checkintime);
          //  console.log(this.data.leavetime);
          wx.navigateBack({
          })
        }
      }
    }

    this.curCalendar();
    this.nextCalendar();
    this.next_two_Calendar();
  },
  onShareAppMessage() {
    return {
      title: '小程序日历',
      desc: '还是新鲜的日历哟',
      path: 'pages/index/index'
    }
  },
  GetDateStr(AddDayCount) {
    //获取日期的方法 今天 AddDayCount=0 明天AddDayCount=1
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期 
    var y = String(dd.getFullYear());
    var m = String(dd.getMonth() + 1);//获取当前月份的日期 
    m = m.length >= 2 ? m : "0" + m;
    var d = String(dd.getDate());
    d = d.length >= 2 ? d : "0" + d;
    return y + "-" + m + "-" + d;
  }

};

Page(conf);
