const express = require('express')
const userService = require('../services/user')
const debug = require('debug')('app:routes:users')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const email = req.body.email.trim()
    const rv = await userService.create(email)
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(err.status || 500).json({ message: err.message })
  }
})

exports.users = router
