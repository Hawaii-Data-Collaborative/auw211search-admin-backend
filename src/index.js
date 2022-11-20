require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { defaultHandler } = require('ra-data-simple-prisma')
const { prisma } = require('./prisma')
const { userActivityEvents, login, session, logout } = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors({ origin: 'http://localhost:3097', credentials: true }))
app.use(cookieParser())

const prismaHandler = (req, res) => defaultHandler(req, res, prisma)

app.post('/api/agency', prismaHandler)
app.post('/api/program', prismaHandler)
app.post('/api/user_activity', prismaHandler)
app.get('/api/user_activity_events', userActivityEvents)
app.post('/api/login', login)
app.post('/api/logout', logout)
app.get('/api/session', session)

app.listen(port, () => {
  console.log(`App server listening on port ${port}`)
})
