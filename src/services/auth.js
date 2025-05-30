const bcrypt = require('bcrypt')
const dayjs = require('../dayjs')
const debug = require('debug')('app:services:auth')
const { prisma } = require('../prisma')
const emailService = require('./email')
const { getRandomString } = require('../util')

const PROD = process.env.NODE_ENV === 'production'
const COOKIE_NAME = 'Auw211Session-Admin'
exports.COOKIE_NAME = COOKIE_NAME

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

function startSession(res, sessionId) {
  const options = { expires: new Date(Date.now() + ONE_YEAR) }
  if (PROD) {
    options.path = '/admin'
  }
  res.cookie(COOKIE_NAME, sessionId, options)
}

function endSession(res) {
  const options = { expires: new Date('2000-01-01T00:00:00.000Z') }
  if (PROD) {
    options.path = '/admin'
  }
  res.cookie(COOKIE_NAME, '', options)
}

async function login(email, rawPassword, res) {
  debug('[login] attempt for %s', email)

  const user = await prisma.user.findFirst({ where: { email, type: 'ADMIN' } })
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
    data: { lastLogin: lastLogin.toJSON(), updatedAt: lastLogin.toJSON() },
    where: { id: user.id }
  })

  const sessionId = getRandomString(30)
  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toJSON()
    }
  })

  startSession(res, sessionId)
  debug('[login] started session %s for %s', sessionId, email)

  return user
}

exports.login = login

async function forceLogin(userId, res) {
  const user = await prisma.user.findFirst({ where: { id: userId } })
  if (!user) {
    debug('[forceLogin] user not found')
    throw new Error('User not found')
  }

  const sessionId = getRandomString(30)
  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toJSON()
    }
  })

  startSession(res, sessionId)
  debug('[forceLogin] started session %s for %s', sessionId, userId)

  return user
}

exports.forceLogin = forceLogin

async function logout(sessionId, res) {
  await prisma.session.delete({ where: { id: sessionId } })
  endSession(res)
}

exports.logout = logout

async function getSession(req) {
  const sessionId = req.cookies[COOKIE_NAME]
  debug('[getSession] sessionId=%s', sessionId)
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
  const session = sessions[0]
  req.session = session
  return session
}

exports.getSession = getSession

async function getUser(req) {
  const session = await getSession(req)
  if (!session) {
    debug('[getUser] no session')
    return null
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      type: 'ADMIN'
    }
  })

  debug('[getUser] user=%s', user.id)
  const userRoles = await prisma.user_role.findMany({ where: { userId: user.id } })
  const roles = await prisma.role.findMany({ where: { id: { in: userRoles.map(ur => ur.roleId) } } })
  const perms = []
  for (const role of roles) {
    if (role.permissions) {
      perms.push(...role.permissions.split(';'))
    }
  }
  user.permissions = [...new Set(perms)]
  return user
}

exports.getUser = getUser

async function resetPassword(email, action = 'RESET') {
  let user = await prisma.user.findFirst({
    where: { email, type: 'ADMIN' }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const passwordResetToken = bcrypt.genSaltSync()
  const passwordResetExp = action === 'CREATE' ? dayjs().add(1, 'year').toJSON() : dayjs().add(10, 'minutes').toJSON()
  user = await prisma.user.update({
    data: {
      passwordResetToken,
      passwordResetExp,
      updatedAt: new Date().toJSON()
    },
    where: {
      id: user.id
    }
  })

  debug('[resetPassword] updated reset password info for user %s', user.id)

  const subject = action === 'RESET' ? 'Password Reset' : 'Activate Account'
  // prettier-ignore
  const url = `${process.env.ORIGIN}/#/reset_password?email=${encodeURIComponent(email)}&action=${action.toLowerCase()}&token=${encodeURIComponent(passwordResetToken)}`
  // prettier-ignore
  const html = `
    <p>Aloha,</p>
    <p><a href="${url}" target="_blank">Click this link</a> to ${ action === 'RESET' ? 'reset your password' : 'activate your account' }.</p>
    <p>Mahalo!</p>
  `

  await emailService.send({ to: user.email, subject, html })
  return user
}

exports.resetPassword = resetPassword

async function checkResetPasswordToken(passwordResetToken) {
  let user = await prisma.user.findFirst({
    where: { passwordResetToken, type: 'ADMIN' }
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
    where: { email, type: 'ADMIN' }
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

  const sessionId = getRandomString(30)
  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toJSON()
    }
  })

  startSession(res, sessionId)
  debug('[changePassword] updated password for user %s', user.id)
  return user
}

exports.changePassword = changePassword
