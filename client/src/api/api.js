import $http from '@/services/http'
export default {
    /**
     * 登录
     */
    login(username, password) {
        return $http.post('/api/login', { username: username, password: password });
    },
    searchUser(username) {
        return $http.get('/api/users/search', { params: { username: username } })
    },
    addFile(formData, callback) {
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        return $http({
            method: 'post',
            url: '/sys/upload/addFile',
            data: formData,
            config,
            onUploadProgress: function(progressEvent) {
                if (progressEvent.lengthComputable) {
                    if (callback && typeof callback == 'function') {
                        callback(progressEvent)
                    }
                }
            }
        });
    },
    upload(formData, callback) {
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        return $http({
            method: 'post',
            url: '/sys/upload',
            data: formData,
            config,
            onUploadProgress: function(progressEvent) {
                if (progressEvent.lengthComputable) {
                    if (callback && typeof callback == 'function') {
                        callback(progressEvent)
                    }
                }
            }
        });
    },
}