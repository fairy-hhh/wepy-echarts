//env 0测试环境 1正式环境
const env = 0

let host = ''
let cdn_host = ''
if (env == 0) {
    host = 'https://dev.zhijuninvest.com'
    cdn_host = 'https://dev.zhijuninvest.com'
} else {
    host = 'https://www.zhijuninvest.com'
    cdn_host = 'https://cdn.zhijuninvest.com'
}

module.exports = {
    host: host,
    cdn_host: cdn_host,
    env: env
}
