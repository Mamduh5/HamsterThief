const router = require('koa-router')
const {
    xPlatformValidate,
} = require('../validators/LoginValidate.js')
const {
    UserTokenAuthen,
} = require('../middlewares/UserAuthenMiddleware.js')
const {
    basicAuthentication,
} = require('../middlewares/AuthenticationMiddleware.js')
const {
    currentUserInfo
} = require('../middlewares/Users.js')
const { responseFormat } = require('../libs/formatResponse.js')

const Router = new router()

Router.get('/info',
  basicAuthentication(),
  xPlatformValidate(),
  UserTokenAuthen(),
  currentUserInfo(),
  async ctx => {
    ctx.status = 200
    ctx.body = responseFormat({ ...ctx.result }, 'GET_DATA_SUCCESS', ctx.language)
  })

module.exports = Router
