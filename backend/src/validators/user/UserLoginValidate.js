const config = require('config')
const { responseFormat, responseFormatValidate, responseFormatValidateWithRegex } = require('../../libs/formatResponse.js')
const { throwError } = require('../../libs/errorService.js')
const { decodeJWTTempToken, decodeJWTDynamic } = require('../../libs/jwt.js')
const { Argon2verifyPassword } = require('../../libs/password.js')
const { knex } = require('../../libs/knex.js');
const { ADMINS, ADMIN_2FA_REQUEST, AUTH_LOGIN_LOGS } = require('../../enum/index.js');
const ValidateSchema = require('../user/schemas/login/userLoginValidateSchema.js')
const jwt = config.get('jwt')
const { DateTime } = require('luxon')

const UserloginValidate = () => async (ctx, next) => {
  try {
    const { error, value } = ValidateSchema.loginValidateSchema.validate(ctx.request.body, { abortEarly: false });
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
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Someting went wrong";
      ctx.body = responseFormat({}, 'HAS_PROBLEM_API', ctx.language);
      return;
    }
    const { Email, Password } = value || {};

    const findUser = await knex(ADMINS).select('*')
      .where({ email: Email })

    if (!findUser[0]) {

      ctx.status = 404;
      ctx.action = "LOGIN_FAILED";
      ctx.reason_of_failure = "user not found";
      ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language)
      return;
    }

    ctx.password_hash = findUser[0].password_hash
    ctx.refresh_token = findUser[0].refresh_token

    const isYourAccountHaveBeenBlocked = await isBlocked(ctx, findUser[0].email);

    if (isYourAccountHaveBeenBlocked) {
      ctx.status = 401;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Account Blocked 30 minutes";
      ctx.admin_id = findUser[0].admin_id
      ctx.email = findUser[0].email
      ctx.body = responseFormat({}, 'YOU_ARE_BLOCKED_PLS_WAIT', ctx.language);
      return;
    }

    const isPasswordValid = await Argon2verifyPassword(Password, ctx.password_hash);

    if (!isPasswordValid) {

      ctx.status = 404;
      ctx.action = 'LOGIN_FAILED';
      ctx.reason_of_failure = "Incorrect Password";
      ctx.admin_id = findUser[0].admin_id
      ctx.email = findUser[0].email

      const TotalFailed = await failedAttempCount(ctx, ctx.email, ctx.reason_of_failure);

      const totalFailedCount = parseInt(TotalFailed, 10);

      if (totalFailedCount === 1) {
        ctx.body = responseFormat({}, 'WRONG_PASSWORD_WARNING_BEFORE_BLOCK', ctx.language);
      }
      else if (totalFailedCount >= 2) {
        ctx.failed_attempt_count = 999;
        ctx.body = responseFormat({}, 'BLOCKED_AFTER_THREE_PASSWORD_FAILED_ATTEMP', ctx.language);
      } else {
        ctx.body = responseFormat({}, 'DONT_FOUND_USER', ctx.language);
      }

      return;
    }
    ctx.user = findUser;
    ctx.admin_id = findUser[0].admin_id

    await notBlockedAndPassowrdCorrect(isYourAccountHaveBeenBlocked, findUser[0].email);

    await next();
  } catch (error) { throw throwError(error, 'loginValidate') }
};

module.exports = {
    UserloginValidate
}
