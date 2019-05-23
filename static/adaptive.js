

(function (win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    // 设备像素比
    var devicePixelRatio = win.devicePixelRatio;
    // 我们设置的布局视口与理想视口的像素比
    var dpr = 1;
    // viewport缩放值
    var scale = 1;
    // 设置viewport
    function setViewport() {
        // 判断IOS
        var isIPhone = /iphone/gi.test(win.navigator.appVersion);
        // viewport 不缩放
        dpr = 1;
        // window对象上增加一个属性，提供对外的布局视口与理想视口的值
        win.devicePixelRatioValue = dpr;
        // viewport缩放值，布局视口缩放后刚好显示成理想视口的宽度，页面就不会过长或过短了
        scale = 1 / dpr;
        // 获取已有的viewport
        var hasMetaEl = doc.querySelector('meta[name="viewport"]');
        // 如果有，改变之
        if (hasMetaEl) {
            // ios9 不用设置 maximum-scale minimum-scale，否则页面会出现可左右拖动的效果，IOS9的bug或者故意为之？
            if (isIPhone) {
                hasMetaEl.setAttribute('content', 'initial-scale=' + scale + ', user-scalable=no');
            }
            // target-densitydpi 目标设备密度等级，默认值medium-dpi，我们的目标是css中的1px会等于物理像素中的1px，故使用target-densitydpi=device-dpi
            else {
                hasMetaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no,target-densitydpi=device-dpi');
            }
        }
        // 如果没有，添加之
        else {
            var metaEl = doc.createElement('meta');
            metaEl.setAttribute('name', 'viewport');
            if (isIPhone) {
                metaEl.setAttribute('content', 'initial-scale=' + scale + ', user-scalable=no');
            }
            else {
                metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no,target-densitydpi=device-dpi');
            }

            if (docEl.firstElementChild) {
                docEl.firstElementChild.appendChild(metaEl);
            }
            else {
                var wrap = doc.createElement('div');
                wrap.appendChild(metaEl);
                doc.write(wrap.innerHTML);
            }
        }
    }
    setViewport();
    var newBase = 100;

    function setRem() {
        // 布局视口
        // var layoutView = docEl.documentElement.clientWidth; 也可以 获取布局视口的宽度
        var layoutView;
        if (lib.maxWidth) {
            layoutView = Math.min(docEl.getBoundingClientRect().width, lib.maxWidth * dpr);
        }
        else {
            layoutView = docEl.getBoundingClientRect().width;
        }
        // 为了计算方便，我们规定 1rem === 100px设计图像素，我们切图的时候就能快速转换
        // 有人问，为什么不让1rem === 1px设计像素呢？
        // 设计图一般是640或者750px
        // 布局视口一般是320到1440
        // 计算一个值，使layout的总宽度为 (desinWidth/100) rem
        // 那么有计算公式：layoutView / newBase = desinWidth / 100
        // newBase = 100 * layoutView / desinWidth
        // newBase = 介于50到200之间
        // 如果 1rem === 1px 设计像素，newBase就介于0.5到2之间，由于很多浏览器有最小12px限制，这个时候就不能自适应了
        newBase = 100 * layoutView / lib.desinWidth;
        docEl.style.fontSize = newBase + 'px';
        // rem基准值改变后，手动reflow一下，避免旋转手机后页面自适应问题
        doc.body&&(doc.body.style.fontSize = lib.baseFont * dpr + 'px');
        // 重新设置rem后的回调方法
        lib.setRemCallback&&lib.setRemCallback();
    }
    var tid;
    lib.desinWidth = 750;
    lib.baseFont = 12;
    lib.init = function () {
        // resize的时候重新设置rem基准值
        // 触发orientationchange 事件时也会触发resize，故不需要再添加此事件了
        win.addEventListener('resize', function () {
            clearTimeout(tid);
            tid = setTimeout(setRem, 300);
        }, false);
        // 浏览器缓存中读取时也需要重新设置rem基准值
        win.addEventListener('pageshow', function (e) {
            if (e.persisted) {
                clearTimeout(tid);
                tid = setTimeout(setRem, 300);
            }
        }, false);
        // 设置body上的字体大小
        if (doc.readyState === 'complete') {
            doc.body.style.fontSize = lib.baseFont * dpr + 'px';
        }
        else {
            doc.addEventListener('DOMContentLoaded', function (e) {
                doc.body.style.fontSize = lib.baseFont * dpr + 'px';
            }, false);
        }
        // 设置rem值
        setRem();
        // html节点设置布局视口与理想视口的像素比
        docEl.setAttribute('data-dpr', dpr);
    };
    // 有些html元素只能以px为单位，所以需要提供一个接口，把rem单位换算成px
    lib.remToPx = function (remValue) {
        return remValue * newBase;
    };
})(window, window['adaptive'] || (window['adaptive'] = {}));
// 设计图宽度
window['adaptive'].desinWidth = 750;
//body 字体大小
window['adaptive'].baseFont = 12;



// 初始化
window['adaptive'].init();
$('[data-url]').on('click', function () {
    window.location.href = $(this).data('url')
});

$('[data-back]').on('click', function () {
    history.back(-1);
});
$(function(){
    //        点击对侧边栏的显示和隐藏
    $('.pop').on('click', function () {
      $(this).addClass("zhuan");
        $('nav').fadeIn(300);
        $('.layer').fadeIn(300);
        $('.nav').animate({
            right: 0,
            
        })
        $("nav").css("z-index",6666);
         $("body").css("overflow","hidden");
    });


    var hideSubnav = function (obj) {
        var $sub = obj.find('.sub');
        $sub.animate({
            height: 0,
            opacity: 0
        }, 200, function () {
            $sub.hide()
        })
    };
    var showSubnav = function (obj) {
        var $sub = obj.find('.sub');
        var height = $sub.removeAttr('style').show().height();
        $sub.height(0).css('opacity', 0).animate({
            height: height,
            opacity: 1
        }, 200)
    };
    $('.accordion li.menu').on('click', function () {
        var _this = this;
        var $li = $(this);
        if ($li.find('.sub').is(':visible')) {
            hideSubnav($li);
        } else {
            $('.accordion li.menu').each(function () {
                if (this != _this) {
                    hideSubnav($(this));
                }
            });
            showSubnav($li);
        }
    });

    $('.layer').on('click', function () {
        $('.pop').removeClass("zhuan");
        $('nav').fadeOut(300);
        $('.layer').fadeOut(300);
        $('.nav').animate({
            right: -320
        })
        $("body").css("overflow","auto");
        
    });
    $('.accordion .sub li').on('click', function (e) {
        e.stopPropagation();
    })
//  侧边导航栏更换图片js
    $(".menu").click(function(){
        $(this).find(".icon").toggleClass("current5")
        $(this).siblings('.menu').find(".icon").removeClass("current5");//切换图标
    });
//  点击底部导航跳转当前页面添加样式

    $(document).ready(function(){  
      $('.fixed a').each(function(){  
          if($($(this))[0].href==String(window.location))  
              $(this).find("div").addClass('active').siblings().find("div").removeClass('active');
              
      });  
      document.addEventListener('touchmove', function (e) {
        if (e.target.nodeName == 'nav') {
            e.preventDefault();
        } else {
            e.stopPropagation();
        }
      })
       
    }) 
	//  禁止手机屏幕左右滑动
	  var xx,yy,XX,YY,swipeX,swipeY ;
	  document.addEventListener('touchstart',function(event){
	   xx = event.targetTouches[0].screenX ;
	   yy = event.targetTouches[0].screenY ;
	   swipeX = true;
	   swipeY = true ;
	  })
	  document.addEventListener('touchmove',function(event){
	   XX = event.targetTouches[0].screenX ;
	   YY = event.targetTouches[0].screenY ;
	   if(swipeX && Math.abs(XX-xx)-Math.abs(YY-yy)>0) //左右滑动
		{
		event.stopPropagation();//组织冒泡
		event.preventDefault();//阻止浏览器默认事件
		 swipeY = false ;
		//左右滑动
		}
		 else if(swipeY && Math.abs(XX-xx)-Math.abs(YY-yy)<0){ //上下滑动
		 swipeX = false ;
		//上下滑动，使用浏览器默认的上下滑动
		}
	  })
});




     
  