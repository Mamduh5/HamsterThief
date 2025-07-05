const { DateTime } = require('luxon')
const config = require('config')
const basicAuth = require('basic-auth')
const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const { languageProject } = require('../libs/language')
const { decodeJWTDynamic } = require('../libs/jwt.js')
const { 
  jwtEncodeLogin,
  jwtEncodeTemp,
} = require('../controllers/AuthenticationController.js')
const { knex } = require('../libs/knex.js');
const authen = config.get('basicAuth')
const jwt = config.get('jwt')
const cookieTiming = config.get('cookie')
const cache = require('../libs/redis.js')
const {
  USERS,
  ADMINS,
  ADMIN_DATA_TRACKING
} = require('../enum/index.js')
const { getQueryDynamiCMD } = require('../../src/libs/knex.js')
const { Argon2hashPassword, Argon2verifyPassword } = require('../libs/password.js')
// const { generateResetEmailHTML, generateEmailConfirmationHTML } = require('../email/emailSendertext.js')
const crypto = require('crypto');

const Register = () => async (ctx, next) => {
  try {
    const { Password, Email:email , FirstName:first_name,LastName:last_name } = ctx.request.body || {}
    let AllData = { email,first_name,last_name}
    let newRefreshToken = crypto.randomBytes(64).toString('hex');
    const Argon2HashPassword = await Argon2hashPassword(Password)
    const insertAdmin = await knex(USERS).insert({
      ...AllData,
      password_hash: Argon2HashPassword,
      refresh_token: newRefreshToken,
      status: 102
    });

    const adminId = insertAdmin[0]

    ctx.target_admin_id = adminId
    
    return next()
  } catch (error) {
    throw throwError(error, 'insertAdmins')
  }
}

const UserLoginService = () => async (ctx, next) => {
  const ips = ctx.ip
  const platform = ctx.platform
  const jwt = await jwtEncodeLogin(ips, ctx.refresh_token, 'NORMAL', platform)
  ctx.jwt = jwt
  return next()
}

const UserLogoutService = () => async (ctx, next) => {
  ctx.jwt = null;
  return next();
};

const currentAdminInfo = () => async (ctx, next) => {
  const columnMap = {
    STATUS: `status`
  };
  const queries = await Promise.all(
    Object.entries(columnMap).map(async ([key, value]) => ({
      [key]: await getQueryDynamiCMD(key, value),
    }))
  );
  const queryStatus = queries.find((q) => q.STATUS)?.STATUS;
  const adminInfo = await knex(ADMINS)
    .select(
      "admin_id",
      "email",
      "first_name",
      "last_name",
      knex.raw(queryStatus)
    )
    .where({ admin_id: ctx.admin_id }).first();
  const constructData = {
    AdminId: adminInfo.admin_id,
    Email: adminInfo.email,
    FirstName: adminInfo.first_name,
    LastName: adminInfo.last_name,
  };
  ctx.result = constructData;
  return next();
}

const changeUserInfo = () => async (ctx, next) => {
  const columnMap = {
    STATUS: `status`
  };
  const { FirstName, LastName } = ctx.request.body;
  const adminId = ctx.admin_id;

  const queries = await Promise.all(
    Object.entries(columnMap).map(async ([key, value]) => ({
      [key]: await getQueryDynamiCMD(key, value),
    }))
  );
  const queryStatus = queries.find((q) => q.STATUS)?.STATUS;

  await knex(ADMINS)
    .where({ admin_id: adminId })
    .update({
      first_name: FirstName,
      last_name: LastName,
      // status: knex.raw(admins[0]['schema']['status']['updatestring'], [status, status]),
      status: 102
    });

  const trackingUserInfoOld = await knex(ADMIN_DATA_TRACKING)
    .select(
      'type_of_data',
      'admin_data_tracking_id',
      knex.raw(queryStatus)

    )
    .where({ admin_id: adminId, type_of_data: 2 })
    .orderBy('created_at', 'desc')
    .first()

  await knex(ADMIN_DATA_TRACKING)
    .update({
      type_of_data: 1,
      status: 402
    })
    .where({ admin_id: adminId, status: 102, type_of_data: 2 })

  const trackingUserInfoNew = await knex(ADMIN_DATA_TRACKING)
    .insert({
      admin_id: adminId,
      first_name: FirstName,
      last_name: LastName,
      type_of_data: 2,
      status: 102
    })



  ctx.old_data_id = trackingUserInfoOld.admin_data_tracking_id
  ctx.new_data_id = trackingUserInfoNew[0]

  return next();
}

const UserTokenAuthen = () =>
  async (ctx, next) => {
    try {
      const token = ctx.get("x-access-token");

      const platform = ctx.platform;
      if (!ctx.language) {
        ctx.body = responseFormat({ param: 'header', error: 'accept-language' }, 'MISSING_REQUIRED_VALUES', 'EN');
        return;
      }
      if (!token) {
        ctx.status = 401;
        ctx.body = responseFormat({ error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
        return;
      }
      const decode = decodeJWTDynamic(token, jwt['hash']);
      if (!decode) {
        ctx.status = 401;
        ctx.body = responseFormat({ error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
        return;
      }
      if (decode?.token_type !== platform) {
        ctx.body = responseFormat({ error: 'x-access-token' }, 'HEADER_REQUIRED_ACCESS_TOKEN', ctx.language);
        return;
      }
      
      const data = await knex(USERS)
        .select('*')
        .where(`${USERS}.refresh_token`, decode['key'])
        .andWhere(`${USERS}.status`, 102);
      const AllowValue = []
      if (data[0] === undefined) {
        ctx.body = responseFormat({}, 'PLS_LOGIN_FIRST', ctx.language);
        return;
      }
      data.forEach(({ user_id, email, status, affiliation_id, merchant_id, branch_id, primary, level }) => { if (status === 102) AllowValue.push({ user_id, email, status, affiliation_id, merchant_id, branch_id, primary, level }); });
      if (!AllowValue[0].user_id) {
        ctx.body = responseFormat({}, 'PLS_LOGIN_FIRST', ctx.language);
        return;
      }
      ctx.refreshToken = decode['key']
      ctx.AllDataDecodeToken = decode;
      ctx.token = token;
      ctx.result = AllowValue;
      ctx.email = AllowValue[0].email;

      ctx.user_id = AllowValue[0].user_id;
      ctx.result.level = AllowValue[0].level;
      ctx.user = AllowValue;
      return next();
    } catch (error) {
      throw throwError(error, 'tokenAuthentication');
    }
  }

const changePassword = () => async (ctx, next) => {
  try {
    const currentTime = DateTime.utc();
    const adminId = ctx.admin_id;
    const { OldPassword, NewPassword } = ctx.request.body || {};
    if (!adminId) {
      ctx.body = responseFormat({}, "PLEASE_LOG_IN_AGAIN", ctx.language);
      return;
    }
    if (!OldPassword || !NewPassword) {
      ctx.body = responseFormat({}, "MISSING_REQUIRED_FIELDS", ctx.language);
      return;
    }
    const admin = await knex(ADMINS).where({ admin_id: adminId }).first();
    const { password_hash } = admin;
    const isOldPasswordCorrect = await Argon2verifyPassword(OldPassword, admin.password_hash);
    if (!isOldPasswordCorrect) {
      ctx.body = responseFormat({}, "DATA_IS_NOT_EXISTS", ctx.language);
      return;
    }
    const isSameAsOldPassword = await Argon2verifyPassword(NewPassword, password_hash);
    if (isSameAsOldPassword) {
      ctx.body = responseFormat({}, "NEW_PASSWORD_SAME_AS_OLD", ctx.language);
      return;
    }
    const newHashedPassword = await Argon2hashPassword(NewPassword);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await knex(ADMINS)
      .where({ admin_id: adminId })
      .update({
        password_hash: newHashedPassword,
        refresh_token: newRefreshToken, // Optional
        updated_at: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      });

    ctx.result = NewPassword;

    return next();
  } catch (error) {
    throw throwError(error, "changePassword");
  }
};

module.exports = {
  UserTokenAuthen,
  currentAdminInfo,
  changeUserInfo,
  UserLoginService,
  changePassword,
  UserLogoutService,
  Register
}
