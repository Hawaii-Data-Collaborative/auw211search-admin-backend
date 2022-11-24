const fs = require('fs/promises')
const debug = require('debug')('app:routes:logout')

const COOKIE_NAME = 'AuwSession'

async function logout(req, res) {
  try {
    const sessionId = req.cookies[COOKIE_NAME]
    if (!sessionId) {
      return res.json()
    }

    const authData = JSON.parse(await fs.readFile('./auth.json', 'utf8'))
    delete authData.sessions[sessionId]
    await fs.writeFile('./auth.json', JSON.stringify(authData, null, 2))
    res.clearCookie(COOKIE_NAME)
    debug('[logout] ended session %s', sessionId)
    return res.json()
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.logout = logout
