const bcrypt = require('bcrypt')
const dayjs = require('../dayjs')
const debug = require('debug')('app:services:login')
const { prisma } = require('../prisma')
const emailService = require('./email')

const COOKIE_NAME = 'AuwSession'
exports.COOKIE_NAME = COOKIE_NAME

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

async function login(email, rawPassword, res) {
  debug('[login] attempt for %s', email)

  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) {
    debug('[login] user not found')
    throw new Error('Invalid credentials')
  }

  const match = await bcrypt.compare(rawPassword, user.password)
  if (!match) {
    debug('[login] no match')
    throw new Error('Invalid credentials')
  }

  const lastLogin = new Date()
  user.lastLogin = lastLogin
  await prisma.user.update({
    data: { lastLogin: lastLogin.toJSON() },
    where: { id: user.id }
  })

  const sessionId = String(Date.now())
  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toJSON()
    }
  })

  res.cookie(COOKIE_NAME, sessionId, { expires: new Date(Date.now() + ONE_YEAR) })
  debug('[login] started session %s for %s', sessionId, email)

  return user
}

exports.login = login

async function getSession(req) {
  const sessionId = req.cookies[COOKIE_NAME]
  if (!sessionId) {
    return null
  }
  const sessions = await prisma.session.findMany({
    where: {
      id: sessionId
    }
  })
  if (sessions.length !== 1) {
    return null
  }
  return sessions[0]
}

exports.getSession = getSession

async function getUser(req) {
  const session = await getSession(req)
  if (!session) {
    return null
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.userId
    }
  })
  return user
}

exports.getUser = getUser

async function resetPassword(email) {
  let user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const passwordResetToken = bcrypt.genSaltSync()
  const passwordResetExp = dayjs().add(10, 'minutes').toJSON()
  user = await prisma.user.update({
    data: {
      passwordResetToken,
      passwordResetExp
    },
    where: {
      id: user.id
    }
  })

  debug('[resetPassword] updated reset password info for user %s', user.id)

  const subject = 'Password Reset'
  // prettier-ignore
  const url = `${process.env.ORIGIN}/#/reset_password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(passwordResetToken)}`
  const body = `
    <p>Aloha,</p>
    <p><a href="${url}" target="_blank">Click this link</a> to reset your password.</p>
    <p>Mahalo!</p>
  `

  await emailService.send({ email: user.email, subject, body })
  return user
}

exports.resetPassword = resetPassword

async function checkResetPasswordToken(passwordResetToken) {
  let user = await prisma.user.findFirst({
    where: { passwordResetToken }
  })

  if (!user) {
    throw new Error('Invalid token')
  }

  const exp = new Date(user.passwordResetExp)
  if (exp < new Date()) {
    throw new Error('Token expired')
  }

  return user
}

exports.checkResetPasswordToken = checkResetPasswordToken

async function changePassword(email, rawPassword, res) {
  let user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) {
    throw new Error('Invalid email')
  }

  const password = bcrypt.hashSync(rawPassword, 10)

  user = await prisma.user.update({
    data: {
      password,
      passwordResetToken: null,
      passwordResetExp: null,
      lastLogin: new Date().toJSON(),
      updatedAt: new Date().toJSON()
    },
    where: {
      id: user.id
    }
  })

  const sessionId = String(Date.now())
  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toJSON()
    }
  })

  res.cookie(COOKIE_NAME, sessionId, { expires: new Date(Date.now() + ONE_YEAR) })

  debug('[changePassword] updated password for user %s', user.id)
  return user
}

exports.changePassword = changePassword
