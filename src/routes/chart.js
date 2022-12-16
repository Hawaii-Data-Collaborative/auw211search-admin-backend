const express = require('express')
const { getKeywordChart, getRelatedNeedsChart, getAllKeywordsChart } = require('../services/charts')
const debug = require('debug')('app:routes:chart')

const router = express.Router()

router.get('/keyword', async (req, res) => {
  try {
    const { start, end } = req.query
    const rv = await getKeywordChart({ start, end })
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/all-keywords', async (req, res) => {
  try {
    const { start, end } = req.query
    const rv = await getAllKeywordsChart({ start, end })
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/related-needs', async (req, res) => {
  try {
    const { start, end } = req.query
    const rv = await getRelatedNeedsChart({ start, end })
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

exports.chart = router
