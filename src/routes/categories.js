const express = require('express')
const { getCategories, saveCategories } = require('../services/categories')
const debug = require('debug')('app:routes:categories')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const rv = await getCategories()
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const rv = await saveCategories(req.body)
    return res.json(rv)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
})

exports.categories = router
