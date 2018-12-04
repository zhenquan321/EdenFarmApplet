 
var Config = {
     'share_text' : {
        'title' : '伊甸农场',
        'desc' : '优质生活，伊甸护航',
        'path' :　'pages/index/index'
     },
     "baseApiUrl": "https://api.ydnc.com.cn/",
    "web" :  {
        "url": "api.ydnc.com.cn",
        "name" : "伊甸农场",
    },
    "appDebug" : false,
    "token": "1QkPvTHaERL8ftHfCIPSV40yaIkxhHFhCqUwhg4Z7s9uyhV4",
    "error_text" : {
        0: "服务器可能中暑了，请稍后再试",
        1: "您还没有填写收货信息哦~",
        2: "Oops! 这个团已经不在地球上了，快去首页火拼吧！",
        3: "您还没有参加过任何团哦，赶快去首页火拼吧！",
        4: "商品已下架或不存在，赶快去首页看看吧！",
        5: "您的地址信息不完整，请先完善地址信息吧~",
        6: "订单信息错误~",
        7: "暂时没有物流信息",
        8: "获取快递信息失败, 请稍后再试",
        9: "获取订单失败，请稍后再试！",
        10: "您还没有优惠券哦~",
        11: "您还没有填写联系人信息哦~~"
    },
    "order_status" : {
        0 : "待支付",
        1 : "已支付，未确认",
        2 : "已确认，待发货", 
        3 : "配送中",
        4 : "交易完成", 
        5 : "交易已取消",
        6 : "未发货退款处理中",
        7 : "未发货退款成功", 
        8 : "已发货退款处理中",
        9 :"已发货退款成功"
    },
    "page_offset" : 0,
    "page_size" : 5,
    "userInfo" : {
          "nickName" : "游客",
          //"avatarUrl" :　"https://home.ydnc.com.cn/images/logo.jpg"
    },
     pullload_text: {
            load_text: "正在玩命的加载...",
            no_orders: "没有更多的订单了...",
            no_tuan_orders: "没有更多的团订单了...",
            no_goods: "更多新品正在陆续推出..."
        },
        pullload_last_text: {
            bottom_text: "↑ 继续向上滑将切换到下一个频道",
            bottom_text_ready_to_next_channel: "↓ 松开按键切换到下一个频道",
            change_channel_tip: "正在加载下一个频道"
        },
        tuan_status: {
            0: {
                desc: "团购进行中",
                tips_title: {
                    0: "快来入团吧",
                    1: "入团成功",
                    2: "开团成功"
                },
                tips_detail: {
                    0: "就差你了",
                    1: "快去邀请好友加入吧",
                    2: "快去邀请好友加入吧"
                }
            },
            7 : {
                 desc: "团购进行中 待成团长",
                 tips_title: {
                    0: "快来入团吧",
                    1: "入团成功",
                    2: "开团成功"
                },
                tips_detail: {
                    0: "就差你了",
                    1: "快去邀请好友加入吧",
                    2: "快去邀请好友加入吧"
                }
            },
            8 : {
                 desc: "团购进行中 待完团",
                 tips_title: {
                    0: "快来入团吧",
                    1: "入团成功",
                    2: "开团成功"
                },
                tips_detail: {
                    0: "就差你了",
                    1: "快去邀请好友加入吧",
                    2: "快去邀请好友加入吧"
                }
            },

            1: {
                desc: "团购成功",
                tips_title: {
                    0: "来晚了一步！该团已被挤爆",
                    1: "团购成功",
                    2: "团购成功"
                },
                tips_detail: {
                    0: "求人不如求自己，自己当团长吧！",
                    1: "我们会尽快为您发货，请耐心等待",
                    2: "我们会尽快为您发货，请耐心等待"
                }
            },
            9 : {
            desc: "团购成功",
                tips_title: {
                    0: "来晚了一步！该团已被挤爆",
                    1: "团购成功",
                    2: "团购成功"
                },
                tips_detail: {
                    0: "求人不如求自己，自己当团长吧！",
                    1: "我们会尽快为您发货，请耐心等待",
                    2: "我们会尽快为您发货，请耐心等待"
                }
            },
            2: {
                desc: "团购失败",
                tips_title: {
                    0: "来晚了一步！",
                    1: "团购失败",
                    2: "团购失败"
                },
                tips_detail: {
                    0: "",
                    1: "",
                    2: ""
                }
            },
            5 : {
                desc: "团购失败 未完团",
                tips_title: {
                    0: "来晚了一步！",
                    1: "团购失败 未完团",
                    2: "团购失败 未完团"
                },
                tips_detail: {
                    0: "",
                    1: "",
                    2: ""
                }
            },
            6 : {
                desc: "团购失败 未成团长",
                tips_title: {
                    0: "来晚了一步！",
                    1: "团购失败 未成团长",
                    2: "团购失败 未成团长"
                },
                tips_detail: {
                    0: "",
                    1: "",
                    2: ""
                }
            }
        },
        group_text: {
            0: "还差%s人组团成功",
            1: "我也要参团",
            2: "我也开个团，点此回商品列表。"
        },
        pay_text: {
            success: "支付成功",
            fail: "支付失败",
            cancel: "支付取消"
        },
        group_pic : {
          'defaultAvatar': "https://home.ydnc.com.cn/images/avatar_4_64.png"
        },
       
};

function config() {
    return Config;
}
module.exports = {
  config : config
}

