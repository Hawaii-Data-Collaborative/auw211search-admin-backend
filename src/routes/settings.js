const axios = require('axios')
const express = require('express')
const debug = require('debug')('adminapp:routes:settings')
const { prisma } = require('../prisma')
const settingsService = require('../services/settings')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    delete settings.createdAt
    return res.json(settings)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const data = req.body
    debug('data=%j', data)
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

router.get('/cron', async (req, res) => {
  try {
    const token = Buffer.from(req.session.id).toString('base64')
    const headers = { Authorization: `Bearer ${token}` }
    const res2 = await axios.get(`${process.env.API_URL}/admin/cron`, { headers })
    return res.json(res2.data)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/cron', async (req, res) => {
  try {
    const token = Buffer.from(req.session.id).toString('base64')
    const headers = { Authorization: `Bearer ${token}` }
    const query = new URLSearchParams(req.query).toString()
    const res2 = await axios.post(`${process.env.API_URL}/admin/cron?${query}`, req.body, { headers })
    return res.json(res2.data)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

exports.settings = router
