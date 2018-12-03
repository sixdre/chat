let baseUrl;
if (process.env.NODE_ENV == 'development') {
    baseUrl = 'http://127.0.0.1:9000'
} else if (process.env.NODE_ENV == 'production') {
    baseUrl = 'http://47.94.206.86:7893'
}
export default {
    baseUrl,
}