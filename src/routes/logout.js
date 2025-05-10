const debug = require('debug')('adminapp:routes:logout')
const authService = require('../services/auth')

async function logout(req, res) {
  try {
    const sessionId = req.cookies[authService.COOKIE_NAME]
    if (!sessionId) {
      return res.json()
    }
    await authService.logout(sessionId, res)
    debug('[logout] ended session %s', sessionId)
    return res.json()
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.logout = logout
