const express = require('express')
const debug = require('debug')('adminapp:routes:settings')
const { prisma } = require('../prisma')
const settingsService = require('../services/settings')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    return res.json(settings)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const data = req.body
    const settings = await prisma.settings.update({ where: { id: 1 }, data })
    return res.json(settings)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/sync_db', async (req, res) => {
  try {
    const result = await settingsService.getDBLastSyncDate()
    return res.json(result)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/sync_db', async (req, res) => {
  try {
    const result = await settingsService.syncDb()
    return res.json(result)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

exports.settings = router
