const bcrypt = require('bcrypt')
const debug = require('debug')('app:services:login')
const { prisma } = require('../prisma')

const COOKIE_NAME = 'AuwSession'
exports.COOKIE_NAME = COOKIE_NAME

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

  res.cookie(COOKIE_NAME, sessionId, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) })
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
