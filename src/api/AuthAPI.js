import request from '@/utils/request'

export default {
    // 学号密码登录
    loginWithUsername(account,password,remember) {
        return request.post('/auth/login/password', {
            msg: "账号密码登录",
            account: account,
            password: password,
            remember: remember
        })
    },
}
