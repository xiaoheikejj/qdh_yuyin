import service from '../utils/request'

function getArea(data) {
    return service({
        url: '/map/areaList',
        method: 'post',
        data: data
    })
}

function getType(data) {
    return service({
        url: '/map/types',
        method: 'post',
        data: data
    })
}

function getUserInfo(data){
    return service({
        url: '/login/h5userInfo',
        method: 'post',
        data: data
    })
}

function getMarker(data) {
    return service({
        url: '/map/marks',
        method: 'post',
        data: data
    })
}

// 语音点
const audioInfo = (data) => {
    return service({
        url: '/map/voiceInfo',
        method: 'post',
        data:data
    })
}

export { 
    getArea, getType, getUserInfo, getMarker, audioInfo
}