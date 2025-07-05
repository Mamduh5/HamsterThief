const router = require('koa-router')
const {
    xPlatformValidate,
} = require('../validators/LoginValidate.js')
const { UserloginValidate } = require('../validators/user/UserLoginValidate.js')
const {
    basicAuthentication,
} = require('../middlewares/AuthenticationMiddleware.js')
const { responseFormat } = require('../libs/formatResponse.js')
const Router = new router()

Router.post('/login',
    basicAuthentication(),
    xPlatformValidate(),
    UserloginValidate(),

    async ctx => {
        ctx.status = 200
        ctx.body = responseFormat({}, 'GET_DATA_SUCCESS', ctx.language)
    })

module.exports = Router