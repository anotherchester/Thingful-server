const AuthService = {
  getUserWithUserName(table, user_name) {
    return table('thingful_users')
    .where({user_name})
    .first()
  },
  parseBasicToken(token) {
    return Buffer
      .from(token, 'base64')
      .toString()
      .split(':')
  },
}

module.exports = AuthService