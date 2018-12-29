<template>
<div id="home">
    <div class="amap-wrapper">
        <div id="map"></div>
    </div>

    <div class="cover"></div>
    <div class="user-box clear">
        <div class="user-avater">
            <img :src="userInfo.headImgUrl" alt="">
        </div>
        <div class="weather">
            <p>{{userInfo.nickName}}   {{userInfo.userIntegral}}积分</p>
            <p v-if="JSON.stringify(weatherData) !== '{}'">{{'千岛湖 ' +weatherData.temperature + '℃'}}</p>
        </div>
    </div>

    <ul class="tool-box">
        <li v-for="(item, index) in getMenuList" :key="index" @click="handleClick(item)">
            <img :src="item.menuIcon" alt="">
            <p>{{item.menuName}}</p>
        </li>
    </ul>

    <!-- <div class="topView" v-if="marker_show">
        <div class="box" :style="{width: 70 * filterList.length + 'px'}">
            <ul class="clear" >
                <li v-for="(item, index) in filterList" :key="index" @click="typeClick(item.id, item.wayName)">
                    <p v-if="top_view_type_ID == item.id" style="color: #71a3ff;border-bottom: solid 3px #71a3ff">{{item.wayName}}</p>
                    <p v-else style="color: #666">{{item.wayName}}</p>
                </li>
            </ul>
        </div>
    </div> -->

    <div class="footer">
        <!-- <div class="filter" v-if="filterBtn" @click="openFilter = true">
            <img src="../assets/images/filter-1@2x.png" alt="">
            <p>筛选</p>
        </div> -->
        <div class="filter" v-if="filter_show">
            <div @click="turnToOverView">
                <img src="../assets/images/gaikuang.png" alt="">
                <p>概况</p>
            </div>
            <div @click="turnToList">
                <img src="../assets/images/scenic.png" alt="">
                <p>列表</p>
            </div>
        </div>

        <!-- <div class="center-btn" v-if="center_btn_show" @click="rocketBtn(top_view_type_ID)">
            <img src="../assets/images/tabs_swiper.png"/>
        </div> -->

        <!-- <div class="footer-list"  v-if="footer_list_show">
            <div class="recommend-route">
                <span></span>
                <p>{{recommend_name}}</p>
                <span></span>
            </div>
            <ul>
                <li v-for="(item, index) in recommend_list" :key="String(index)">
                    <div class="left">
                        <p>{{index+1}}</p>
                        <span></span>
                    </div>
                    <div class="right">
                        <div class="top">
                            <div>
                                <div style="display: flex;align-items: center">
                                    <h6>{{item.infoName}}</h6>
                                    <span v-if="!item.kar_show" style="display: inline-block;margin-left: 5px;color: #5dcf6b;padding: 1px;border-radius: 4px;border: solid 1px #5dcf6b">已打卡</span>  
                                </div>
                                <p>{{item.infoDesc}}</p>
                            </div>
                            <img :src="item.headImgUrl" alt="">
                        </div>
                        <div class="bottom">
                            <div>
                                <img v-if="item.infoAudio_show" src="../assets/images/list_voice.png" alt="">
                                <img v-else src="../assets/images/list_voice_disable.png" alt="">
                                <span v-if="item.infoAudio_show" @click="itemAudioPlay(item.id)">讲解</span>
                                <span v-else style="color: #dbdbdb">讲解</span>
                            </div>
                            <div>
                                <img src="../assets/images/tabs_info_disable.png" alt="">
                                <span style="color: #dbdbdb">详情</span>
                            </div>
                            <div>
                                <img v-if="item.kar_show" src="../assets/images/list_ka.png" alt="">
                                <img src="../assets/images/list_ka_disable.png" alt="">
                                <span v-if="item.kar_show" @click="setKar(item.id);itemSetKar(item.id)">打咔</span>
                                <span style="color: #dbdbdb">打咔</span>
                            </div>
                            <div @click="navigateTo">
                                <img src="../assets/images/list_navi.png" alt="">
                                <span>导航</span>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div> -->
    </div>

    <audio id="audio" :src="audio_SRC"></audio>
    <div class="scenic-spot" v-if="ka_show">
        <!-- 音频进度条 -->
        <div id="progress" v-show="progressShow">
            <img id="audio-pause" v-if="audioPause" src="../assets/images/pause-2@3x.png" />
            <img id="audio-pause" v-else src="../assets/images/play@3x.png" />
            <div id="progressBar-bg">
                <div id="progressBar"></div>
                <div id="progressDot">
                    <div id="progressDot-child"></div>
                </div>
            </div>
            <div id="audio-close">
                <img src="../assets/images/close.png" />
            </div>
            <p id="audio-name">{{ audioNAME }}</p>
            <div id="audio-time">
                <span>{{ currentTime }}</span>
                /
                <span>{{ totalTime }}</span>
            </div>
        </div>
        <img src="../assets/images/close.png" alt="" class="scenic-spot-close" @click="ka_show=false;center_btn_show=true;scenicClose()">
        <div class="title">
            <div>{{ka_info.name}}</div>
            <span v-if="!ka_info.kar_state">已打卡</span>
        </div>
        <div class="text">
            <span>距离你{{ka_info.distance}}km | {{ka_info.desc}}</span>
        </div>
        <div class="list">
            <div>
                <img v-if="ka_info.audio" src="../assets/images/list_voice.png" alt="">
                <img v-else src="../assets/images/list_voice_disable.png" alt="">
                <span v-if="ka_info.audio" @click="audioPlay">讲解</span>
                <span v-else style="color: #dbdbdb">讲解</span>
            </div>
            <div>
                <img v-if="ka_info.kar_detail" src="../assets/images/list_info.png" alt="">
                <img v-else src="../assets/images/tabs_info_disable.png" alt="">
                <span v-if="ka_info.kar_detail">详情</span>
                <span v-else style="color: #dbdbdb">详情</span>
            </div>
            <div>
                <!-- <img v-if="ka_info.kar_state" src="../assets/images/list_ka.png" alt=""> -->
                <img src="../assets/images/list_ka_disable.png" alt="">
                <!-- <span v-if="ka_info.kar_state" @click="setKar(scenic_ID)">打咔</span> -->
                <span style="color: #dbdbdb">打咔</span>
            </div>
            <div @click="navigateToLocation()">
                <img src="../assets/images/list_navi.png" alt="">
                <span>导航</span>
            </div>
        </div>
    </div>

    <div class="position-scenic" v-if="scenic_show">
        <div class="position" @click="getLocation">
            <img src="../assets/images/gps.png" alt="">
            <p>定位</p>
        </div>
        <div class="scenic" @click="scenicClick">
            <img src="../assets/images/scenic.png" alt="">
            <p>景区</p>
        </div>
    </div>

    <div id="background-audio" v-if="background_audio_show" style="padding: 15px;border-radius: 8px">
        <img style="vertical-align: middle;width: 18.6px;height: 20px" src="../assets/images/voice_guider_playing.png" alt="">
        <span style="vertical-align: middle;color: #fff;font-size: 14px;display: inline-block;width: 100px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis">在播放：{{is_playing_name}}</span>
        <img style="vertical-align: middle;width: 20px;height: 20px" @click="backgroundAudio()" src="../assets/images/close.png" alt="">
    </div>

    <div class="integral-show" v-if="integral_show">
        <img src="../assets/images/Fill.png" alt="">
        <p>打卡成功，加15积分</p>
    </div>
</div>
</template>

<script>
import ax from 'axios'
// import { userInfo } from 'os';
import { setTimeout } from 'timers';

export default {
    data () {
        return {
            userInfo: {
                longitude: '119.06',
                latitude: '29.555741',
                nickName: '1',
                openID: '1',
                headImgUrl: '1',
                userIntegral: 0
            }, // 用户信息
            map: null,  // 地图
            routeLine: null, // 当前路线
            startMarker: null, // 当前起始点
            endMarker: null, // 当前终点

            isOpenList: false,
            openFilter: false,
            getMenuList: [],
            filterList: [],
            type: 0,
            weatherData: {},
            listNum: -1,   // 列表,

            getWayArray: [], // 路线导航
            typeID: -1, // 当前类型id
            elastic_markerList: [], //灵活点标记数组
            markerList: [], // 当前点标记数组
            wayType: 0, // 路线ID 默认
            isOpenNavigation: false,
            filterBtn: true,
            path: [],
            audio_SRC: "",    //语音的src
            progressShow: false,
            audioNAME: "",   //语音的名字
            audioPause: true,    //语音暂停按钮
            currentTime: "00:00",
            totalTime: "00:00",
            marker_show: false,
            ka_show: false,
            geolocation: null,   // 定位
            get_longitude: 0,
            get_latitude: 0,
            ka_info: {
                name: "",
                desc: "",
                distance: "",
                address: "",
                audio: "",
                kar_detail: false,
                kar_state: true,
                longitude: 0,
                latitude: 0
            },
            center_btn_show: false,
            scenic_show: false,
            recommend_list: [],
            footer_list_show: false,
            filter_show: true,
            elasticMarker_ID: 0,
            scenic_ID: 0,
            getKar_list: [],
            is_playing_name: "",
            background_audio_show: false,
            integral_show: false,
            recommend_name: "",
            top_view_type_ID: 0
        }
    },

    created () {
        this.getH5UserInfo();
    },
    mounted () {
        AMap.plugin('AMap.Geolocation', () => {
            var geolocation = new AMap.Geolocation({
                enableHighAccuracy: false,//是否使用高精度定位，默认:true
                timeout: 10000,          //超过10秒后停止定位，默认：5s
                zoomToAccuracy: false,   //定位成功后是否自动调整地图视野到定位点
                showButton: false
            })
            geolocation.getCurrentPosition((status,result) => {
                if(status=='complete'){
                    this.onComplete(result);
                    this.get_longitude = result.position.lng;
                    this.get_latitude = result.position.lat
                }else{
                    this.onError(result)
                }
            })
        })

        var layer_std = new AMap.TileLayer(); //高德默认标准图层        

        this.map = new AMap.Map('map', {
            resizeEnable: true,
            zooms: [10, 18],
            layers: [
                layer_std
            ],
            features: ["bg", "road"],
            center: [this.userInfo.longitude, this.userInfo.latitude],//设置地图中心点坐标
            viewMode: '2D',  //设置地图模式
            lang:'zh_cn',  //设置地图语言类型
        })

        // 这是覆盖了手绘地图的对象
        var tilerLayer = new AMap.TileLayer({
            zIndex: 100,
            getTileUrl: function(x,y,z){
                return `https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_newmap/tiles/${z}/${x}_${y}.png`
            }
        });
        tilerLayer.setMap(this.map);

        var tilerLayer1 = new AMap.TileLayer({
            zIndex: 100,
            getTileUrl: function(x,y,z){
                return `https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_newmap/tiles1/${z}/${x}_${y}.png`
            }
        });
        tilerLayer1.setMap(this.map);

        var tilerLayer2 = new AMap.TileLayer({
            zIndex: 100,
            getTileUrl: function(x,y,z){
                return `https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_newmap/tiles2/${z}/${x}_${y}.png`
            }
        });
        tilerLayer2.setMap(this.map);
        
        this.map.on('complete', () => {
            // 地图图块加载完成后触发
            // 默认点击旅游路线
            // this.menuClick(36)
        })
        setTimeout(() => {
            this.menuClick(this.filterList[0].id);
            // this.recommend_name = this.filterList[0].wayName
        }, 2000)

        //获取分类列表和图标信息
        this.$store.dispatch('common/getOperationInfoListWithLine', {
            userID: 1,
            userName: this.userInfo.nickName,
            openID: this.userInfo.openID,
            longitude: this.userInfo.longitude,
            latitude: this.userInfo.latitude
        }).then(res => {
            this.filterList = res.data
        })

        // 加载天气查询插件
        AMap.plugin('AMap.Weather', () => {
            // 创建天气查询实例
            var weather = new AMap.Weather()
            // 执行实时天气信息查询
            weather.getLive('淳安县', (err, data) => {
                this.weatherData = data
            })
        })

        // iphonex的位置向上偏移点
        var u = navigator.userAgent;
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isIOS) {        
            if (screen.height == 812 && screen.width == 375){
                //是iphoneX
                
            }else{
                //不是iphoneX
            } 
        }

        setTimeout(() => {
            // 由景区列表进入
            const formData = new FormData();
                    formData.append("userID" , 1);
                    formData.append("userName" , 1);
                    formData.append("longitude" , this.userInfo.longitude);
                    formData.append("latitude" , this.userInfo.latitude);
                    formData.append("openID" , this.userInfo.openID);
            ax({
                url: "https://budaoapi.magicreal.net/wxapp/login/getItude",
                method: "post",
                data: formData
            }).then(res => {
                if (res.data.code == 1) {
                    // 景区列表按钮隐藏
                    this.filter_show = false;
                    // 景区按钮显示
                    this.scenic_show = true;
                    this.map.panTo([res.data.data.longitude, res.data.data.latitude]);
                    this.map.setZoom(15)
                }
            })
        }, 1000)
    },

    methods: {
        // 获取用户个人信息
        getH5UserInfo() {
            var openID = location.href.split("openID=")[1].split("#")[0];
            // o3UEB5X-YmvdT8kbX1Mpt6FxSj0c
            const formData = new FormData();
                formData.append("openID" , openID);
            ax({
                url: "https://budaoapi.magicreal.net/wxapp/login/h5userInfo",
                method: "post",
                data: formData
            }).then((res) => {
                var data = res.data.data;
                this.userInfo.longitude = data.longitude;
                this.userInfo.latitude = data.latitude;
                this.userInfo.nickName = data.user.userName;
                this.userInfo.openID = openID;  //userOpenID
                this.userInfo.headImgUrl = data.user.userHeadImgUrl;
                this.userInfo.userIntegral = data.user.userIntegral;
            })
        },
        // 跳转到概况
        turnToOverView() {
            wx.miniProgram.navigateTo({url: "/pages/overview/overview"})
        },
        // 跳转
        turnToList() {
            wx.miniProgram.navigateTo({url: "/pages/scenicList/scenicList"})
        },
        // 导航过去
        navigateToLocation() {
            wx.openLocation({
                latitude: Number(this.ka_info.latitude),
                longitude: Number(this.ka_info.longitude),
                name: this.ka_info.name,
                address: this.ka_info.address,
                scale: 16 
            })
        },
        // 停止播放
        backgroundAudio() {
            // 关闭
            this.background_audio_show = false;
            // 停止播放
            document.getElementById("audio").load();
        },
        // item播放语音
        itemAudioPlay(id) {
            this.recommend_list.forEach(item => {
                if (item.id == id) {
                    this.audio_SRC = item.infoAudio;
                    // this.is_playing_name = item.infoName
                }
            })
            if (this.footer_list_show) {
                this.footer_list_show = false
                $(".center-btn").css({"top": "auto", "bottom": "20px"})
            } else {
                this.footer_list_show = true
                $(".center-btn").css({"top": "-33px", "bottom": "auto"})
            }
            // 显示右下角语音播放
            // this.background_audio_show = true;
            // 播放语音
            this.$nextTick(() => {
                this.audioPlay()
            })
        },
        // 让打咔变灰色
        itemSetKar(id) {
            this.recommend_list.forEach(item => {
                if (item.id == id) {
                    item.kar_show = false
                }
            })
        },
        // 关闭
        scenicClose() {
            // 关闭播放器
            this.progressShow = false;
            // 停止播放
            // document.getElementById("audio").load();
            if (!document.getElementById("audio").paused) {
                this.background_audio_show = true
            }
        },
        // 音频播放
        audioPlay() {
            // 同步播放标题
            this.is_playing_name = this.ka_info.name;
            // 显示progress框
            this.progressShow = true;
            //获得audio节点
            var audio = null;
            audio = document.getElementById("audio");

            //时间
            setTimeout(() => {
                this.totalTime = this.transTime(audio.duration);
            }, 800)
            // 语音在播放的时候从头开始
            audio.load();
            if (audio.paused) {
                this.audioPause = true;
                audio.play()
            }

            // 监听音频播放时间并更新进度条
            audio.addEventListener("timeupdate", () => {
                this.updateProgress(audio);
            }, false);
            // 点击进度条跳到指定点播放
            $(document).on("click", "#progressBar-bg", (e) => {
                if (!audio.paused || audio.currentTime != 0) {
                    // 背景条的总长度
                    const pgsWidth = $("#progressBar-bg").width();
                    // 点击后离起点的长度/总长度
                    const rate = e.offsetX / pgsWidth;
                    //总时间*百分 = 当下的时间
                    audio.currentTime = audio.duration*rate;
                    // 更新进度条
                    this.updateProgress(audio);
                }
            })
            $("#audio-close").click(() => {
                // progress框关闭
                this.progressShow = false;
                // 停止当前播放的音频
                audio.load();
            })
            // click里面嵌套click点击多次循环执行
            $("#audio-pause").unbind("click");
            $("#audio-pause").click(() => {
                if (audio.paused) {
                    // 显示暂停按钮
                    this.audioPause = true;
                    //播放
                    audio.play()
                } else {
                    //显示播放按钮
                    this.audioPause = false;
                    // 暂停
                    audio.pause()
                }
            })
            this.$nextTick(() => {
                this.dragProgressDotEvent(audio)
            })
        },

        scenicClick() {
            // wx.miniProgram.navigateTo({url: "/pages/scenicList/scenicList"})
            this.map.panTo(["119.06", "29.555741"]);
            this.map.setZoom(11);
            this.map.remove(this.markerList);
            this.map.add(this.elastic_markerList);
            this.marker_show = false;
            this.center_btn_show = false;

            this.scenic_show = false;

            // 显示列表
            this.filter_show = true;

            // 停止播放语音
            document.getElementById("audio").load();
            // 隐藏右下角语音播放栏
            this.background_audio_show = false;
        },
        // 工具栏点击事件
        handleClick (item) {
            if (item.id === 1) {
                // this.$router.push({ path: '/rescue?number=' + item.menuInfo })
                wx.miniProgram.navigateTo({url: "../rescue/rescue?number=" + item.menuInfo})
            } else if (item.id === 2) {
                window.location.href = 'tel://' + item.menuInfo
            } else if (item.id === 3) {
                this.sys_click()
            } else if (item.id === 7) {
                this.getLocation()
            }
        },
        // 打咔
        setKar(id) {
            this.$store.dispatch('common/setKar', {
                userID: 1,
                userName: this.userInfo.nickName,
                openID: this.userInfo.openID,
                longitude: this.userInfo.longitude,
                latitude: this.userInfo.latitude,
                infoID: id
            }).then(res => {
                if (res.code == 1) {
                    //点景咔按钮变灰色
                    this.ka_info.kar_state = false

                    this.integral_show = true

                    // 两秒后消失
                    setTimeout(() => {
                        this.integral_show = false
                    }, 2000)
                } else {
                    //点景咔按钮变灰色
                    this.ka_info.kar_state = false
                }

                // 积分变化
                this.getH5UserInfo()
            })
            
        },
        // 获得景咔打咔信息
        getKar() {
            // 首先判断景咔是否已经点过了
            this.$store.dispatch('common/getKar', {
                userID: 1,
                userName: this.userInfo.nickName,
                openID: this.userInfo.openID,
                longitude: this.userInfo.longitude,
                latitude: this.userInfo.latitude,
            }).then(info => {
                this.getKar_list = info.data
            })
        },
        // 定位
        getLocation() {
            if (this.geolocation) {
                this.map.removeControl(this.geolocation)
            }
            this.map.plugin('AMap.Geolocation', () => {
                this.geolocation = new AMap.Geolocation({
                    enableHighAccuracy: false,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：5s
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                    showButton: false
                })
                this.map.addControl(this.geolocation);
                this.geolocation.getCurrentPosition((status,result) => {
                    if(status=='complete'){
                        this.onComplete(result);
                        this.get_longitude = result.position.lng;
                        this.get_latitude = result.position.lat
                    }else{
                        this.onError(result)
                    }
                })
            })
        },

        // 计算距离
        computeDistance(lng, lat, longitude, latitude) {
            var p1 = [lng, lat];
            var p2 = [longitude, latitude];
            return (AMap.GeometryUtil.distance(p1, p2)/1000).toFixed(1)
        },

        //解析定位结果
        onComplete (data) {
            console.log('succ', data)
        },

        //解析定位错误信息
        onError (data) {
            console.log('err', data)
        },

        // 菜单点击事件
        menuClick (id, name) {
            this.$store.dispatch('common/getOperationInfoList', {
                // typeID: id,
                parentID: -1,
                userName: this.userInfo.nickName,
                openID: this.userInfo.openID,
                longitude: this.userInfo.longitude,
                latitude: this.userInfo.latitude
            }).then(res => {
                var list = res.data
                list.unshift(list[0])
                this.addMarker(list)
            })
        },

        // 业态分类下的景点
        getWayMarker(id) {
            this.$store.dispatch('common/getWayMarker', {
                userName: this.userInfo.nickName,
                openID: this.userInfo.openID,
                longitude: this.userInfo.longitude,
                latitude: this.userInfo.latitude,
                id: id,
                parentID: this.elasticMarker_ID
            }).then(res => {
                //获取已经点击的景咔点
                this.getKar();
                if (res.code == 1) {
                    res.data.forEach(item => {
                        item.kar_show = true
                        // 音乐是否显示
                        if (!item.infoAudio) {
                            item.infoAudio_show = false
                        } else {
                            item.infoAudio_show = true
                        }
                        if (this.getKar_list) {
                            this.getKar_list.forEach(j => {
                                if (j.infoID == item.id) {
                                    item.kar_show = false
                                }
                            })
                        }
                    })
                    this.recommend_list = res.data;
                }
            })
        },

        // 小火箭点击事件
        rocketBtn (id) {
            this.getWayMarker(id)
            //底部 推荐显示
            if (this.footer_list_show) {
                this.footer_list_show = false
                $(".center-btn").css({"top": "auto", "bottom": "20px"})
            } else {
                this.footer_list_show = true
                $(".center-btn").css({"top": "-33px", "bottom": "auto"})
            }
        },

        // 点标记
        addMarker (arr) {
            //手动去除数组第一个重复的
            arr.splice(0, 1);
            this.elastic_markerList = []
            for(let i in arr) {
                // 灵活点标记
                var elasticMarker = new AMap.ElasticMarker({
                    position: [arr[i].longitude, arr[i].latitude],
                    styles: [{
                        icon: {
                            img: arr[i].infoIcon,
                            size: [34.6, 40],//可见区域的大小
                            ancher: [10,20],//锚点
                            fitZoom: 14,//最合适的级别
                            scaleFactor: 2,//地图放大一级的缩放比例系数
                            maxScale: 3,//最大放大比例
                            minScale: 1//最小放大比例
                        },
                        label: {
                            content: arr[i].infoName,
                            position: 'BM',//文本位置相对于图标的基准点，
                            offset: [-30, 0],//相对position的偏移量
                        }
                    }],
                    zoomStyleMapping: {
                        10:0,
                        11:0,
                        12:0,
                        13:0,
                        14:0,
                        15:0,
                        16:0,
                        17:0,
                        18:0,
                        19:0,
                        20:0
                    }
                })

                elasticMarker.id = arr[i].id
                elasticMarker.title = arr[i].infoName
            
                elasticMarker.on("click", (e) => {
                    // 赋予elasticMarker_ID
                    this.elasticMarker_ID = e.target.id;
                    // $(".cover").css("top", "66px");
                    // $(".user-box").css("top", "66px");
                    // 显示 定位和景区
                    this.scenic_show = true;
                    //隐藏概况和列表
                    this.filter_show = false;
                    // 显示小火箭
                    this.center_btn_show = true;
                    // 显示推荐路线
                    this.marker_show = true;
                    var lnglat = e.lnglat;

                    // 去除地图上的marker
                    this.map.remove(this.elastic_markerList)

                    // 地图平移到指定位置
                    this.map.panTo([lnglat.P, lnglat.O]);
                    // 放大到指定层级
                    this.map.setZoom(15);

                    this.typeClick(this.filterList[0].id, this.filterList[0].wayName);
                    
                    //这是他写的
                    setTimeout(() => {
                        var navigation = document.getElementById('navigation')
                        var detail = document.getElementById('detail')
                        AMap.event.addDomListener(navigation, 'click', () => {
                            // this.$router.push({ path: '/navigation/' + e.target.id })

                            //这是注释掉的
                            // this.isOpenList = false
                            // this.isOpenNavigation = true
                            //跳转到地图详情页
                            // wx.miniProgram.navigateTo({url: "../naviga/naviga?id=" + e.target.id})
                            
                            this.$store.dispatch('common/getOperationInfo', {
                                userName: this.userInfo.nickName,
                                openID: this.userInfo.openID,
                                longitude: this.userInfo.longitude,
                                latitude: this.userInfo.latitude,
                                id: e.target.id
                            }).then(res => {
                                var data = res.data
                                wx.openLocation({
                                    latitude: +data.latitude,
                                    longitude: +data.longitude,
                                    name: data.infoName,
                                    address: data.address,
                                    scale: 16
                                })
                            })

                        })
                        AMap.event.addDomListener(detail, "click", () => {
                           
                        })
                    }, 100)
                })
                this.elastic_markerList.push(elasticMarker)
            }
            // 将创建的点标记添加到已有的地图实例：
            this.map.add(this.elastic_markerList)
        },

        /**
         * 点击topView切换topView
         */
        typeClick(id, name) {
            // 推荐名称变更
            this.recommend_name = name;
            // 切换之前先清除之前marker点
            this.map.remove(this.markerList);
            // 关闭底下详情
            this.ka_show = false;

            this.addLittleMarker(this.elasticMarker_ID, id)
        },

        /**
         * 小的marker点
         */
        addLittleMarker(parentID, typeID) {
            this.top_view_type_ID = typeID;
            this.$store.dispatch('common/getOperationInfoList', {
                userName: this.userInfo.nickName,
                openID: this.userInfo.openID,
                longitude: this.userInfo.longitude,
                latitude: this.userInfo.latitude,
                // id: typeID,
                parentID: parentID
            }).then(res => {
                //获取已经点击的景咔点
                this.getKar();
                if (res.code == 1) {
                    res.data.forEach(item => {
                        item.kar_show = true
                        // 音乐是否显示
                        if (!item.infoAudio) {
                            item.infoAudio_show = false
                        } else {
                            item.infoAudio_show = true
                        }
                        if (this.getKar_list) {
                            this.getKar_list.forEach(j => {
                                if (j.infoID == item.id) {
                                    item.kar_show = false
                                }
                            })
                        }
                    })
                    this.recommend_list = res.data;
                }

                // 渲染咔点
                var has_audio;
                // 筛选出包有语音的点
                has_audio = res.data.filter(item => {
                    if (item.infoAudio) {
                        return item
                    }
                })
                const marker_arr = has_audio;
                this.markerList = [];

                for (let j in marker_arr) {
                    var marker = new AMap.ElasticMarker({
                        position: [marker_arr[j].longitude, marker_arr[j].latitude],
                        styles: [{
                            icon: {
                                img: marker_arr[j].infoIcon,
                                size: [34.6, 40],//可见区域的大小
                                ancher: [10,20],//锚点
                                fitZoom: 14,//最合适的级别
                                scaleFactor: 1,//地图放大一级的缩放比例系数
                                maxScale: 1,//最大放大比例
                                minScale: 1//最小放大比例
                            },
                            label: {
                                content: marker_arr[j].infoName,
                                position: "BM",//文本位置相对于图标的基准点，
                                offset: [-45, 0],//相对position的偏移量
                            }
                        }],
                        extData: {id: marker_arr[j].id},
                        zoomStyleMapping: {
                            10:0,
                            11:0,
                            12:0,
                            13:0,
                            14:0,
                            15:0,
                            16:0,
                            17:0,
                            18:0,
                            19:0,
                            20:0
                        }
                    });
                    marker.on("click", (event) => {
                        // 景咔状态都是对的 
                        this.ka_info.kar_state = true;
                        // 关闭小火箭
                        this.center_btn_show = false;
                        //获取用户自定义id
                        var extData_ID = event.target.getExtData().id;
                        // 景点id
                        this.scenic_ID = extData_ID;
                        
                        // 首先判断景咔是否已经点过了
                        this.$store.dispatch('common/getKar', {
                            userID: 1,
                            userName: this.userInfo.nickName,
                            openID: this.userInfo.openID,
                            longitude: this.userInfo.longitude,
                            latitude: this.userInfo.latitude,
                        }).then(info => {
                            this.getKar_list = info.data
                            console.log(info)
                        })
                        
                        this.$store.dispatch('common/getOperationInfo', {
                            userName: this.userInfo.nickName,
                            openID: this.userInfo.openID,
                            longitude: this.userInfo.longitude,
                            latitude: this.userInfo.latitude,
                            id: extData_ID
                        }).then(res => {
                            if (res.code == 1) {
                                this.ka_show = true;
                                // 景咔信息录入
                                this.ka_info.name = res.data.infoName;
                                this.ka_info.desc = res.data.infoDesc;
                                this.ka_info.address = res.data.address;
                                this.ka_info.distance = this.computeDistance(this.get_longitude, this.get_latitude, res.data.longitude, res.data.latitude);
                                this.ka_info.audio = res.data.infoAudio;
                                this.audio_SRC = res.data.infoAudio;
                                this.ka_info.longitude = res.data.longitude;
                                this.ka_info.latitude = res.data.latitude;
                            }
                            // 匹配景咔是否已经点过了
                            setTimeout(() => {
                                if (this.getKar_list) {
                                    this.getKar_list.forEach(item => {
                                        if (item.infoID == res.data.id) {
                                            this.ka_info.kar_state = false
                                        }
                                    })
                                }
                            }, 200)
                        })
                        // 点击的marker点在上面
                        event.target.setTop(true);

                        // 这是点击icon变换大小
                        self.selectedMarkerStore = event.target.getExtData()
                        if (self.lastClickedMarker) {
                            let icon = self.lastClickedMarker.getIcon()
                            self.lastClickedMarker.setIcon(
                                new AMap.Icon({
                                    image: marker_arr[j].infoIcon,
                                    size: new AMap.Size(25, 28),
                                    imageSize: new AMap.Size(25, 28)
                                })
                            )
                        }
                        let icon2 = event.target.getIcon();
                        event.target.setIcon(
                            new AMap.Icon({
                                image: marker_arr[j].infoIcon,
                                size: new AMap.Size(40, 44),
                                imageSize: new AMap.Size(40, 44)
                            })
                        )

                        // 如果点击最后一个icon，infoWindow隐藏了，那就把最后一个icon也给隐藏了
                        this.map.on("click", function() {
                            this.ka_show = false;
                            //如果infowindow不存在
                            if ($(".amap-info-contentContainer")) {
                                // 图标就让它变小
                                self.lastClickedMarker.setIcon(
                                    // 放入一个新的icon对象
                                    new AMap.Icon({
                                        image: marker_arr[j].infoIcon,
                                        size: new AMap.Size(25, 28),
                                        imageSize: new AMap.Size(25, 28)
                                    })
                                )
                            }
                        }.bind(this))

                        self.lastClickedMarker = event.target
                    })
                    this.markerList.push(marker)
                }
                this.map.add(this.markerList)
            })
        },


        /**
         * 更新进度条和当前播放时间
         * @param audio audio对象
         */
        updateProgress(audio) {
            // 音频当前时间/总时间
            const value = audio.currentTime / audio.duration;
            $("#progressBar").css("width", value*100 + "%");
            $("#progressDot").css("left", value*100 + "%");
            //时间
            this.currentTime = this.transTime(audio.currentTime);
        },
        /**
         * 音频播放时间换算
         * @param value 当前播放时间
         */
        transTime(value) {
            let time = "";
            const h = parseInt(value / 3600);
            value %= 3600;
            const m = parseInt(value / 60);
            const s = parseInt(value % 60);
            if (h > 0) {
                time = this.formatTime(h + ":" + m + ":" + s)
            } else {
                time = this.formatTime(m + ":" + s)
            }
            return time
        },
        /**
         * 格式化时间显示，补0对齐
         * @param value 形如 h:m:s 的字符串
         */
        formatTime(value) {
            let time = "";
            let s = value.split(":");
            let i = 0;
            for(; i < s.length - 1; i++) {
                time += s[i].length == 1 ? ("0" + s[i]) : s[i];
                time += ":";
            }
            time += s[i].length == 1 ? ("0" + s[i]) : s[i];

            return time
        },
        /**
         * 鼠标拖动进度点时可以调节进度 
         * * @param {*} audio 
         */ 
        dragProgressDotEvent(audio) {
            var that = this;
            var dot = document.getElementById('progressDot'); 
            var position = { 
                oriOffestLeft: 0, // 移动开始时进度条的点距离进度条的偏移值 
                oriX: 0, // 移动开始时的x坐标 
                maxLeft: 0, // 向左最大可拖动距离 
                maxRight: 0 // 向右最大可拖动距离 
            }; 
            var flag = false; // 标记是否拖动开始 
            // 鼠标按下时 
            dot.addEventListener('mousedown', down, false); 
            dot.addEventListener('touchstart', down, false); 
            // 开始拖动 
            document.addEventListener('mousemove', move, false); 
            document.addEventListener('touchmove', move, false); 
            // 拖动结束 
            document.addEventListener('mouseup', end, false); 
            document.addEventListener('touchend', end, false); 
            function down(event) { 
                if (!audio.paused || audio.currentTime != 0) { 
                    // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以 
                    flag = true; 
                    position.oriOffestLeft = dot.offsetLeft; 
                    position.oriX = event.touches ? event.touches[0].clientX : event.clientX; 
                    // 要同时适配mousedown和touchstart事件 
                    position.maxLeft = position.oriOffestLeft; 
                    // 向左最大可拖动距离 
                    position.maxRight = document.getElementById('progressBar-bg').offsetWidth - position.oriOffestLeft; 
                    // 向右最大可拖动距离 
                    // 禁止默认事件（避免鼠标拖拽进度点的时候选中文字） 
                    if (event && event.preventDefault) { 
                        event.preventDefault(); 
                    } else { 
                        event.returnValue = false; 
                    } 
                    // 禁止事件冒泡 
                    if (event && event.stopPropagation) { 
                        event.stopPropagation();
                    } else { 
                        window.event.cancelBubble = true; 
                    } 
                } 
            } 
            function move(event) { 
                if (flag) { 
                    var clientX = event.touches ? event.touches[0].clientX : event.clientX; 
                    // 要同时适配mousemove和touchmove事件 
                    var length = clientX - position.oriX; 
                    if (length > position.maxRight) { 
                        length = position.maxRight; 
                    } else if (length < -position.maxLeft) { 
                        length = -position.maxLeft; 
                    } 
                    var pgsWidth = $('#progressBar-bg').width(); 
                    var rate = (position.oriOffestLeft + length) / pgsWidth; 
                    audio.currentTime = audio.duration * rate; 
                    that.updateProgress(audio); 
                } 
            } 
            function end() { 
                flag = false; 
            } 
        }, 
    }
}
</script>

<style lang="stylus">
@import '../assets/styles/markCard.styl'
.amap-marker-label
    font-size: 12px;
    padding: 3px 6px
    text-align: center;
    font-family: STLiti;
    color: #5f79c0;
    border-radius: 10px;
    background-color: #fff;
    border: solid 1px #81a2fc;

#home
    position relative
    width 100%
    height 100vh
    .integral-show
        position absolute
        top 50%
        left 50%
        z-index 1000
        transform translate(-50%,-50%)
        background-color #111;
        opacity 0.7
        padding 0 10px
        border-radius 5px
        text-align center
        img
            margin-top 30px
        p
            color #fff
            margin-top 20px
            font-size 14px
            padding-bottom 20px
    #background-audio
        position absolute
        right -5px
        bottom 20px
        background-color rgba(0, 0, 0, .48)
    .position-scenic
        box-sizing border-box
        width 100%
        position absolute
        bottom 100px
        display flex
        justify-content space-between
        padding 0 20px
        .position
            color #9b9b9b
        .scenic
            color #9b9b9b
        div
            width 30px
            height 30px
            background-color #fff
            padding 10px
            text-align center
            border-radius 5px
            img
                width 18px
                height 18px
    .scenic-spot
        width 100%
        z-index 2
        position absolute
        bottom 0
        background-color #fff
        .scenic-spot-close
            position absolute
            top 12px
            right 10px
            width 20px
            height 20px
        .title 
            font-size 18px
            margin-top 10px
            color #000
            padding 0 20px
            font-weight bold
            display flex
            align-items center
            div 
                font-size 18px
                color #000
            span
                color #5dcf6b
                padding 1px 
                border-radius 5px
                border solid 1px #5dcf6b
                font-weight normal
                margin-left 5px
        .text 
            color #a2a2a2
            font-size 14px
            margin-top 5px
            padding 0 20px 10px
            max-height 150px
            overflow auto
        .list
            display flex
            border-top solid 1px #d2d2d6
            padding 10px 20px
            div
                flex 1
                text-align center
                img
                    width 30px
                    height 30px
                    vertical-align middle
                    margin-right -7px
                span
                    display inline-block
                    vertical-align middle
                    color #81a2fc
                    font-size 16px
    #progress 
        width 100%
        height 50px
        background-color #fff
        position absolute
        top -50px
        border-bottom 2px solid #d2d2d6
        #audio-pause 
            width 35px
            height 35px
            position absolute
            top 8px
            left 8px
        #audio-close
            width 30px
            height 30px
            position absolute
            right 0
            top 0
            img 
                position absolute
                bottom 0
                left 0
                width 20px
                height 20px
        #audio-name
            position absolute
            top 7px
            left 48px
            color #a2a2a2
            font-size 14px
        #audio-time 
            color #a2a2a2
            position absolute
            top 8px
            right 11%
        #progressBar-bg 
            position absolute
            width 75%
            height 2px
            background-color rgb(238,238,238)
            top 34px
            left 53px
            cursor pointer
            #progressBar
                position absolute
                width 0
                height 2px
                background-color rgb(129,162,252)
                top 0
                left 0
            #progressDot 
                box-sizing border-box
                content: " ";
                width: 40px;
                height: 40px; 
                border-radius: 50%; 
                -moz-border-radius: 50%; 
                -webkit-border-radius: 50%; 
                position: absolute; 
                left: 0; 
                top: 50%; 
                margin-top: -20px; 
                margin-left: -20px;
                #progressDot-child
                    position absolute
                    left 50%
                    top 50%
                    margin-top -5px
                    margin-left -5px
                    width 10px
                    height 10px
                    border-radius: 50%; 
                    -moz-border-radius: 50%; 
                    -webkit-border-radius: 50%; 
                    background-color: rgb(129,162,252); 
    .amap-wrapper
        width 100%
        height 100%
        #map
            width 100%
            height 100%
    .cover
        position absolute
        z-index 1000
        left 10px
        top 16px
        width 154px
        height 40px
        background #000
        opacity .5
        border-radius 40px
    .user-box
        position absolute
        z-index 1001
        left 10px
        top 16px
        width 154px
        height 40px
        color #fff
        .user-avater
            float left
            width 40px
            height 40px
            border-radius 40px
            overflow hidden
            img
                width 100%
                height 100%
        .weather
            width 100px
            float left
            margin-left 10px
            margin-top 3px
            p:first-child
                width 100%
                overflow hidden
                text-overflow ellipsis
                white-space nowrap
    .tool-box
        position absolute
        top 10px
        right 10px
        z-index 1000
        li
            width 50px
            height 50px
            margin-bottom 10px
            background #fff
            padding 10px
            box-sizing border-box
            box-shadow: 0px 0px 6px 0 #eee
            border-radius 5px
            text-align center
            img
                width 60%
                height 60%
    .topView
        position absolute
        top 0
        z-index 40
        background #fff
        width 100%
        height 50px
        overflow-x scroll
        -webkit-overflow-scrolling touch
        border-bottom 1px solid #eee
        .box
            position absolute
            z-index 30
            height 60px
            ul
                position absolute
                li
                    float left
                    width 68px
                    height 50px
                    box-sizing border-box
                    border-radius 5px
                    text-align center
                    p
                        margin-top 15px
                        display inline-block
                        font-size 14px
                        border-bottom 3px solid #fff
                        padding-bottom 5px
                        border-radius 2px
    .footer
        position absolute
        z-index 1000
        bottom 0
        left 0
        background #fff
        width 100%
        .view
            position absolute
            top 0
            z-index 40
            background #fff
            width 336px
            height 60px
            overflow-x scroll
            -webkit-overflow-scrolling touch
            border-bottom 1px solid #eee
            .box
                position absolute
                z-index 30
                height 60px
                ul
                    position absolute
                    li
                        float left
                        width 68px
                        height 60px
                        padding 10px
                        box-sizing border-box
                        border-radius 5px
                        text-align center
                        p
                            display inline-block
                            font-size 16px
                            border-bottom 2px solid #71a3ff
                            padding-bottom 10px
        .introduce 
            position absolute
            top -160px
            right 10px
            width 50px
            height 50px
            background #fff
            padding 10px
            box-sizing border-box
            border-radius 5px
            text-align center
            box-shadow: 0 0 25px 5px #eee
            img
              width 60%
              height 60%
        .filter
            position absolute
            bottom 50px
            right 10px
            div 
                width 50px
                height 50px
                background #fff
                padding 10px
                box-sizing border-box
                border-radius 5px
                text-align center
                box-shadow: 0 0 25px 5px #eee
                margin-top: 10px
                img
                    width 60%
                    height 60%
                p
                    color: #9b9b9b
        .btn
            position absolute
            z-index 6
            right 0
            top 0
            width 50px
            height 50px
            background #fff
            text-align center
            border-left 1px solid #eee
            img
                position absolute
                top 50%
                left 50%
                margin-left -10px
                margin-top -5px
                width 20px
                height 10px
        .center-btn
            position absolute
            z-index 20
            bottom 20px
            left 50%
            width 60px
            height 60px
            margin-left -30px
            background-color: #fff
            border-radius: 50%
            text-align center
            line-height: 70px
            img
                width 35px
                height 25px
        .footer-list
            position relative
            .recommend-route
                color #6aa5fc
                font-size 16px
                text-align center
                margin-top 25px
                padding-left 5px
                p
                    display inline-block
                    vertical-align middle
                span 
                    display inline-block
                    height 1px
                    width 39%
                    background #d2d2d6
                    vertical-align middle
            ul
                overflow auto
                max-height 410px
                margin 20px 0
                padding 0 10px 0 20px
                li:last-of-type
                    .left
                        span
                            height 0
                li
                    position relative
                    margin-top 10px
                    .left
                        position absolute
                        top 5px
                        text-align center
                        width 23px
                        p
                            font-size 14px
                            line-height 23px
                            color #81a2fc
                            width 23px
                            height 30px
                            background url("../assets/images/datouzhen.png") no-repeat center/cover
                        span
                            margin-top 3px
                            display inline-block
                            width 2px
                            height 109px
                            background #81a2fc
                    .right
                        margin-left 32px
                        box-sizing border-box
                        width 89.5%
                        padding 10px 0
                        border 1px solid #d2d2d6
                        border-radius 5px
                        h6
                            font-size 18px
                            color #000
                            font-weight normal
                            max-width 160px
                            white-space nowrap
                            overflow hidden
                            text-overflow ellipsis
                        p
                            margin-top 5px
                            color #a2a2a2
                            font-size 12px
                            margin-right 5px
                            overflow hidden
                            height 32px
                        .top
                            padding 0 10px 10px
                            display flex
                            justify-content space-between
                            img
                                width 29.6%
                                height 62px
                        .bottom
                            display flex
                            border-top solid 1px #d2d2d6
                            padding 10px 0 0
                            div
                                flex 1
                                text-align center
                                img
                                    width 30px
                                    height 30px
                                    vertical-align middle
                                    margin-right -7px
                                span
                                    display inline-block
                                    vertical-align middle
                                    color #81a2fc
                                    font-size 14px

            .title
                position relative
                border-bottom solid 1px #eee
                height 60px
                line-height 60px
                .type
                    background #fff
                    color rgb(20, 189, 122)
                    padding 5px 8px
                    border-radius 5px
                    border 1px solid rgb(20, 189, 122)
                    margin-left 10px
                .active
                    background rgb(20, 189, 122)
                    color #fff
                .instr
                    float right
                    margin-right 30px
                    i
                        position relative
                        top 5px
                        right 5px
                        display inline-block
                        width 20px
                        height 20px
                        background url('../assets/images/instruct@2x.png') no-repeat
                        background-size 100% 100%
            ul.list
                margin-bottom 20px
                li
                    border-bottom 1px solid #eee
                    overflow hidden
                    height 50px
                    line-height 50px
                    span:first-child
                        display inline-block
                        font-weight bold
                        margin-left 20px
                        margin-right 30px
                    span:nth-child(2)
                        color #666
                    p
                        position relative
                        float right
                        margin-right 30px
                        line-height 50px
                        width 50px;
                        height 50px;
                        img
                            position absolute
                            top 50%
                            margin-top -9px
                            left 50%
                            margin-left -20px
                            width 40px
                            height 18px
    .filter-box
      width 100%
      position absolute
      z-index 1005
      bottom 0
      .title
        position relative
        height 50px
        background #fff
        border-bottom 1px solid #eee
        line-height 50px
        text-align center
        font-size 1.3rem
        img
          position absolute
          top 50%
          margin-top -5px
          width 10px
          height 10px
          right 20px
      .body
        background #fff
        width 100%
        .filter-row
          width 90%
          margin 0 auto
          .filter-item
            width 15%
            height 40px
            margin-right 6%
            margin-bottom 6%
            margin-top 6%
            float left
            text-align center
            img
                width 50%
                height 60%
          .filter-item:nth-child(5n+5)
            margin-right 0
    .navigation-box
        position absolute
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
