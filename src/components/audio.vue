<template>
    <div id="comp-audio">
        <div id="map" @touchmove.prevent></div>
        <div class="select-top">
            <div class="left" @click="leftSelectClick">
                <span v-if="!area.currentName">千岛湖全域</span>
                <span v-else>{{ area.currentName }}</span>
                <img src="../images/audio-area.svg" alt="">
            </div>
            <div class="right" @click="rightSelectClick">
                <span>{{ type.currentName }}</span>
                <img src="../images/audio-zhankai.svg" alt="">
            </div>
        </div>
        <!-- 语音播放器 -->
        <audio id="audio" :src="audioSrc"></audio>
        <div id="progress" v-if="progressShow">
            <img id="audio-pause" @click="controlAduio(audioPause)" v-if="audioPause" src="../images/pause-2@3x.png" />
            <img id="audio-pause" @click="controlAduio(audioPause)" v-else src="../images/play@3x.png" />
            <div id="progressBar-bg">
                <div id="progressBar"></div>
                <div id="progressDot">
                    <div id="progressDot-child"></div>
                </div>
            </div>
            <div id="audio-close" @click="shutAudioFun">
                <img src="../images/audio-close.svg" />
            </div>
            <p id="audio-name">{{ audioName }}</p>
            <div id="audio-time">
                <span>{{ currentTime }}</span>
                /
                <span>{{ totalTime }}</span>
            </div>
        </div>
        <!-- 个人信息 -->
        <div class="personal-detail" :class="progressShow ? '' : 'active'">
            <img :src="user.result.userHeadImgUrl" alt="">
            <div class="right">
                <div class="right-top">
                    <span>{{ user.result.userName }}</span>
                    <span>{{ user.result.userIntegral }}积分</span>
                </div>
                <div class="right-bottom">
                    <span>{{ personInformation.temp }}</span>
                    <span>千岛湖</span>
                </div>
            </div>
        </div>
        <!-- 景区选择 -->
        <div class="select-area" v-if="leftSelect.expand">
            <div class="left">
                <div :class="area.areacurrent == item.areaID ? 'active' : ''" 
                    v-for="(item, index) in area.arealist" 
                    :key="String(index)" 
                    :data-id="item.areaID" 
                    @click="clickAreaFun">{{ item.areaName }}</div>
            </div>
            <div class="right">
                <div :class="area.spotcurrent == item.spotsID ? 'active' : ''" 
                v-for="(item, index) in area.spotlist" 
                :key="String(index)" 
                :data-name="item.spotsName" 
                :data-id="item.spotsID" 
                :data-lng="item.longitude" 
                :data-lat="item.latitude" 
                @click="clickSpotFun">{{ item.spotsName }}</div>
            </div>
        </div>
        <!-- 分类选择 -->
        <div class="select-expand" v-if="rightSelect.expand">
            <div :class="type.currentID == item.typeID ? 'active' : ''" 
                v-for="(item, index) in type.list" 
                :key="String(index)" 
                @click="clickTypeFun(item.typeID, item.showType, item.typeName, item.mapIcon)">
                <img v-if="type.currentID == item.typeID" :src="item.imgUrl" alt="">
                <img v-else :src="item.unImgUrl" alt="">
                <span>{{ item.typeName }}</span>
            </div>
        </div>
        <!-- 黑色背景 -->
        <div class="shadom" v-if="shadom.show" @click="clickShadomFun"></div>
        <!-- <div class="speechPointSwitch" @click="speechPointFun">
            <img v-if="speechPoint.show" src="../assets/images/ic_drawmap_guider_voice_on.png" alt="">
            <img v-else src="../assets/images/ic_drawmap_guider_voice_off.png" alt="">
            <div v-if="speechPoint.show">语音讲解</div>
            <div v-else style="color: #979797">语音讲解</div>
        </div> -->
        <div class="map-switch">
            <mt-switch v-model="value" @change="switchchangeFun"></mt-switch>
            <div class="text">手绘地图</div>
        </div>
        <div class="location" @click="positionfixed">
            <img src="../images/gps_able.png" alt="">
            <div>定位</div>
        </div>
        <div class="qdh-shade" v-if="shade.show">
            <img src="../assets/images/feiji.gif" alt="">
        </div>
        <!-- 回到地图景区 -->
        <div class="backToCenter" @click="backToCenterFun" v-show="backToCenter.show">
            <img src="../assets/images/spot_selected.png" alt="">
            回景区
        </div>
    </div>
</template>

<script>
import { getArea, getType, getUserInfo, getMarker, audioInfo } from '../api/audio'
import { GetDistance } from '../utils/common'
export default {
    name: 'comp-audio',
    data () {
        return {
            backToCenter: {
                show: false
            },
            speechPoint: {
                show: true
            },  // 语音点
            shade: {
                show: true
            },
            audioName: '',  //  正在播放语音的名称
            audioSrc: '',   // 播放链接
            progressShow: false,    // 播放器开关
            audioPause: false,  // 是否显示播放暂停
            currentTime: "00:00",
            totalTime: "00:00",
            shadom: {
                show: false
            },  //  显示背景的阴影
            lnglat: {
                lng: 120,
                lat: 30,
            },  // 用户当前经纬度
            map: null,
            user: {
                result: {}
            },  //  用户个人信息
            area: {
                arealist: [],
                spotlist: [],
                areacurrent: -1, // 当前景区ID, -1是全域
                spotcurrent: -1,  //  当前景点ID
                currentName: '' //  当前选中景点的名称
            },
            type: {
                list: [],
                currentID: 0,
                currentType: 0,
                currentName: '',
                lastClick: 0,
                mapIcon: '' //  如果mark点的图标为空，就用mapIcon
            },
            personInformation: {
                temp: '',
            },  //  个人信息
            value: true,
            leftSelect: {
                expand: false
            },
            rightSelect: {
                expand: false
            },  // 右侧选择
            geolocation: null,  //  定位对象
            tilerLayer: {
                layer1: null,
                layer2: null,
                layer3: null
            },  // tilerLayer对象
            markerList: [],  //  marker集合
            voiceList: [],  //  语音点集合
            maodianList: []  //  锚点列表
        }
    },
    created() {
        this.getUserFun();
        this.getAreaListFun();
        this.getTypeListFun();
        // 这一期语音点没有分区域配置好，所以先一次全部渲染出来
        
    },
    computed: {
        // 动态监测type值的变化
        computedTypeFun() {
            return this.type.currentType
        }
    },
    watch: {
        // 动态监测type值的变化
        computedTypeFun(val) {
            // 只在切换到景点的时候才显示语音点
            if (val == 1) {
                // 判断语音点列表是否为空，为空的话对语音点列表初始化
                // 不为空显示
                if (this.voiceList.length == 0) {
                    this.getAudioInfoListFun()
                } else {
                    this.voiceList.forEach(function(item) {
                        item.show()
                    })
                }
                // 锚点隐藏
                this.maodianList.forEach(function(item) {
                    item.hide();
                })
            } else {
                // 让语言点隐藏
                if (this.voiceList.length != 0) {
                    // 不为空隐藏
                    this.voiceList.forEach(function(item) {
                        item.hide()
                    })
                }
                // 锚点显示
                this.maodianList.forEach(function(item) {
                    item.show();
                })
            }
        }
    },
    mounted() {
        const _this = this;
        this.map = new AMap.Map('map', {
            zooms: [9, 18], // 级别
            center: [119.021599, 29.586915],  //中心点坐标
            viewMode: '2D',  //设置地图模式
            lang:'zh_cn',  //设置地图语言类型
            features: ['bg', 'road', 'point']
        });
        //加载天气查询插件
        AMap.plugin('AMap.Weather', function() {
            //创建天气查询实例
            const weather = new AMap.Weather();
            //执行实时天气信息查询
            weather.getLive('淳安县', function(err, data) {
                if (err) {
                    alert('获取天气信息失败')
                } else {
                    this.personInformation.temp = `${data.weather} ${data.temperature}℃`;
                }
            }.bind(this));
        }.bind(this));

        AMap.plugin('AMap.Geolocation', function() {
            var geolocation = new AMap.Geolocation({
                // 是否使用高精度定位，默认：true
                enableHighAccuracy: true,
                // 设置定位超时时间，默认：无穷大
                timeout: 10000,
                //  是否显示定位按钮, 默认: true
                showButton: false,
                //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                zoomToAccuracy: false,
            })
            geolocation.getCurrentPosition()
            AMap.event.addListener(geolocation, 'complete', onComplete)
            AMap.event.addListener(geolocation, 'error', onError)
            function onComplete (data) {
                _this.lnglat.lng = data.position.lng;
                _this.lnglat.lat = data.position.lat;
                console.log(data)
            }
            function onError (data) {
                // 定位出错
                console.log(data)
            }
        })

        // 这是覆盖了手绘地图的对象
        this.tilerLayer.layer1 = new AMap.TileLayer({
            zIndex: 100,
            getTileUrl: function(x,y,z) {
                return `https://demo.magicreal.net/new/tiles/${z}/${x}_${y}.png`
            }
        });
        this.tilerLayer.layer1.setMap(this.map)

        this.tilerLayer.layer2 = new AMap.TileLayer({
            zIndex: 100,
            getTileUrl: function(x,y,z) {
                return `https://demo.magicreal.net/new/tiles1/${z}/${x}_${y}.png`
            }
        });
        this.tilerLayer.layer2.setMap(this.map)

        this.tilerLayer.layer3 = new AMap.TileLayer({
            zIndex: 100,
            getTileUrl: function(x,y,z) {
                return `https://demo.magicreal.net/new/tiles2/${z}/${x}_${y}.png`
            }
        });
        this.tilerLayer.layer3.setMap(this.map)

        // 点击地图其他区域关闭信息窗口
        this.map.on('click', function() {
            this.closeInfoWindow()
        }.bind(this))

        // 遮罩
        this.setDistrictSearchFun();

        // 移动地图的时候触发回调函数
        // 判断你是不是在淳安县
        this.map.on('moveend', function() {
            this.map.getCity(function(info) {
                if (info.district == '淳安县') {
                    // 隐藏回景区
                    this.backToCenter.show = false;
                } else {
                    // 显示回景区
                    this.backToCenter.show = true;
                }
            }.bind(this));
        }.bind(this))

        // iphoneX距离底部68px安全区
        // iphonex的位置向上偏移点
        let u = navigator.userAgent;
        let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isIOS) {        
            if (screen.height == 812 && screen.width == 375){
                // 是iphonex
                $('.location').css('bottom', '0.99rem');
                $('.map-switch').css('bottom', '2.09rem');
                $('.backToCenter').css('bottom', '2.09rem');
            } else {
                // 不是iphonex
            }
        }
    },
    
    methods: {
        /**回到地图中心（千岛湖景区）的函数 */
        backToCenterFun() {
            // 隐藏回景区 这个按钮
            this.backToCenter.show = false;
            // 地图层级缩小到9
            this.map.setZoom(9);
            // 跳转到千岛湖中心位置
            this.map.panTo([119.021599, 29.586915]);
        },

        /**覆盖遮罩 */
        setDistrictSearchFun() {
            AMap.plugin('AMap.DistrictSearch', function() {
                new AMap.DistrictSearch({
                    extensions: 'all',
                    subdistrict: 0
                }).search('淳安县', function(status, result){
                    // 外多边形坐标数组和内多边形坐标数组
                    var outer = [
                        new AMap.LngLat(-360,90,true),
                        new AMap.LngLat(-360,-90,true),
                        new AMap.LngLat(360,-90,true),
                        new AMap.LngLat(360,90,true),
                    ];
                    var holes = result.districtList[0].boundaries
                    // 如果需要设置腾冲市周边遮罩 var pathArray = [outer];
                    var pathArray = [];
                    pathArray.push.apply(pathArray, holes)
                    new Promise((resolve, reject) => {
                        this.polygon = new AMap.Polygon({
                            pathL: pathArray,
                            strokeColor: "#00eeff",
                            strokeWeight: 2,
                            fillColor: "#71B3ff", //#71B3ff
                            fillOpacity: 0.1,
                            zIndex: 1000
                        });
                        resolve(this.polygon)
                    }).then(res => {
                        this.polygon.setPath(pathArray);
                        this.map.add(this.polygon);
                    })
                }.bind(this))
            }.bind(this))
        },

        /**定位 */
        positionfixed() {
            const _this = this;
            AMap.plugin('AMap.Geolocation', function() {
                // 移除控件
                if (this.geolocation) {
                    this.map.removeControl(this.geolocation)
                }
                this.geolocation = new AMap.Geolocation({
                    // 是否使用高精度定位，默认：true
                    enableHighAccuracy: true,
                    // 设置定位超时时间，默认：无穷大
                    timeout: 10000,
                    //  是否显示定位按钮, 默认: true
                    showButton: false,
                    //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    zoomToAccuracy: true,      
                })
                this.map.addControl(this.geolocation);
                this.geolocation.getCurrentPosition()
                AMap.event.addListener(this.geolocation, 'complete', onComplete)
                AMap.event.addListener(this.geolocation, 'error', onError)
                function onComplete(data) {
                    _this.lnglat.lng = data.position.lng;
                    _this.lnglat.lat = data.position.lat;
                    console.log(data)
                    this.map.getCity(function(info) {
                        if (info.district == '淳安县') {
                            // 隐藏回景区
                            _this.backToCenter.show = false;
                        } else {
                            // 显示回景区
                            _this.backToCenter.show = true;
                        }
                    });
                }
                function onError(data) {
                    // 定位出错
                    console.log(data)
                }
            }.bind(this))
        },

        /**获取用户信息 */
        getUserFun() {
            // url的形式是...?typeID=1&openID=hsdfhjshdfkjhsd/#/这种形式
            const openID = location.href.split('openID=')[1].split('maptypeID=')[0];
            // const openID = 'o3UEB5d3iW_2Y2vVsV0G4bky6gPk';
            // o3UEB5d3iW_2Y2vVsV0G4bky6gPk
            getUserInfo({ openID: openID }).then(res => {
                if (res.code != 1) {
                    alert('获取用户信息失败');
                    return false
                }
                this.user.result = res.data.user
            }).catch(() => {
                alert('获取用户信息失败')
            })
        },

        /**右侧分类点击展开分类列表 */
        rightSelectClick() {
            // 显示点击后变成不显示，不显示点击后显示
            this.rightSelect.expand = !this.rightSelect.expand;
            // 分类选择和景区选择只能显示一个
            if (this.rightSelect.expand) {
                this.leftSelect.expand = false
            }
            // 显示阴影
            if (!this.rightSelect.expand && !this.leftSelect.expand) {
                this.shadom.show = false                
            } else {
                this.shadom.show = true
            }
        },

        /**点击左侧区域展开区域列表 */
        leftSelectClick() {
            this.leftSelect.expand = !this.leftSelect.expand;
            if (this.leftSelect.expand) {
                this.rightSelect.expand = false
            }
            // 显示阴影
            if (!this.rightSelect.expand && !this.leftSelect.expand) {
                this.shadom.show = false                
            } else {
                this.shadom.show = true
            }
        },

        /**点击阴影 */
        clickShadomFun() {
            this.leftSelect.expand = false;
            this.rightSelect.expand = false;
            this.shadom.show = false;
        },

        /**获取选择区域列表的函数 */
        getAreaListFun() {
            getArea().then(res => {
                if (res.resultCode != 1) {
                    alert('获取类型列表失败');
                    return false
                }
                this.area.arealist = res.module;
                // 添加千岛湖全域
                res.module[0].spotsListVOs.unshift({
                    longitude: 119.021599,
                    latitude: 29.586915,
                    spotsID: -1,
                    spotsName: '千岛湖全域'
                })
                // 区域列表下的默认景点列表
                this.area.spotlist = res.module[0].spotsListVOs;
            }).catch(() => {
                alert('获取区域列表失败')
            })
        },

        /**获取选择类型的函数 */
        getTypeListFun() {
            // url的形式是...?typeID=1&openID=hsdfhjshdfkjhsd/#/这种形式
            // +typeID 把typeOf转化为number类型，如果typeID不是数字就是NaN
            const typeID = +location.href.split('openID=')[1].split('maptypeID=')[1].split('mapTitle')[0];
            const mapTitle = location.href.split('openID=')[1].split('mapTitle=')[1].split('#')[0];
            // const typeID = 1;
            // const mapTitle = 1;
            if (mapTitle == 1) {
                document.title = '语音导览';
            } else if (mapTitle == 2) {
                document.title = '找厕所'
            } else if (mapTitle == 3) {
                document.title = '周边服务'
            }
            // const typeID = 1;
            // !! == Boolean()
            if (!!typeID) {
                this.type.currentType = typeID
            }
            getType().then(res => {
                if (res.resultCode != 1) {
                    alert('获取类型列表失败');
                    return false
                }
                this.type.list = res.module;
                // 如果currentType不存在默认选择type列表的第一个type
                if (this.type.currentType) {
                    // 遍历types, 每一项和currentType比较
                    for (let item of res.module) {
                        if (item.typeID == this.type.currentType) {
                            this.type.currentID = item.typeID;
                            this.type.currentName = item.typeName;
                            this.type.mapIcon = item.mapIcon;
                        }
                    }
                } else {
                    this.type.currentType = res.module[0].showType;
                    this.type.currentID = res.module[0].typeID;
                    // 默认选择第一个
                    this.type.currentName = res.module[0].typeName;
                    // marker点类型图标
                    this.type.mapIcon = res.module[0].mapIcon;
                }
                this.getMarkersFun(this.type.currentType);
            }).catch(() => {
                alert('获取类型列表失败')
            })
        },

        /**获取语音点 */
        getAudioInfoListFun() {
            // 清除之前的语音点
            // if (this.voiceList.length !== 0) {
            //     this.map.remove(this.voiceList)
            // }
            // // maker数组为空
            // this.voiceList = [];
            audioInfo({ areaID: this.area.areacurrent }).then(res => {
                if (res.resultCode != 1) {
                    alert('获取语音点失败');
                    return false
                }
                // 获取语音点成功
                const infoWindow = new AMap.InfoWindow({
                    isCustom: true,  //使用自定义窗体
                    offset: new AMap.Pixel(4, -22)
                });
                for (let item of res.module) {
                    // icon图标
                    let icon = new AMap.Icon({
                        size: new AMap.Size(25, 28.8),
                        imageSize: new AMap.Size(25, 28.8),
                        image: item.markIcon,
                    });
                    // marker点信息
                    const marker = new AMap.Marker({
                        position: new AMap.LngLat(item.voiceLongitude, item.voiceLantitude),
                        offset: new AMap.Pixel(-10, -10),
                        icon: icon, // 添加 Icon 图标 URL
                    });
                    // 通过经纬度计算两地之间的距离, 默认: 保留2位小数
                    item.distance = GetDistance(this.lnglat.lat, this.lnglat.lng, item.voiceLantitude, item.voiceLongitude).toFixed(2);
                    // 窗口信息体
                    // 酒店，美食，民宿，景点和文体五大分类
                    if (item.voiceUrl) {
                        marker.audioUrl = item.voiceUrl;
                        marker.content = `<div>
                                <img src=${item.imgUrl} />
                                <div class="name">${item.voiceTitle}</div>
                                <div class="distance">距离您${item.distance}km</div>
                                <div class="classify">
                                    <div class="voiceNarrate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-yuyin.svg" />
                                        <span>解说</span>
                                    </div>
                                    <div class="voiceNavigate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-daohang.svg" />
                                        <span>去这里</span>
                                    </div>
                                </div>
                                <div class="triangles"></div>
                            </div>`
                    } else {
                        marker.content = `<div>
                                <img src=${item.imgUrl} />
                                <div class="name">${item.voiceTitle}</div>
                                <div class="distance">距离您${item.distance}km</div>
                                <div class="classify">
                                    <div class="navigate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-daohang.svg" />
                                        <span>去这里</span>
                                    </div>
                                </div>
                                <div class="triangles"></div>
                            </div>`
                    }
                    // 语音播放名称
                    marker.title = item.voiceTitle;
                    marker.icon = item.markIcon;
                    marker.id = item.voiceID;
                    marker.longitude = item.voiceLongitude;
                    marker.latitude = item.voiceLantitude;
                    // 最后点击的变量
                    AMap.event.addListener(marker, 'click', function(e) {
                        // 这是点击icon变换大小
                        self.selectedMarkerStore = e.target.getExtData()
                        // 下一次点击后触发上一次的劳动成果
                        if (self.lastClickedMarker) {
                            //起始坐标的位置
                            self.lastClickedMarker.setOffset(new AMap.Pixel(-10, -11))
                            self.lastClickedMarker.setIcon(
                                new AMap.Icon({
                                    image: self.lastClickedMarker.icon,
                                    size: new AMap.Size(25, 28.8),
                                    imageSize: new AMap.Size(25, 28.8)
                                })
                            );
                        }
                        e.target.setIcon(
                            new AMap.Icon({
                                image: e.target.icon,
                                size: new AMap.Size(40, 46.1),
                                imageSize: new AMap.Size(40, 46.1)
                            })
                        );
                        // 如果点击最后一个icon，infoWindow隐藏了，那就把最后一个icon也给隐藏了
                        this.map.on("click", function() {
                            //如果infowindow不存在
                            if ($(".amap-info-contentContainer")) {
                                // 图标就让它变小
                                self.lastClickedMarker.setIcon(
                                    // 放入一个新的icon对象
                                    new AMap.Icon({
                                        image: e.target.icon,
                                        size: new AMap.Size(25, 28.8),
                                        imageSize: new AMap.Size(25, 28.8)
                                    })
                                )
                                //起始坐标的位置
                                e.target.setOffset(new AMap.Pixel(-10, -11))
                            }
                        })
                        // 放大后坐标的位置
                        e.target.setOffset(new AMap.Pixel(-17, -18))

                        self.lastClickedMarker = e.target

                        infoWindow.setContent(this.createInfoWindow(e.target.content));
                        infoWindow.open(this.map, e.target.getPosition());
                        
                        // 操作infoWindow中的节点
                        setTimeout(function() {
                            const narrate = document.getElementsByClassName('voiceNarrate')[0];
                            const navigate = document.getElementsByClassName('voiceNavigate')[0];
                            AMap.event.addDomListener(navigate, 'click', function() {
                                wx.openLocation({
                                    longitude: +e.target.longitude,
                                    latitude: +e.target.latitude,
                                    name: e.target.title,
                                    scale: 16
                                })
                            })
                            AMap.event.addDomListener(narrate, 'click', function() {
                                // 如果音频存在，赋值给audioSrc
                                if (e.target.audioUrl) {
                                    this.audioSrc = e.target.audioUrl
                                }
                                // 赋值语音播放名称
                                this.audioName = e.target.title;
                                // 播放语音
                                // 这里加 setTimeout 为了让系统有充足的时间url添加，然后播放
                                setTimeout(function() {
                                    this.audioPlay()                                    
                                }.bind(this), 200)
                            }.bind(this))
                        }.bind(this), 200)

                    }.bind(this))
                    this.voiceList.push(marker)
                }
                this.map.add(this.voiceList)
            })
        },

        /**点击语音点的函数 */
        speechPointFun() {
            // 如果之前语音点展示,那么就让语音点隐藏
            if (this.speechPoint.show) {
                // 语音点集合循环操作每个具体的语音点
                this.voiceList.forEach(function(item) {
                    item.hide();
                })
            } else {
                this.voiceList.forEach(function(item) {
                    item.show();
                })
            }
            this.speechPoint.show = !this.speechPoint.show;
        },

        /**点击区域 */
        clickAreaFun(e) {
            // 地图层级缩小到11
            // this.map.setZoom(11);
            // 返回点击景区的ID
            const id = e.target.dataset.id;
            this.area.areacurrent = id;
            // 景区ID和数组匹配 返回当前景区下的景点列表
            const matchingSpotList = this.area.arealist.find(function(item) {
                return id == item.areaID
            })
            if (matchingSpotList) {
                this.area.spotlist = matchingSpotList.spotsListVOs
            }
            // this.getAudioInfoListFun()

            // 点击区域锚点不显示
            this.maodianList.forEach(function(item) {
                item.hide()
            })
        },


        /**点击景点 */
        clickSpotFun(e) {
            // 地图层级放大到15
            this.map.setZoom(16);
            const dataset = e.target.dataset;
            // 返回被点击景点ID
            this.area.spotcurrent = dataset.id;
            // 赋值给当前选中景点的名称
            this.area.currentName = dataset.name;
            // 地图平移到中心
            this.map.panTo([dataset.lng, dataset.lat]);
            // 景区选择隐藏
            this.leftSelect.expand = false;
            this.shadom.show = false;

            // 删除上次添加的点
            this.map.remove(this.maodianList);
            this.maodianList = [];
            // 显示锚点
            let icon = new AMap.Icon({
                size: new AMap.Size(32, 37),
                imageSize: new AMap.Size(32, 37),
                image: 'https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/maodian.png',
            });
            // marker点信息
            const marker = new AMap.Marker({
                position: new AMap.LngLat(dataset.lng, dataset.lat),
                offset: new AMap.Pixel(-10, -10),
                icon: icon, // 添加 Icon 图标 URL
                label: {
                    content:dataset.name,
                    direction: 'right',
                    offset: new AMap.Pixel(-167, 28)
                },
                zIndex: 20  //  层级
            });
            // 锚点信息
            this.maodianList.push(marker)
            // 如果currentType = 1就是景点，不显示锚点
            if (this.type.currentType != 1) {
                this.map.add(this.maodianList)                    
            }

            // id == -1是千岛湖全域
            if (e.currentTarget.dataset.id == -1) {
                this.map.panTo([119.021599, 29.586915]);
                this.map.setZoom(9);
                // 千岛湖全域锚点删除
                this.map.remove(this.maodianList)
            }
        },


        /**点击类型 */
        clickTypeFun(id, type, name, icon) {
            // 关闭infoWindow
            this.closeInfoWindow();
            this.type.mapIcon = icon;
            // 保存上一次点击的type，多次点击同一个type不触发getMarker
            if (this.type.lastClick != id) {
                // 显示加载中
                this.shade.show = true;
                this.type.currentType = id;
                // 读取marker点信息
                this.getMarkersFun(id);
                this.type.lastClick = id;
            }
            this.type.currentID = id;
            this.type.currentName = name;
            // 景区选择隐藏
            this.rightSelect.expand = false;
            this.shadom.show = false;
            
            // 如果currentType = 1就是景点，不显示锚点
            if (this.type.currentType != 1) {
                this.maodianList.forEach(function(item) {
                    item.hide()
                })                 
            }
        },


        /**获取marker点 */
        getMarkersFun(typeID) {
            // 清除之前的marker点
            if (this.markerList.length !== 0) {
                this.map.remove(this.markerList)
            }
            // maker数组为空
            this.markerList = [];
            getMarker({ typeID: typeID }).then(res => {
                if (res.resultCode != 1) {
                    alert('获取marker点失败');
                    return false
                }
                const infoWindow = new AMap.InfoWindow({
                    isCustom: true,  //使用自定义窗体
                    offset: new AMap.Pixel(4, -22)
                });
                // 只对厕所的经纬度做处理 GPS坐标转化为高德坐标
                let finalPath = [];
                if (typeID == 6) {
                    for (let i in res.module) {
                        finalPath.push([res.module[i].longitude, res.module[i].latitude])
                    }
                    new Promise((resolve, reject) => {
                        AMap.convertFrom(finalPath, "gps", function(status, result) {
                            if (result.info === 'ok') {
                                for(let index in res.module) {
                                    res.module[index].longitude = result.locations[index].lng;
                                    res.module[index].latitude = result.locations[index].lat;
                                }
                                resolve(res.module)
                            }
                        })
                    }).then(info => {
                        // 绘制marker点的函数
                        this.drawMarkerFun(info, infoWindow)
                    })
                } else {
                    // 绘制marker点的函数
                    this.drawMarkerFun(res.module, infoWindow)
                }
            })
        },

        /**绘制marker点的函数 */
        drawMarkerFun(info, infoWindow) {
            for (let item of info) {
                let icon = new AMap.Icon({
                    size: new AMap.Size(25, 28.8),
                    imageSize: new AMap.Size(25, 28.8),
                    image: item.markIconSelected ? item.markIconSelected : this.type.mapIcon,  // Icon的图像,存在就用景点里面的icon,没有就用mapIcon
                });
                const marker = new AMap.Marker({
                    position: new AMap.LngLat(item.longitude, item.latitude),
                    offset: new AMap.Pixel(-10, -10),
                    icon: icon, // 添加 Icon 图标 URL
                });
                // 通过经纬度计算两地之间的距离, 默认: 保留2位小数
                item.distance = GetDistance(this.lnglat.lat, this.lnglat.lng, item.latitude, item.longitude).toFixed(2);
                // 窗口信息体
                if (item.showType > 5) {
                    // 除了酒店，美食，民宿，景点和文体之外
                    marker.content = `<div>
                                <div class="name">${item.title}</div>
                                <div class="distance">距离您${item.distance}km</div>
                                <div class="classify">
                                    <div class="navigate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-daohang.svg" />
                                        <span>去这里</span>
                                    </div>
                                </div>
                                <div class="triangles"></div>
                            </div>`
                } else {
                    // 酒店，美食，民宿，景点和文体五大分类
                    if (item.audioUrl) {
                        marker.audioUrl = item.audioUrl;
                        marker.content = `<div>
                                <img src=${item.imgUrl} />
                                <div class="name">${item.title}</div>
                                <div class="distance">距离您${item.distance}km</div>
                                <div class="classify">
                                    <div class="narrate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-yuyin.svg" />
                                        <span>解说</span>
                                    </div>
                                    <div class="detail hasAudio">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-xiangqin.svg" />
                                        <span>详情</span>
                                    </div>
                                    <div class="navigate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-daohang.svg" />
                                        <span>去这里</span>
                                    </div>
                                </div>
                                <div class="triangles"></div>
                            </div>`
                    } else {
                        marker.content = `<div>
                                <img src=${item.imgUrl} />
                                <div class="name">${item.title}</div>
                                <div class="distance">距离您${item.distance}km</div>
                                <div class="classify">
                                    <div class="detail hasNoAudio">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-xiangqin.svg" />
                                        <span>详情</span>
                                    </div>
                                    <div class="navigate">
                                        <img src="https://sxhycos-1256774438.cos.ap-shanghai.myqcloud.com/qdh_image/audio-daohang.svg" />
                                        <span>去这里</span>
                                    </div>
                                </div>
                                <div class="triangles"></div>
                            </div>`
                    }
                }
                // 语音播放名称
                marker.title = item.title;
                marker.icon = item.markIconSelected ? item.markIconSelected : this.type.mapIcon;
                marker.id = item.recordID;
                marker.longitude = item.longitude;
                marker.latitude = item.latitude;
                // 最后点击的变量
                AMap.event.addListener(marker, 'click', function(e) {
                    // 这是点击icon变换大小
                    self.selectedMarkerStore = e.target.getExtData()
                    // 下一次点击后触发上一次的劳动成果
                    if (self.lastClickedMarker) {
                        //起始坐标的位置
                        self.lastClickedMarker.setOffset(new AMap.Pixel(-10, -11))
                        self.lastClickedMarker.setIcon(
                            new AMap.Icon({
                                image: self.lastClickedMarker.icon,
                                size: new AMap.Size(25, 28.8),
                                imageSize: new AMap.Size(25, 28.8)
                            })
                        );
                    }
                    e.target.setIcon(
                        new AMap.Icon({
                            image: e.target.icon,
                            size: new AMap.Size(40, 46.1),
                            imageSize: new AMap.Size(40, 46.1)
                        })
                    );
                    // 如果点击最后一个icon，infoWindow隐藏了，那就把最后一个icon也给隐藏了
                    this.map.on("click", function() {
                        //如果infowindow不存在
                        if ($(".amap-info-contentContainer")) {
                            // 图标就让它变小
                            self.lastClickedMarker.setIcon(
                                // 放入一个新的icon对象
                                new AMap.Icon({
                                    image: e.target.icon,
                                    size: new AMap.Size(25, 28.8),
                                    imageSize: new AMap.Size(25, 28.8)
                                })
                            )
                            //起始坐标的位置
                            e.target.setOffset(new AMap.Pixel(-10, -11))
                        }
                    })
                    // 放大后坐标的位置
                    e.target.setOffset(new AMap.Pixel(-17, -18))

                    self.lastClickedMarker = e.target

                    infoWindow.setContent(this.createInfoWindow(e.target.content));
                    infoWindow.open(this.map, e.target.getPosition());
                    // 如果音频存在，赋值给audioSrc
                    if (e.target.audioUrl) {
                        this.audioSrc = e.target.audioUrl
                    }
                    // 赋值语音播放名称
                    this.audioName = e.target.title;
                    // 操作infoWindow中的节点
                    setTimeout(function() {
                        const narrate = document.getElementsByClassName('narrate')[0];
                        const detail1 = document.getElementsByClassName('hasAudio')[0];
                        const detail2 = document.getElementsByClassName('hasNoAudio')[0];
                        const navigate = document.getElementsByClassName('navigate')[0];
                        AMap.event.addDomListener(navigate, 'click', function() {
                            wx.openLocation({
                                longitude: +e.target.longitude,
                                latitude: +e.target.latitude,
                                name: e.target.title,
                                scale: 16
                            })
                        })
                        if (e.target.audioUrl) {
                            AMap.event.addDomListener(detail1, 'click', function() {
                                switch (this.type.currentType) {
                                    case 1: 
                                        // 景点
                                        wx.miniProgram.navigateTo({url: `/pages/scenicAreaDetail/scenicAreaDetail?id=${e.target.id}`});
                                        break;
                                        // 文体
                                    case 2:
                                        wx.miniProgram.navigateTo({url: `/pages/museumPar/museumPar?id=${e.target.id}`});
                                        break;
                                        // 酒店
                                    case 3:                                            
                                        wx.miniProgram.navigateTo({url: `/pages/hotelDetail/hotelDetail?id=${e.target.id}`});
                                        break;
                                        // 民宿
                                    case 4:
                                        wx.miniProgram.navigateTo({url: `/pages/legendDetail/legendDetail?id=${e.target.id}`});
                                        break;
                                        // 美食
                                    case 5:
                                        wx.miniProgram.navigateTo({url: `/pages/foodDetail/foodDetail?id=${e.target.id}`});
                                        break;
                                    
                                }
                            }.bind(this))
                        } else {
                            AMap.event.addDomListener(detail2, 'click', function() {
                                switch (this.type.currentType) {
                                    case 1: 
                                        // 景点
                                        wx.miniProgram.navigateTo({url: `/pages/scenicAreaDetail/scenicAreaDetail?id=${e.target.id}`});
                                        break;
                                        // 文体
                                    case 2:
                                        wx.miniProgram.navigateTo({url: `/pages/museumPar/museumPar?id=${e.target.id}`});
                                        break;
                                        // 酒店
                                    case 3:                                            
                                        wx.miniProgram.navigateTo({url: `/pages/hotelDetail/hotelDetail?id=${e.target.id}`});
                                        break;
                                        // 民宿
                                    case 4:
                                        wx.miniProgram.navigateTo({url: `/pages/legendDetail/legendDetail?id=${e.target.id}`});
                                        break;
                                        // 美食
                                    case 5:
                                        wx.miniProgram.navigateTo({url: `/pages/foodDetail/foodDetail?id=${e.target.id}`});
                                        break;
                                    
                                }
                            }.bind(this))
                        }
                        AMap.event.addDomListener(narrate, 'click', function() {
                            // 播放语音
                            this.audioPlay()
                        }.bind(this))
                    }.bind(this), 200)
                }.bind(this))
                this.markerList.push(marker)
            }
            this.map.add(this.markerList)
            // 关闭加载中
            this.shade.show = false;
        },

        /**自定义窗体类型 */
        createInfoWindow (content) {
            const info = document.createElement("div");
            info.className = "custom-info input-card content-window-card";
            // 定义中部内容
            const middle = document.createElement("div");
            middle.className = "info-middle";
            middle.innerHTML = content;
            info.appendChild(middle);
            return info;
        },

        /**关闭信息窗口 */
        closeInfoWindow () {
            this.map.clearInfoWindow()
        },

        /**音频播放 */
        audioPlay() {
            // 同步播放标题
            // this.isPlaying_name = this.ka_info.name;
            // 显示progress框
            this.progressShow = true;
            //获得audio节点
            let audio = document.getElementById("audio");
            // 语音在播放的时候从头开始
            audio.load();
            //时间
            audio.ondurationchange = function (){
                this.totalTime = this.transTime(audio.duration);             
            }.bind(this)
            if (audio.paused) {
                this.audioPause = true;
                audio.play()
            }
            // 监听音频播放时间并更新进度条
            audio.addEventListener("timeupdate", function() {
                this.updateProgress(audio);
            }.bind(this), false);
            // 点击进度条跳到指定点播放
            $(document).on("click", "#progressBar-bg", function(e) {
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
            }.bind(this))
            this.$nextTick(function() {
                this.dragProgressDotEvent(audio)
            }.bind(this))
        },
        
        /**控制语音的暂停和播放 */
        controlAduio(e) {
            let audio = document.getElementById('audio');
            // e是audioPause，true为暂停，false为播放
            if (!e) {
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
        },

        /**关闭语音 */
        shutAudioFun() {
            let audio = document.getElementById('audio');
            // 停止当前播放的音频
            audio.load();
            // progress框关闭
            this.progressShow = false;
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

        /**switch滑动,开启或关闭手绘地图 */
        switchchangeFun(e) {
            // value 就是switch的值
            if (this.value) {
                this.tilerLayer.layer1.show();
                this.tilerLayer.layer2.show();
                this.tilerLayer.layer3.show();
            } else {
                this.tilerLayer.layer1.hide();
                this.tilerLayer.layer2.hide();
                this.tilerLayer.layer3.hide();
            }
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
.amap-marker-label {
    color: #ff8500;
    font-size: 0.30rem;
    background: transparent;
    width: 300px;
    border: none;
    text-align: center;
    text-shadow: 1px 1px 0px #fff,
    -0.5px -0.5px 0px #fff,
    1px 1px 0px #fff,
    -1px -1px 0px #fff,
    1px 1px 0px #fff,
    -1px -1px 0px #fff;
    font-weight: 600;
}
.mint-switch-core::before {
    width: 0.2rem !important;
    height: 0.2rem !important;
    border-radius: 0.15rem;
}
.mint-switch-core::after {
    width: 0.2rem !important;
    height: 0.2rem !important;
    border-radius: 0.15rem;
}
.mint-switch-input:checked + .mint-switch-core {
    border-color: rgba(129, 162, 252, 1);
    background-color: rgba(129, 162, 252, 1);
}
#comp-audio {
    height: 100%;
    position: relative;
    #map {
        height: 100%;
    }
    .qdh {
        &-shade {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                width: 2rem;
            }
        }
    }
    // 灰色背景
    .shadom {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.42);
        z-index: 990;
    }
    // 信息窗口
    .custom-info {
        width: 4rem;
        background: #fff;
        padding: 0.1rem;
        border-radius: 0.08rem;
        .info-middle {
            div {
                position: relative;
                &>img {
                    width: 3.8rem;
                    height: 2.1rem;
                }
                .name {
                    color: rgba(49, 49, 49, 1);
                    font-size: 0.28rem;
                    margin-top: 0.16rem;
                    font-weight: bold;
                }
                .distance {
                    color: rgba(162, 162, 162, 1);
                    font-size: 0.24rem;
                    margin-top: 0.1rem;
                }
                .classify {
                    display: flex;
                    border-top: 1px solid rgba(240, 240, 240, 1);
                    margin-top: 0.16rem;
                    padding-top: 0.1rem;
                    &>div {
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 0.5rem;
                        &.detail {
                            border-right: 1px solid rgba(240, 240, 240, 1);
                            img {
                                width: 0.2rem;
                                height: 0.24rem;
                                margin-right: 0.08rem;
                            }
                        }
                        &.narrate, &.voiceNarrate {
                            border-right: 1px solid rgba(240, 240, 240, 1);
                            img {
                                width: 0.24rem;
                                height: 0.22rem;
                                margin-right: 0.08rem;
                            }
                        }
                        &.navigate, &.voiceNavigate {
                            img {
                                width: 0.21rem;
                                height: 0.21rem;
                                margin-right: 0.08rem;
                            }
                        }
                    }
                    span {
                        display: inline-block;
                        font-size: 0.24rem;
                        color: rgba(106, 165, 252, 1);
                    }
                }
                .triangles {
                    width: 0;
                    border-left: 0.24rem solid transparent;
                    border-top: 0.24rem solid #fff;
                    border-right: 0.24rem solid transparent;
                    border-bottom: 0.24rem solid transparent;
                    position: absolute;
                    left: 50%;
                    bottom: -0.53rem;
                    margin-left: -0.24rem;
                }
            }
        }
    }
    // 个人中心
    .personal-detail {
        position: absolute;
        z-index: 900;
        left: 0.3rem;
        top: 2.32rem;
        display: flex;
        border-radius: 0.44rem;
        background: rgba(0, 0, 0, 0.49);
        padding-right: 0.28rem;
        overflow: hidden;
        &.active {
            top: 1.2rem;
        }
        img {
            width: 0.82rem;
            height: 0.82rem;
            border-radius: 50%;
            margin-right: 0.12rem;
        }
        .right{
            .right-top {
                margin-top: 0.05rem;
                span:nth-of-type(1) {
                    color: #fff;
                    font-size: 0.28rem;
                    font-weight: bold;
                    display: inline-block;
                    margin-right: 0.12rem;
                }
                span:nth-of-type(2) {
                    color: rgba(255, 255, 255, 0.82);
                    font-size: 0.24rem;
                }
            }
            .right-bottom {
                span {
                    color: rgba(255, 255, 255, 0.82);
                    font-size: 0.2rem;                    
                }
            }
        }
    }
    // 语音
    #progress {
        width: 6.86rem;
        height: 0.8rem;
        background-color: #fff;
        position: absolute;
        top: 1.2rem;
        left: 0.3rem;
        border-radius: 0.08rem;
        #audio-pause {
            width: 0.52rem;
            height: 0.52rem;
            position: absolute;
            top: 0.14rem;
            left: 0.14rem;
        }
        #audio-close {
            width: 0.36rem;
            height: 0.36rem;
            position: absolute;
            right: 0.22rem;
            top: 0.22rem;
            img {
                width: 100%;
                height: 100%;
            }
        }
        #audio-name {
            position: absolute;
            top: 0.1rem;
            left: 0.8rem;
            color: rgba(106, 165, 252, 1);
            font-size: 0.24rem;
        }
        #audio-time {
            color: #a2a2a2;
            position: absolute;
            top: 0.16rem;
            right: 0.86rem;
            span:nth-of-type(1) {
                color: rgba(106, 165, 252, 1);
            }
        }
        #progressBar-bg {
            position: absolute;
            width: 5.09rem;
            height: 0.02rem;
            background-color: rgb(238,238,238);
            bottom: 0.2rem;
            left: 0.9rem;
            cursor: pointer;
            #progressBar {
                position: absolute;
                width: 0;
                height: 0.02rem;
                background-color: rgb(129,162,252);
                top: 0;
                left: 0;
            }
            #progressDot {
                box-sizing: border-box;
                content: "";
                width: 0.4rem;
                height: 0.4rem; 
                border-radius: 50%; 
                -moz-border-radius: 50%; 
                -webkit-border-radius: 50%; 
                position: absolute; 
                left: 0; 
                top: 50%; 
                margin-top: -0.2rem; 
                margin-left: -0.2rem;
                #progressDot-child {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    margin-top: -5px;
                    margin-left: -5px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%; 
                    -moz-border-radius: 50%; 
                    -webkit-border-radius: 50%; 
                    background-color: rgb(129,162,252);
                }
            }
        }
    }
    .speechPointSwitch {
        width: 0.88rem;
        height: 0.88rem;
        background-color: #fff;
        border-radius: 0.08rem;
        position: absolute;
        color: rgba(129, 162, 252, 1);
        bottom: 2.52rem;
        left: 0.3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        img {
            width: 0.4rem;
        }
        div {
            font-size: 0.16rem;
            margin-top: 0.1rem;
        }
    }   
    .map-switch {
        width: 0.88rem;
        height: 0.88rem;
        background-color: #fff;
        border-radius: 0.08rem;
        position: absolute;
        bottom: 1.42rem;
        left: 0.3rem;
        color: rgba(129, 162, 252, 1);
        font-size: 0.16rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .text {
            margin-top: 0.15rem;
        }
        .mint-switch-core {
            width: 0.6rem;
            height: 0.24rem;
            border-radius: 0.16rem;
        }
    }
    .location {
        width: 0.88rem;
        height: 0.88rem;
        background-color: #fff;
        border-radius: 0.08rem;
        position: absolute;
        bottom: 0.32rem;
        left: 0.3rem;
        color: rgba(129, 162, 252, 1);
        font-size: 0.16rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        img {
            width: 0.4rem;
        }
        div {
            margin-top: 0.1rem;
        }
    }
    .select-top {
        position: absolute;
        top: 0;
        z-index: 1000;
        height: 0.88rem;
        width: 100%;
        background: #fff;
        padding: 0 0.33rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: rgba(93, 93, 93, 1);
        font-size: 0.28rem;
        .left {
            display: flex;
            align-items: center;
            img {
                width: 0.28rem;
                margin-left: 0.11rem;
            }
            span {
                display: inline-block;
                height: 0.6rem;
                line-height: 0.6rem;
            }
        }
        .right {
            display: flex;
            align-items: center;
            img {
                width: 0.18rem;
                margin-left: 0.12rem;
            }
        }
    }
    .select-area {
        position: absolute;
        top: 0.88rem;
        display: flex;
        z-index: 1000;
        .left {
            width: 1.6rem;
            background-color: rgba(248, 248, 248, 1);
            max-height: 5.3rem;
            overflow-y: auto;
            overflow-x: hidden;
             /*解决ios上滑动不流畅*/
            -webkit-overflow-scrolling: touch;
            div {
                width: 1.6rem;
                height: 0.98rem;
                color: rgba(162, 162, 162, 1);
                font-size: 0.28rem;
                text-align: center;
                line-height: 0.98rem;
            }
            div.active {
                background: #fff
            }
        }
        .right {
            width: 5.9rem;
            background: #fff;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            padding: 0 0.3rem 0.2rem;
            max-height: 5.3rem;
            overflow-y: auto;
            overflow-x: hidden;
             /*解决ios上滑动不流畅*/
            -webkit-overflow-scrolling: touch;
            div {
                width: 1.6rem;
                height: 0.78rem;
                border-radius: 0.08rem;
                background-color: rgba(248, 248, 248, 1);
                font-size: 0.24rem;
                color: rgba(93, 93, 93, 1);
                margin-top: 0.2rem;
                text-align: center;
                line-height: 0.78rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            div.active {
                background: rgba(106, 165, 252, 1);
                color:#fff;
            }
            div:not(:nth-of-type(3n)) {
                margin-right: 0.2rem;
            }
        }
    }
    .select-expand {
        position: absolute;
        top: 0.88rem;
        background-color: rgba(252, 250, 250, 1);
        padding: 0 0.3rem 0.2rem;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        z-index: 1000;
        div {
            width: 1.9rem;
            height: 0.88rem;
            border-radius: 0.08rem;
            left: 279px;
            background-color: rgba(248, 248, 248, 1);
            border: 0.01rem solid rgba(231, 231, 231, 1);
            margin-top: 0.2rem;
            display: flex;
            align-items: center;
            padding-left: 0.33rem;
            img {
                width: 0.28rem;
                margin-right: 0.08rem;
            }
            span {
                color: rgba(93, 93, 93, 1);
                font-size: 0.24rem;
            }
        }
        div.active {
            background: rgba(129, 162, 252, 1);
            span {
                color: #fff;
            }
        }
        div:not(:nth-of-type(3n)) {
            margin-right: 0.55rem;
        }
    }
    // 回到景区
    .backToCenter {
        width: 2.12rem;
        height: 0.88rem;
        position: absolute;
        z-index: 100;
        bottom: 1.42rem;
        left: 50%;
        transform: translateX(-50%);
        background: #81A2FC;
        border-radius: 0.44rem;
        img {
            width: 0.3rem;
            margin-right: 0.06rem;
        }
        font-size: 0.28rem;
        color: #fff;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

</style>
