const config = require('config')
const { responseFormat, responseFormatValidate, responseFormatValidateWithRegex } = require('../../libs/formatResponse.js')
const { throwError } = require('../../libs/errorService.js')
const { decodeJWTTempToken, decodeJWTDynamic } = require('../../libs/jwt.js')
const { Argon2verifyPassword } = require('../../libs/password.js')
const { knex } = require('../../libs/knex.js');
const { USERS, ADMINS } = require('../../enum/index.js');
const LoginValidateSchema = require('../user/schemas/login/userLoginValidateSchema.js')
const RegisterValidateSchema = require('../user/schemas/login/userRegisterValidateSchema.js')

const jwt = config.get('jwt')
const { DateTime } = require('luxon')

const UserloginValidate = () => async (ctx, next) => {
  try {
    const { error, value } = LoginValidateSchema.loginValidateSchema.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      ctx.status = 400;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Failed on validate values";
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      ctx.body = responseFormat({ [errors[0].field]: errors[0].value, }, errors[0].message, ctx.language)
      return;
    } else if (!value) {
      ctx.status = 400;
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language);
      return;
    }
    const { Email, Password } = value || {};

    const findUser = await knex(USERS).select('*')
      .where({ email: Email })

    if (!findUser[0]) {

      ctx.status = 404;    
      ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language)
      return;
    }

    ctx.password_hash = findUser[0].password_hash
    ctx.refresh_token = findUser[0].refresh_token

    const isPasswordValid = await Argon2verifyPassword(Password, ctx.password_hash);

    if (!isPasswordValid) {
      ctx.status = 404;
      ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language);
      return;
    }
    ctx.user = findUser;
    ctx.admin_id = findUser[0].user_id

    await next();
  } catch (error) { throw throwError(error, 'loginValidate') }
};

const UserRegisterValidate = () => async (ctx, next) => {
  try {
    const { error, value } = RegisterValidateSchema.RegisterJoi.validate(ctx.request.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => (
        {
          field: err.path.join('.'),
          value: err.context?.value || '',
          message: err.message,
        }));
      const formattedResponse = responseFormat({ [errors[0].field]: errors[0].value }, errors[0].message, ctx.language);
      ctx.body = formattedResponse;
      return;
    } else if (!value) {
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language)
      return;
    }

    const { Email } = value || {};

    const findUser = await knex(USERS).select('user_id').where({ Email }).first();
    if (findUser) {
      ctx.body = responseFormat({}, 'DUPLICATE_EMAIL', ctx.language);
      return;
    }
    await next();
  } catch (error) { throw throwError(error, 'InsertAdminsValidate') }
};


module.exports = {
  UserloginValidate,
  UserRegisterValidate
}
