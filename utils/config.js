



//配置域名,域名只修改此处。
//如果wordpress没有安装在网站根目录请加上目录路径,例如："www.watch-life.net/blog"
var DOMAIN = "https://api.ydnc.com.cn";
var WEBSITENAME="伊甸农场"; //网站名称
var ABOUTID = 1136; //wordpress网站"页面"的id,注意这个"页面"是wordpress的"页面"，不是"文章"
var PAGECOUNT='5'; //每页文章数目
var CATEGORIESID='all'  //显示全部的分类
//var CATEGORIESID = '1,1059,98,416,189,374,6,463';//指定显示的分类的id
var PAYTEMPPLATEID = 'hzKpxuPF2rw7O-qTElkeoE0lMwr0O4t9PJkLyt6v8rk';//赞赏消息模版id
var REPLAYTEMPPLATEID = 'IiAVoBWP34u1uwt801rI_Crgen7Xl2lvAGP67ofJLo8';//回复评论消息模版id
 //首页图标导航
 //参数说明：'name'为名称，'image'为图标路径，'redirectlink'为跳转的页面，'redirecttype'为跳转的类型，page为本小程序的页面，app为其他微信小程序
 //        'appid' 当redirecttype为app时，这个值为其他微信小程序的appid，如果redirecttype为page时，这个值设置为空。
var INDEXNAV = [
    { id: '1', name: '微店', image: '../../images/shop.png', redirectlink: 'pages/shelf/shelf', redirecttype: 'app', appid:'wx55ea6098e41af5c4' },
    { id: '2', name: '排行', image: '../../images/ranking.png', redirectlink: '../hot/hot', redirecttype: 'page', appid: ''},
    { id: '3', name: '专题', image: '../../images/tar-topic.png', redirectlink: '../topic/topic', redirecttype: 'page', appid: ''},
    ]

export default {
  getDomain: DOMAIN,
  getWebsiteName: WEBSITENAME,
  getAboutId: ABOUTID,
  getPayTemplateId: PAYTEMPPLATEID,
  getPageCount: PAGECOUNT,
  getCategoriesID :CATEGORIESID,
  getIndexNav: INDEXNAV,
  getReplayTemplateId: REPLAYTEMPPLATEID
}