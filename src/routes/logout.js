const debug = require('debug')('app:routes:logout')
const { prisma } = require('../prisma')
const { COOKIE_NAME } = require('../services/auth')

async function logout(req, res) {
  try {
    const sessionId = req.cookies[COOKIE_NAME]
    if (!sessionId) {
      return res.json()
    }

    res.clearCookie(COOKIE_NAME)
    await prisma.session.delete({ where: { id: sessionId } })
    debug('[logout] ended session %s', sessionId)
    return res.json()
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.logout = logout
