const debug = require('debug')('app:routes:userActivity')
const { getUserActivityEventNames } = require('../services/userActivity')

async function userActivityEvents(req, res) {
  try {
    const rv = await getUserActivityEventNames()
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.userActivityEvents = userActivityEvents
