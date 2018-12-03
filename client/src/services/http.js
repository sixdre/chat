import axios from 'axios'
import $config from '@/config/index'
import store from '@/store'
import router from '@/router'

// axios 配置
axios.defaults.timeout = 30000
axios.defaults.baseURL = $config.baseUrl;

// http request 拦截器
axios.interceptors.request.use(
	config => {
		let token = store.state.user.token;
		if (token) {
			config.headers['x-access-token'] = token
		}
		return config
	},
	err => {
		return Promise.reject(err)
	}
)
axios.interceptors.response.use(
	response => {
		return response
	},
	error => {
		if (error.response) {
			switch (error.response.status) {
				case 401:
					// 401 清除token信息并跳转到登录页面
					store.dispatch('user/logout').then(() => {
                        router.replace({
                            path: '/login'
                        })
                    })
                    alert('请重新登录');
					break;
				case 403:
					// 403 用户没有权限访问
					alert('抱歉，您没有权限访问,请与系统管理员联系!')
					break;
				default:
                    alert('请求失败，服务器错误!')
					break;
			}
		}
		return Promise.reject(error)
	}
)
export default axios