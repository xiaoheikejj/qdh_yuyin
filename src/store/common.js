import ax from '../api/axios'

const state = {
    loading: false
}

const mutations = {

}

const actions = {
    // 已经点过的景咔
    getKar ({ commit }, data) {
        const res = ax.post('/operationInfo/getKar', data).then(res => res.data)
        return res
    },
    // 打咔
    setKar ({ commit }, data) {
        const res = ax.post('/operationInfo/keep', data).then(res => res.data)
        return res
    },

    // 获取业态分类下的景点
    getWayMarker ({ commit }, data) {
        const res = ax.post('/operationInfo/getWayMarker', data).then(res => res.data)
        return res
    },
    // 获取业态分类路线
    getOperationInfoListWithLine ({ commit }, data) {
        const res = ax.post('/operationInfo/getOperationInfoListWithLine', data).then(res => res.data)
        return res
    },

  // ***************************************获取菜单列表 : 获取菜单列表
  // 获取菜单列表
  getMenuList ({ commit }, data) {
    const res = ax.post('/getMenuList', data).then(res => res.data)
    return res
  },

  // ***************************************获取业态分类接口 : 获取业态分类接口
  // 获取分类列表和图标信息
  getOperationList ({ commit }, data) {
    const res = ax.post('/travelKa/travelWay', data).then(res => res.data)
    return res
  },

  // ***************************************路线api : 路线api
  //获取步道上边的大标记点 ，原型上边的数字1这类型 参数为列表中的id
  getPoint ({ commit }, data) {
    const res = ax.post('/getPoint', data).then(res => res.data)
    return res
  },

  // 步道说明
  getPort ({ commit }, data) {
    const res = ax.post('/getPort', data).then(res => res.data)
    return res
  },

  // 获取路线列表 包含两大列表
  getWay ({ commit }, data) {
    const res = ax.post('/getWay', data).then(res => res.data)
    return res
  },

  // ***************************************业态信息详情列表api : 业态信息详情列表api
  // 获取业态详细信息
  getOperationInfo ({ commit }, data) {
    const res = ax.post('/operationInfo/getOperationInfo', data).then(res => res.data)
    return res
  },

  // 获取分类下的业态信息列表
  getOperationInfoList ({ commit }, data) {
    const res = ax.post('/operationInfo/getOperationInfoList', data).then(res => res.data)
    return res
  },

  // ***************************************用户信息录入接口 : 用户信息录入接口
  // 用戶轨迹记录每一小时记录一次
  saveWay ({ commit }, data) {
    const res = ax.post('/wxUser/saveWay', data).then(res => res.data)
    return res
  },

  // 用户信息更新与插入接口
  userInfo ({ commit }, data) {
    const res = ax.post('/wxUser/userInfo', data).then(res => res.data)
    return res
  },

  // 救援
  userRescue ({ commit }, data) {
    const res = ax.post('/wxUser/userRescue', data).then(res => res.data)
    return res
  }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
