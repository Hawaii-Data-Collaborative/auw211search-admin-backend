const fs = require('fs/promises')
const debug = require('debug')('app:routes:session')

const COOKIE_NAME = 'AuwSession'

async function session(req, res) {
  try {
    const sessionId = req.cookies[COOKIE_NAME]
    if (!sessionId) {
      return res.json({ user: null })
    }

    const authData = JSON.parse(await fs.readFile('./auth.json', 'utf8'))
    const email = authData.sessions[sessionId]
    if (!email) {
      return res.json({ user: null })
    }

    const user = authData.users.find(u => u.email === email)
    debug('[session] found session %s for %s', sessionId, email)
    res.json({ ...user, password: undefined })
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.session = session
