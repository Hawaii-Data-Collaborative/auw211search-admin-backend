const debug = require('debug')('app:routes:login')
const authService = require('../services/auth')

async function login(req, res) {
  try {
    const email = req.body.email.trim()
    const rawPassword = req.body.password.trim()
    const user = await authService.login(email, rawPassword, res)
    res.json({ user: { ...user, password: undefined } })
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.login = login
