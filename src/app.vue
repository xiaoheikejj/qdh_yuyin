<template>
    <div id="app">
        <router-view v-if="isShow"/>
        <!-- <router-view/> -->
    </div>
</template>

<script>
import ax from 'axios'
import { setTimeout } from 'timers';
import { fail } from 'assert';
export default {
    data () {
        return {
            isShow: false
        }
    },
    created () {
        // var openID = location.href.split("openID=")[1].split("#")[0];
        
        // 这是之前写的
        // var userInfo = sessionStorage.getItem('userInfo');
        // if(!userInfo) {
            //优先直线这个
            // this.getUserInfo()
            // this.wxAccredit()
        // } else {

            this.isShow = true
            //这边也执行这个
            this.wxAccredit()
            // userInfo = JSON.parse(userInfo)
            // setInterval(() => {
            //     this.$store.dispatch('common/saveWay', {
            //         userName: userInfo.nickName,
            //         openID: userInfo.openID,
            //         longitude: userInfo.longitude,
            //         latitude: userInfo.latitude
            //     })
            // }, 600000)
        // }
    },

    methods: {
        // 微信授权
        wxAccredit() {
        
            var localUrl = location.href.split('#')[0]
            //将url 发送服务器 获取jssdk相关key和签名
            //通过config接口注入权限验证配置
            ax({
                method: 'get',
                url: 'https://budaoapi.magicreal.net/wxapp/login/getCode?url=' + localUrl
            }).then(res => {
                if(res.data.code === 1) {
                    //加载jssdk配置
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: res.data.data.appID, // 必填，公众号的唯一标识
                        timestamp: res.data.data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: res.data.data.nonceStr, // 必填，生成签名的随机串
                        signature: res.data.data.signature, // 必填，签名
                        jsApiList: [
                            'checkJsApi',
                            'scanQRCode',
                            'openLocation'
                        ] // 必填，需要使用的JS接口列表
                    })
                    //通过ready接口处理成功验证
                    wx.ready(() => {
                        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后
                        // this.getUserInfo()//这边注释掉
                    })
                }
            })
        },

        //获取用户信息  这边没做控制   请点击两次按钮
        // getUserInfo() {
        //     ax({
        //         url: 'https://demo.magicreal.net/yunnanadmin/wxUser/getConfig',
        //         method: 'post'
        //     }).then(res => {
        //         var appId = res.data.data.appID
        //         var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appId + "&redirect_uri=" + location.href.split('#')[0] + "&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
        //         var code = this.getUrlParam("code")
        //         if(!code) {
        //             window.location = url
        //         } else {
        //             var formData = new FormData()
        //             formData.append("code" , code)
        //             var oauth_url = "https://demo.magicreal.net/yunnanadmin/wxUser/userInfo"
        //             ax({
        //                 method: 'post',
        //                 url: oauth_url,
        //                 data: formData
        //             }).then(res => {
        //                 var data = res.data.data
        //                 this.$store.dispatch('common/userInfo', {
        //                     openID: data.openID,
        //                     nickName: data.nickName,
        //                     sex: data.sex,
        //                     province: data.province,
        //                     city: data.city,
        //                     country: data.country,
        //                     headImgUrl: data.headImgUrl
        //                 }).then(json => {
        //                     data.latitude = json.data.latitude
        //                     data.longitude = json.data.longitude
        //                     sessionStorage.setItem("userInfo", JSON.stringify(data))
        //                     if(window.location.search) {
        //                         var index = window.location.href.indexOf('?')
        //                         window.location.href = window.location.href.slice(0, index)
        //                     }
        //                     this.isShow = true
        //                 })
        //             })
        //         }
        //     })
        // },

        //用于微信回调的url截取code
        getUrlParam(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
            var r = window.location.search.substr(1).match(reg)
            if(r != null) return unescape(r[2])
            return null
        }
    }
}
</script>
