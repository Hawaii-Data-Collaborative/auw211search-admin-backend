const debug = require('debug')('app:routes:resetPassword')
const authService = require('../services/auth')

async function createResetPasswordToken(req, res) {
  try {
    const email = req.body.email.trim()
    await authService.resetPassword(email)
    res.json()
  } catch (err) {
    debug(err)
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.createResetPasswordToken = createResetPasswordToken

async function checkResetPasswordToken(req, res) {
  try {
    const passwordResetToken = req.body.token.trim()
    await authService.checkResetPasswordToken(passwordResetToken)
    res.json()
  } catch (err) {
    debug(err)
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.checkResetPasswordToken = checkResetPasswordToken

async function updatePassword(req, res) {
  try {
    const email = req.body.email.trim()
    const rawPassword = req.body.password.trim()
    const user = await authService.changePassword(email, rawPassword, res)
    const { id, lastLogin } = user
    res.json({ id, email, lastLogin })
  } catch (err) {
    debug(err)
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.updatePassword = updatePassword
