<template>
<div id="explain">
    <div v-html="content">
    </div>
</div>
</template>

<script>
export default {

    data () {
        return {
            content: ''
        }
    },

    mounted () {
        var userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
        this.$store.dispatch('common/getPort', {
            userName: userInfo.nickName,
            openID: userInfo.openID,
            longitude: userInfo.longitude,
            latitude: userInfo.latitude
            // userName: 1,
            // openID: 1,
            // longitude: 1,
            // latitude: 1,
        }).then(res => {
            if(res.code === 1) {
                this.content = res.data
            } else {
                this.content = '暂无说明！'
            }
        })
    }
}
</script>

<style lang="stylus">
#explain
    padding 20px
</style>
