<template>
<div id="navigation-view">
    <div class="amap-wrapper">
        <div id="map"></div>
    </div>

    <ul class="navigation-box" v-if="isOpenNavigation">
        <li @click="goToMapApp('baidu')">使用百度地图导航</li>
        <li @click="goToMapApp('gaode')">使用高德地图导航</li>
        <li @click="isOpenNavigation = false">取消</li>
    </ul>
</div>
</template>

<script>
export default {
    data() {
        return {
            map: null,
            routeLine: null,
            startMarker: null,
            endMarker: null,
            dis: 0,
            markerList: [],
            isOpenNavigation: false,
            userInfo: {}
        }
    },


    mounted () {
        // this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
        this.$store.dispatch('common/getOperationInfo', {
            userName: 1,
            openID: 1,
            longitude: 1,
            latitude: 1,
            // userName: this.userInfo.nickName,
            // openID: this.userInfo.openID,
            // longitude: this.userInfo.longitude,
            // latitude: this.userInfo.latitude,
            id: this.$route.params.id
        }).then(res => {
            var data = res.data
            this.map = new AMap.Map("map", {
                resizeEnable: true,
                center: [data.longitude, data.latitude],
                zoom: 13
            })
            var marker = new AMap.Marker({
                position: new AMap.LngLat(data.longitude, data.latitude)
            })
            var list = []
            list.push(res.data)
            list.push(res.data)
            this.addMarker(list)
        })
    },

    methods: {
        //添加marker标记
        addMarker(arr) {
            this.markerList = []
            var infoWindow = new AMap.InfoWindow({
                isCustom: true,  //使用自定义窗体
                offset: new AMap.Pixel(0, -35)
            })

            for(let i in arr) {
                var marker = new AMap.Marker({
                    position: new AMap.LngLat(arr[i].longitude, arr[i].latitude)
                })

                // 计算直线距离长度
                var p1 = [98.533109, 25.010693]
                var p2 = [arr[i].longitude, arr[i].latitude]
                var dis = (AMap.GeometryUtil.distance(p1, p2)/1000).toFixed(1)

                marker.id = arr[i].latitude
                marker.title = arr[i].infoName
                marker.content = `<div class="item1">
                                    <div class="item-info">
                                        <p>${arr[i].infoName}</p>
                                    </div>
                                    <div class="item-btn" id="navigationBtn">
                                        <p><i></i>导航</p>
                                    </div>
                                </div>`

                infoWindow.setContent(this.createInfoWindow(marker.title, marker.content))
                infoWindow.open(this.map, marker.getPosition())
                setTimeout(() => {
                    var navigationBtn = document.getElementById('navigationBtn')
                    AMap.event.addDomListener(navigationBtn, 'click', () => {
                        this.isOpenNavigation = true
                    })
                }, 1)

                this.markerList.push(marker)
            }

            // 将创建的点标记添加到已有的地图实例：
            this.map.add(this.markerList)
        },

        //构建自定义信息窗体
        createInfoWindow(title, content) {
            var info = document.createElement("div");
            info.className = "custom-info input-card content-window-card1";

            // 定义中部内容
            var middle = document.createElement("div");
            middle.className = "info-middle";
            middle.innerHTML = content;
            info.appendChild(middle);

            return info;
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

<style lang="stylus">
@import '../assets/styles/markCard.styl'
#navigation-view
    position relative
    width: 100%;
    height: 100vh;
    .amap-wrapper
        width 100%
        height 100%
        #map
            width 100%
            height 100%

    .navigation-box
        position absolute
        z-index 20
        bottom 0
        background #ffffff
        width 100%
        text-align center
        li
            height 50px
            line-height 50px
            border-bottom 1px solid #eeeeee
</style>
