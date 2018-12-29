<template>
<div id="detail">
    <div class="img">
        <template v-if="carouselList.length !== 0">
            <van-swipe class="touch" :autoplay="3000">
                <van-swipe-item v-for="(item, index) in carouselList" :key="index">
                    <img :src="item" alt="">
                </van-swipe-item>
            </van-swipe>
        </template>

        <template v-else>
            <img width="100%" height="100%" src="../assets/images/default.jpg" alt="">
        </template>
    </div>

    <div class="content">
        <div class="nav" @click="navigation">
            <img src="../assets/images/nav.png" alt="">
            <span>导航</span>
        </div>
        <p class="name" v-if="JSON.stringify(detailData) !== '{}'">
            {{detailData.infoName}}
        </p>
        <p class="add" v-if="JSON.stringify(detailData) !== '{}'">
            {{detailData.address}}
        </p>
    </div>

    <div class="info">
        <div v-if="JSON.stringify(detailData) !== '{}'" v-html="detailData.infoDesc"></div>
    </div>

    <!-- <div class="amap-wrapper"> -->
        <!-- <div id="map"></div> -->
        <!-- <div class="tool">
            <span class="button" @click="navigation">开始导航</span>
        </div> -->
    <!-- </div> -->
     <ul class="navigation-box" v-if="isOpenNavigation">
        <li @click="goToMapApp('baidu')">使用百度地图导航</li>
        <li @click="goToMapApp('gaode')">使用高德地图导航</li>
        <li @click="isOpenNavigation = false">取消</li>
    </ul>
</div>
</template>

<script>
export default {
    data () {
        return {
            id: 0,
            map: null,
            detailData: {},
            carouselList: [],
            isOpenNavigation: false
        }
    },

    created () {
        this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
        this.id = this.$route.params.id
    },

    mounted () {
        this.$store.dispatch('common/getOperationInfo', {
            userName: this.userInfo.nickName,
            openID: this.userInfo.openID,
            longitude: this.userInfo.longitude,
            latitude: this.userInfo.latitude,
            id: this.id,
            // userName: 1,
            // openID: 1,
            // longitude: 1,
            // latitude: 1,
            // id: this.id
        }).then(res => {
            var data = res.data
            this.detailData = res.data
            // this.map = new AMap.Map("map", {
            //     resizeEnable: true,
            //     center: [data.longitude, data.latitude],
            //     zoom: 13,
            //     zoomEnable: false,
            //     dragEnable: false,
            //     expandZoomRange: false,
            //     doubleClickZoom: false,
            //     scrollWheel: false
            // })
            // var marker = new AMap.Marker({
            //     position: new AMap.LngLat(data.longitude, data.latitude)
            // })
            // this.map.add(marker)
            this.carouselList = data.imgUrls.split(',')
        })
    },

    methods: {
        navigation () {
            this.isOpenNavigation = true
        },

        // 跳转百度地图app、高德地图app
        goToMapApp (type) {
            if(type === 'baidu') {
                // window.location.href = "http://api.map.baidu.com/marker?location=" + lat + "," + lng + "&title=" + titleName + "&content=" +content+ "&output=html"
                window.location.href = "https://map.baidu.com/"
            } else {
                window.location.href = "https://www.amap.com/"
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
#detail
    background #eee
    height 100vh
    .img
        box-sizing border-box
        width 100%
        height 35vh
        .touch
            width 100%
            height 100%
            img
                width 100%
                height 100%
    .content
        background #fff
        position relative
        border-radius 5px
        padding 20px 0 20px 0
        margin 10px
        box-sizing border-box
        .nav
            height 25px
            float right
            margin-right 10px
            line-height 27px
            img
                position relative
                top 5px
                width 20px
                height 20px
            span
                font-size 16px
                color #14bd7a
        p.name, p.add
            height 25px
            line-height 27px
            overflow hidden
            text-overflow ellipsis
            white-space nowrap
        p.name
            // width 80%
            color #333
            padding-left 5px
            margin-bottom 20px
            font-size 16px
            border-left 2px solid #14bd7a
        p.add
            width 90%
            color #666
            margin-left 10px
            font-size 14px
    .info
        background #fff
        border-radius 4spx
        padding 10px
        margin 10px
    .amap-wrapper
        position relative
        background #eee
        padding-top 10px
        box-sizing border-box
        width 100%
        height 20vh
        #map
            width 100%
            height 100%
        .tool
            width 100%
            position absolute
            bottom 5px
            text-align center
            .button
                display inline-block
                background rgb(20, 189, 122)
                border-radius 50px
                width 35%
                height 35px
                line-height 35px
                font-size 14px
                color #fff
    .navigation-box
        position fixed
        z-index 1010
        bottom 0
        background #ffffff
        width 100%
        text-align center
        li
            height 50px
            line-height 50px
            border-bottom 1px solid #eeeeee
            font-size 14px
</style>
