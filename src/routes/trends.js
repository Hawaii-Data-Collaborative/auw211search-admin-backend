const express = require('express')
const { getTrends, saveTrends, getManualTrends } = require('../services/trends')
const debug = require('debug')('adminapp:routes:trends')

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

router.get('/manual', async (req, res) => {
  try {
    const rv = await getManualTrends()
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const rv = await saveTrends(req.body)
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

exports.trends = router
