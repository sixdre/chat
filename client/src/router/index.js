import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)

//路由白名单（用于不需要验证的路由）
const whiteList = [
    '/login',
    '/register'
]

//初始化的路由
var routes = [{
    path: '/chat',
    name: 'chat',
    component: r => require.ensure([], () => r(require('@/views/chat/index'))),
}, {
    path: '/login',
    name: 'login',
    component: r => require.ensure([], () => r(require('@/views/login')))
}]



const router = new Router({
    linkActiveClass: 'active',
    routes
})



export default router