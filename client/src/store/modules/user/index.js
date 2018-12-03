import Api from '@/api/api'


const state = {
    // 用户名
    username: sessionStorage.getItem('username'),
    // token
    token: sessionStorage.getItem('token'),
    // 头像
    avatar: sessionStorage.getItem('avatar'),
}

const getters = {}

const mutations = {
    setToken: (state, data) => {
        sessionStorage.setItem('token',data)
        state.token = data
    },
    setAvatar: (state, data) => {
        sessionStorage.setItem('avatar',data)
        state.avatar = data
    },
    setName: (state, data) => {
        sessionStorage.setItem('username',data)
        state.username = data
    },
    
}

const actions = {
    login({ commit }, { username, password }) {
        return new Promise((resolve, reject) => {
            Api.login(username, password).then(res => {
                if (res.data.code === 1) {
                    commit('setName', username);
                    commit('setToken', res.data.token);
                }
                resolve(res);
            }).catch(err => {
                reject(err)
            })
        })
    },
    // 登出
    logout({ commit }) {
        return new Promise((resolve) => {
            commit('setToken', '')
            commit('setName', '')
            commit('setAvatar', '')
            resolve()
        })
    },
    //获取当前登录用户信息
    getUserInfo({ commit }) {
        return new Promise((resolve, reject) => {
            Api.getUserInfo().then((res) => {
                commit('setUserInfo', res.data.userInfo);
                resolve(res.data.userInfo)
            }).catch(() => {
                reject()
            })
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}