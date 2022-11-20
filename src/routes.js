const fs = require('fs/promises')
const bcrypt = require('bcrypt')
const debug = require('debug')('app:routes')
const { prisma } = require('./prisma')

const COOKIE_NAME = 'AuwSession'

async function login(req, res) {
  try {
    const email = req.body.email.trim()
    debug('[login] attempt for %s', email)
    const rawPassword = req.body.password.trim()

    const authData = JSON.parse(await fs.readFile('./auth.json', 'utf8'))
    const user = await authData.users.find(u => u.email === email)
    if (!user) {
      debug('[login] user not found')
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(rawPassword, user.password)
    if (!match) {
      debug('[login] no match')
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    user.lastLogin = new Date()
    const sessionId = Date.now()
    authData.sessions[sessionId] = user.email

    res.cookie(COOKIE_NAME, sessionId, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) })
    await fs.writeFile('./auth.json', JSON.stringify(authData, null, 2))
    debug('[login] started session %s for %s', sessionId, email)
    res.json({ user: { ...user, password: undefined } })
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.login = login

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

async function userActivityEvents(req, res) {
  try {
    const rows = await prisma.$queryRaw`select distinct "event" from "user_activity"`
    const rv = rows.map(r => r.event)
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.userActivityEvents = userActivityEvents
