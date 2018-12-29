import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const router = new Router({
    base: '/dominate',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/home',
            component: () => import('@/views/home.vue')
        },
        {
            path: '/rescue',
            component: () => import('@/views/rescue.vue')
        },
        {
            path: '/explain',
            component: () => import('@/views/explain.vue')
        },
        {
            path: '/detail/:id',
            component: () => import('@/views/detail.vue')
        },
        {
            path: '/navigation/:id',
            component: () => import('@/views/navigation.vue')
        },
        {
            path: '/demo',
            component: () => import('@/views/demo.vue')
        }
    ]
})

router.afterEach(() => {
    window.scrollTo(0, 0)
})

export default router
