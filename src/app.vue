<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
import service from './utils/request'

export default {
    name: 'App',
    created() {
        this.wxAccredit();
    },
    methods: {
        // 微信授权
        wxAccredit() {
            const localUrl = location.href.split('#')[0]
            //将url 发送服务器 获取jssdk相关key和签名
            //通过config接口注入权限验证配置
            service({
                method: 'get',
                url: 'https://yunnanapi.magicreal.net/wxapp/login/getCode?url=' + localUrl
            }).then(res => {
                if (res.code === 1) {
                    //加载jssdk配置
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: res.data.appID, // 必填，公众号的唯一标识
                        timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
                        signature: res.data.signature, // 必填，签名
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
    }
}
</script>

<style>
@import url(../static/reset.css);

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
}
</style>
