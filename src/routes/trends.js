const express = require('express')
const { getTrends } = require('../services/trends')
const debug = require('debug')('app:routes:trends')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const rv = await getTrends()
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

exports.trends = router
