const debug = require('debug')('app:routes:session')
const authService = require('../services/auth')

async function session(req, res) {
  let rv = null

  const user = await authService.getUser(req)
  if (user) {
    debug('got session for user %s', user.id)
    delete user.password
    rv = { user }
  } else {
    debug('no session')
  }

  res.json(rv)
}

exports.session = session
