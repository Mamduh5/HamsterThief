const router = require('koa-router')
const {
    xPlatformValidate,
} = require('../validators/LoginValidate.js')
const {
    UserloginValidate,
    UserRegisterValidate,
} = require('../validators/user/UserLoginValidate.js')
const {
    UserLoginService,
    UserLogoutService,
    UserTokenAuthen,
    Register
} = require('../middlewares/UserAuthenMiddleware.js')
const {
    basicAuthentication,
} = require('../middlewares/AuthenticationMiddleware.js')

const { responseFormat } = require('../libs/formatResponse.js')
const Router = new router()

Router.post('/login',
    basicAuthentication(),
    xPlatformValidate(),
    UserloginValidate(),
    UserLoginService(),
    async ctx => {
        ctx.status = 200
        ctx.body = responseFormat({ Token: ctx.jwt }, 'GET_DATA_SUCCESS', ctx.language)
    })

Router.get('/logout',
    basicAuthentication(),
    xPlatformValidate(),
    UserTokenAuthen(),
    UserLogoutService(),
    async ctx => {
        ctx.status = 200
        ctx.body = responseFormat({ Token: ctx.jwt }, 'LOGOUT_SUCCESS', ctx.language)
    })

Router.post('/register',
    basicAuthentication(),
    xPlatformValidate(),
    UserRegisterValidate(),
    Register(),
    async ctx => {
        ctx.status = 200
        ctx.body = responseFormat({ }, 'REGISTER_SUCCESS', ctx.language)
    })

module.exports = Router