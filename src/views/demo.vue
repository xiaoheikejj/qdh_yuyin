<template>
<div id="demo">
    <!-- <p class="return-btn"><img src="../assets/images/left.png" alt=""> </p> -->

    <div class="amap-wrapper">
        <div id="map"></div>
    </div>
</div>
</template>

<script>
export default {
    data () {
        return {
            map: null,
            markerList: []
        }
    },

    mounted () {
        this.map = new AMap.Map("map", {
            resizeEnable: true,
            zoom: 13,
            center: [98.533109, 25.010693]
        })

        this.map.on('complete', () => {
            // 地图图块加载完成后触发
            // 默认点击旅游路线
            var arr = [{
                infoName: 'aaa',
                headImgUrl: 'https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/yunnan/1/yetaimingxi/1.png',
                longitude: 98.507934,
                latitude: 25.003258
            }]
            this.addMarker(arr)
        })

    },

    methods: {
        // 点标记
        addMarker (arr) {
            this.markerList = []
            var infoWindow = new AMap.InfoWindow({
                isCustom: true,  //使用自定义窗体
                offset: new AMap.Pixel(0, -15)
            })

            for(let i in arr) {
                var marker = new AMap.Marker({
                    position: new AMap.LngLat(arr[i].longitude, arr[i].latitude),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                })

                marker.title = arr[i].infoName
                marker.content = `
                    <div class="item">
                        <div class="left">
                            <img src='${arr[i].headImgUrl}'>
                        </div>
                        <div class="right">
                            <p>${arr[i].infoName}</p>
                            <p class="hint">11km</p>
                            <div class="info">
                                <span id="detail">
                                    <i></i>详情
                                </span>
                                <span class="btn" id="navigation" value="11">去这里</span>
                            </div>
                        </div>
                    </div>`
                marker.on('click', (e) => {
                    infoWindow.setContent(this.createInfoWindow(e.target.title, e.target.content))
                    infoWindow.open(this.map, e.target.getPosition())
                    setTimeout(() => {
                        var navigation = document.getElementById('navigation')
                        var detail = document.getElementById('detail')
                        AMap.event.addDomListener(navigation, 'click', () => {
                            this.$router.push({ path: '/navigation/' + e.target.id })
                        })
                        AMap.event.addDomListener(detail, 'click', () => {
                            this.$router.push({ path: '/detail/' + e.target.id })
                        })
                    }, 100)

                })

                this.markerList.push(marker)
            }
            // 将创建的点标记添加到已有的地图实例：
            this.map.add(this.markerList)
        },

        //构建自定义信息窗体
        createInfoWindow (title, content) {
            var info = document.createElement("div");
            info.className = "custom-info input-card content-window-card";

            // 定义中部内容
            var middle = document.createElement("div");
            middle.className = "info-middle";
            middle.innerHTML = content;
            info.appendChild(middle);

            return info;
        },
    }
}
</script>

<style lang="stylus">
@import '../assets/styles/markCard.styl'
#demo
    position relative
    width 100%
    height 100vh
    .amap-wrapper
        width 100%
        height 100vh
        #map
            width 100%
            height 100%
</style>
