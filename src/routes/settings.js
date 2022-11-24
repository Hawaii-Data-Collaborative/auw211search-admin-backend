const debug = require('debug')('app:routes:settings')
const { prisma } = require('../prisma')

async function getSettings(req, res) {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    return res.json(settings)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.getSettings = getSettings

async function saveSettings(req, res) {
  try {
    const data = req.body
    const settings = await prisma.settings.update({ where: { id: 1 }, data })
    return res.json(settings)
  } catch (err) {
    debug(err)
    res.status(500).json({ message: err.message })
  }
}

exports.saveSettings = saveSettings
