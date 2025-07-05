const crypto = require('crypto');
const { throwError } = require('../libs/errorService.js')
const {  Argon2hashPassword } = require('../libs/password.js')
const {
  USERS,

} = require('../enum/index.js')
const { knex } = require('../libs/knex.js');
const { getQueryDynamiCMD } = require('../../src/libs/knex.js')

const currentUserInfo = () => async (ctx, next) => {
  const columnMap = {
    STATUS: `status`
  };
  const queries = await Promise.all(
    Object.entries(columnMap).map(async ([key, value]) => ({
      [key]: await getQueryDynamiCMD(key, value),
    }))
  );
  const queryStatus = queries.find((q) => q.STATUS)?.STATUS;
  const userInfo = await knex(USERS)
    .select(
      "user_id",
      "email",
      "first_name",
      "last_name",
      knex.raw(queryStatus)
    )
    .where({ user_id: ctx.user_id }).first();
  const constructData = {
    UserId: userInfo.admin_id,
    Email: userInfo.email,
    FirstName: userInfo.first_name,
    LastName: userInfo.last_name,
  };
  ctx.result = constructData;
  return next();
}

module.exports = { currentUserInfo }