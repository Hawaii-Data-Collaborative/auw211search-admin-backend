const debug = require('debug')('app:routes:userActivity')
const { prisma } = require('../prisma')

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
