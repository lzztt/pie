import query from './db/query'
import md5 from './lib/strings/md5'

class Authentication {
  constructor(uid, name, role) {
    this.uid = uid
    this.name = name
    this.role = role
  }
}

const hashPassword = password => md5(`Alex${password}Tian`)

const isAuthenticated = ctx => ctx.session.auth && ctx.session.auth.uid != 0

const login = (ctx, email, password) => {
  if (isAuthenticated(ctx)) throw `you have already logged in as ${ctx.session.auth.name}`

  return query('SELECT id, username, password FROM users WHERE email = ?', [email])
  .then((result) => {
    if (result.length === 0) throw `Account does not exist: ${email}`

    const user = result[0]
    if (user.password !== hashPassword(password)) throw 'Wrong password'

    ctx.sessionHandler.regenerateId()
    ctx.session.auth = new Authentication(user.id, user.username, [])
    return ctx.session.auth
  })
  .catch(console.log)
}

const logout = (ctx) => {
  if (!isAuthenticated(ctx)) throw 'You have not logged in yet'

  ctx.session = null
  return new Authentication(0, null, [])
}

export default {
  login,
  logout,
  isAuthenticated,
}

