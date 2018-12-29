<template>
<div id="resuce">
    <!-- <p class="return-btn"><img src="../assets/images/left.png" alt=""> </p> -->
    <div class="content">
        <p class="title">谎报险情，依法追责</p>
        <p>根据《中华人民共和国治安管理处罚法》第二十五条第一款规定：谎报险情将可能被处以5日以上10日以下拘留</p>
        <div @click="phoneCall()">
            <img src="../assets/images/help_phone.png" alt="">
            <p>呼叫救援</p>
        </div>
        <p>点击后您的当前位置信息将发送给救援指挥部</p>
        <p>请您不要进行大范围移动</p>
    </div>

    <div class="foot">
        <div class="map-box">
            <div class="amap-wrapper">
                <p>当前位置（仅供参考）</p>
                <div id="map"></div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    data () {
        return {
            map: null,
            phone: ''
        }
    },

    mounted () {
        this.phone = this.$route.query.number
        this.map = new AMap.Map("map", {
            resizeEnable: true,
            zoom: 15
        })

        this.map.on('complete', () => {
            this.map.plugin('AMap.Geolocation', () => {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：5s
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                    showButton: false
                })

                this.map.addControl(geolocation);
                geolocation.getCurrentPosition((status,result) => {
                    if(status=='complete'){
                        // this.onComplete(result)
                    }else{
                        // this.onError(result)
                    }
                })
            })
        })
        // this.getLocation()
    },

    methods: {
        phoneCall () {
            window.location.href = 'tel://' + this.phone
        },
        getLocation() {
            // console.log(navigator.geolocation.getCurrentPosition())
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition();
            } else {
                var x="Geolocation is not supported by this browser.";
                console.log(x)
            }
        },
        showPosition(position) {
            var a = "Latitude: " + position.coords.latitude +
            "<br />Longitude: " + position.coords.longitude;
            console.log(position)
        }
    }
}
</script>

<style lang="stylus">
#resuce
    position relative
    .return-btn
        text-align center
        width 20px
        height 20px
        line-height 20px
        position absolute
        top 0
        left 0
    .content
        background #fff
        width 100%
        height 60vh
        padding 20px 20px 0
        box-sizing border-box
        text-align center
        p
            font-size 14px
        p.title
            color red
            font-size 20px
            margin-bottom 20px
        div
            position relative
            display inline-block
            background url('../assets/images/help_bg@2x.png') no-repeat
            background-size 100% 100%
            width 12rem
            height 12rem
            margin-top 10px
            img
                position absolute
                top 35px
                left 50%
                margin-left -10%
                width 20%
                height 20%
            p
                position absolute
                top 75px
                left 50%
                margin-left -50%
                color #fff
                font-size 1.2rem
                width 100%
    .foot
        height 40vh
        box-sizing border-box
        background #eee
        padding 10px
        .map-box
            width 100%
            height 100%
            box-sizing border-box
            background #fff
            padding 10px 30px
            p
                margin-bottom 10px
            .amap-wrapper
                width 100%
                height 80%
                #map
                    width 100%
                    height 100%
</style>
