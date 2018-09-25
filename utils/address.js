function gearTouchStart(e) {
    //   e.preventDefault();
      var target = e.target;
      var style = '';
      while (true) {
          if (!target.classList.contains("gear")) {
              target = target.parentElement;
          } else {
              break
          }
      }
      clearInterval(target["int_" + target.id]);
      target["old_" + target.id] = e.touches[0].screenY;
      target["o_t_" + target.id] = (new Date()).getTime();
      var top = target.getAttribute('top');
      if (top) {
          target["o_d_" + target.id] = parseFloat(top.replace(/em/g, ""));
      } else {
          target["o_d_" + target.id] = 0;
      }
      target.style.webkitTransitionDuration = target.style.transitionDuration = '0ms';
  }

  //手指移动
  function gearTouchMove(e) {
    //   e.preventDefault();
       var target = e.target;
       var style = '';
       console.log(target);
        //   while (true) {
        //       if (!target.classList.contains("gear")) {
        //           target = target.parentElement;
        //       } else {
        //           break
        //       }
        //   }
       target["new_" + target.id] = e.touches[0].screenY;
       target["n_t_" + target.id] = (new Date()).getTime();
       var f = (target["new_" + target.id] - target["old_" + target.id]) * 30 /  e.touches[0].pageY;
       target["pos_" + target.id] = target["o_d_" + target.id] + f;
       
       //    target.style["-webkit-transform"] = 'translate3d(0,' + target["pos_" + target.id] + 'em,0)';
       //    style += 'translate3d(0,' + target["pos_" + target.id] + 'em,0)';
       //   if(e.targetTouches[0].screenY<1){
       //       gearTouchEnd(e);
       //   }; 
       style += 'transform:translate3d(0,' + target["pos_" + target.id] + 'em,0);';
       return style;
  }

  //离开屏幕
  function gearTouchEnd(e) {
    //   e.preventDefault();
    //   var target = e.target;
    //   while (true) {
    //       if (!target.classList.contains("gear")) {
    //           target = target.parentElement;
    //       } else {
    //           break;
    //       }
    //   }
    //   var flag = (target["new_" + target.id] - target["old_" + target.id]) / (target["n_t_" + target.id] - target["o_t_" + target.id]);
    //   if (Math.abs(flag) <= 0.2) {
    //       target["spd_" + target.id] = (flag < 0 ? -0.08 : 0.08);
    //   } else {
    //       if (Math.abs(flag) <= 0.5) {
    //           target["spd_" + target.id] = (flag < 0 ? -0.16 : 0.16);
    //       } else {
    //           target["spd_" + target.id] = flag / 2;
    //       }
    //   }
    //   if (!target["pos_" + target.id]) {
    //       target["pos_" + target.id] = 0;
    //   }
    //   rollGear(target);
  }
  
  //缓动效果
  function rollGear(target) {
      var d = 0;
      var stopGear = false;
      function setDuration() {
          target.style.webkitTransitionDuration = target.style.transitionDuration = '200ms';
          stopGear = true;
      }
      clearInterval(target["int_" + target.id]);
      target["int_" + target.id] = setInterval(function() {
          var pos = target["pos_" + target.id];
          var speed = target["spd_" + target.id] * Math.exp(-0.03 * d);
          pos += speed;
          if (Math.abs(speed) > 0.1) {} else {
              var b = Math.round(pos / 2) * 2;
              pos = b;
              setDuration();
          }
          if (pos > 0) {
              pos = 0;
              setDuration();
          }
          var minTop = -(target.dataset.len - 1) * 2;
          if (pos < minTop) {
              pos = minTop;
              setDuration();
          }
          if (stopGear) {
              var gearVal = Math.abs(pos) / 2;
              setGear(target, gearVal);
              clearInterval(target["int_" + target.id]);
          }
          target["pos_" + target.id] = pos;
          target.style["-webkit-transform"] = 'translate3d(0,' + pos + 'em,0)';
          target.setAttribute('top', pos + 'em');
          d++;
      }, 30);
  }
  
//   //控制插件滚动后停留的值
//   function setGear(target, val) {
//       val = Math.round(val);
//       target.setAttribute("val", val);
//       switch (_self.type) {
//           case 1:
//                 _self.setGearTooth(_self.data);
//               break;
//           case 2:
//             switch(target.dataset['areatype']){
//                 case 'area_province':
//                 _self.setGearTooth(_self.data[0]);
//                     break;
//                 case 'area_city':
//                     var ref = target.childNodes[val].getAttribute('ref');
//                     var childData=[];
//                     var nextData= _self.data[2];
//                     for (var i in nextData) {
//                         if(i==ref){
//                           childData = nextData[i];
//                           break;
//                         }
//                     };
//               _self.index=2;
//               _self.setGearTooth(childData);
//                     break;
//             }
//       }
//   }   

  module.exports = {
    gearTouchStart: gearTouchStart,
    gearTouchMove : gearTouchMove,
    gearTouchEnd :　gearTouchEnd
  }