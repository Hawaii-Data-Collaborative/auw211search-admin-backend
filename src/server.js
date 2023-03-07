require('dotenv').config()
// eslint-disable-next-line no-unused-vars
const debug = require('debug')('app:server')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { createPrismaHandler } = require('./createPrismaHandler')
const routes = require('./routes')
const authService = require('./services/auth')

const app = express()
const port = process.env.PORT || 3000

// Core middlewares
app.use(express.json())
app.use(cors({ origin: 'http://localhost:3097', credentials: true }))
app.use(cookieParser())

// Anon routes
app.post('/api/login', routes.login)
app.post('/api/logout', routes.logout)
app.get('/api/session', routes.session)
app.post('/api/create_reset_password_token', routes.createResetPasswordToken)
app.post('/api/check_reset_password_token', routes.checkResetPasswordToken)
app.post('/api/update_password', routes.updatePassword)

// Session middleware
app.use(sessionMiddleware)

// Auth routes
app.post('/api/agency', createPrismaHandler('agency'))
app.post('/api/program', createPrismaHandler('program'))
app.post('/api/user', createPrismaHandler('user'))
app.post('/api/user_activity', createPrismaHandler('user_activity'))
app.get('/api/user_activity_events', routes.userActivityEvents)
app.get('/api/user_activity_users', routes.userActivityUsers)
app.use('/api/settings', routes.settings)
app.use('/api/chart', routes.chart)
app.use('/api/trends', routes.trends)
app.use('/api/categories', routes.categories)
app.use('/api/users', routes.users)

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
