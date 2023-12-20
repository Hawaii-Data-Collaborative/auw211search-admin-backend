require('dotenv').config()
const path = require('path')
// eslint-disable-next-line no-unused-vars
const debug = require('debug')('app:server')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const { createPrismaHandler } = require('./createPrismaHandler')
const routes = require('./routes')
const authService = require('./services/auth')

const app = express()
const port = process.env.PORT || 3000
const PROD = process.env.NODE_ENV === 'production'
const BASE_URL = PROD ? '/admin/api' : '/api'

app.use(morgan('combined'))
if (PROD) {
  app.use('/admin/static', express.static('../searchengine-admin-frontend/build/static'))
} else {
  app.use(cors({ origin: 'http://localhost:3097', credentials: true }))
}
app.use(express.json())
app.use(cookieParser())

// Anon routes
app.post(BASE_URL + '/login', routes.login)
app.post(BASE_URL + '/logout', routes.logout)
app.get(BASE_URL + '/session', routes.session)
app.post(BASE_URL + '/create_reset_password_token', routes.createResetPasswordToken)
app.post(BASE_URL + '/check_reset_password_token', routes.checkResetPasswordToken)
app.post(BASE_URL + '/update_password', routes.updatePassword)

// Auth routes
app.post(BASE_URL + '/agency', [sessionMiddleware], createPrismaHandler('agency'))
app.post(BASE_URL + '/program', [sessionMiddleware], createPrismaHandler('program'))
app.post(BASE_URL + '/user', [sessionMiddleware], createPrismaHandler('user', false))
app.post(BASE_URL + '/user_activity', [sessionMiddleware], createPrismaHandler('user_activity'))
app.post(BASE_URL + '/role', [sessionMiddleware], createPrismaHandler('role'))
app.get(BASE_URL + '/user_activity_events', [sessionMiddleware], routes.userActivityEvents)
app.get(BASE_URL + '/user_activity_users', [sessionMiddleware], routes.userActivityUsers)
app.use(BASE_URL + '/settings', [sessionMiddleware], routes.settings)
app.use(BASE_URL + '/chart', [sessionMiddleware], routes.chart)
app.use(BASE_URL + '/trends', [sessionMiddleware], routes.trends)
app.use(BASE_URL + '/categories', [sessionMiddleware], routes.categories)
app.use(BASE_URL + '/users', [sessionMiddleware], routes.users)

const fileSuffixes = ['js', 'css', 'map', 'txt', 'jpg', 'jpeg', 'png', 'svg']

app.use((req, res, next) => {
  if (PROD) {
    let isFileLike
    try {
      isFileLike = fileSuffixes.includes(req.path.split('/').pop().split('.').pop())
    } catch {
      // no op
    }
    if (isFileLike === false) {
      return res.sendFile(path.resolve('../searchengine-admin-frontend/build/index.html'))
    }
  }
  next()
})

app.listen(port, () => {
  console.log(`App server listening on port ${port}`)
})

async function sessionMiddleware(req, res, next) {
  const user = await authService.getUser(req)
  req.user = user
  if (user) {
    next()
  } else {
    res.status(401)
    next(new Error('Not authenticated'))
  }
}
