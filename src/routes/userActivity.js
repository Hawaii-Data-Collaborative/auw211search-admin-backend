const debug = require('debug')('adminapp:routes:userActivity')
const { getUserActivityEventNames, getUserActivityUsers } = require('../services/userActivity')

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

async function userActivityUsers(req, res) {
  try {
    const rv = await getUserActivityUsers()
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.userActivityUsers = userActivityUsers
