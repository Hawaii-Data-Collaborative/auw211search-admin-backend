const debug = require('debug')('app:routes:session')
const authService = require('../services/auth')

async function session(req, res) {
  let rv = null

  const user = await authService.getUser(req)
  if (user) {
    debug('got session for user %s', user.id)
    const { id, email, permissions, lastLogin } = user
    rv = { user: { id, email, permissions, lastLogin } }
  } else {
    debug('no session')
    res.status(401)
  }

  res.json(rv)
}

exports.session = session
