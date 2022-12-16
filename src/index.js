require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { defaultHandler } = require('ra-data-simple-prisma')
const { prisma } = require('./prisma')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors({ origin: 'http://localhost:3097', credentials: true }))
app.use(cookieParser())

const prismaHandler = (req, res) => defaultHandler(req, res, prisma)

app.post('/api/agency', prismaHandler)
app.post('/api/program', prismaHandler)
app.post('/api/user_activity', prismaHandler)
app.get('/api/user_activity_events', routes.userActivityEvents)
app.get('/api/user_activity_users', routes.userActivityUsers)
app.post('/api/login', routes.login)
app.post('/api/logout', routes.logout)
app.get('/api/session', routes.session)
app.get('/api/settings', routes.getSettings)
app.post('/api/settings', routes.saveSettings)
app.use('/api/chart', routes.chart)

app.listen(port, () => {
  console.log(`App server listening on port ${port}`)
})
