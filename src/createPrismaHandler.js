const { defaultHandler } = require('ra-data-simple-prisma')
const meilisearch = require('./meilisearch')
const debug = require('debug')('app:createPrismaHandler')
const { prisma } = require('./prisma')
const programService = require('./services/program')
const userService = require('./services/user')
const { updateDateFilter } = require('./util')

function createPrismaHandler(modelName, useDefaultOnError = true) {
  const prismaHandler = async (req, res) => {
    updateDateFilter(req)
    try {
      let updateProgramInMeilisearch = false
      try {
        const { method, params } = req.body || {}
        if (modelName === 'program' && method === 'getList' && params.filter?.q) {
          const rv = await programService.getPrograms(params)
          return res.json(rv)
        } else if (modelName === 'program' && method === 'update') {
          updateProgramInMeilisearch = true
        } else if (modelName === 'user' && method === 'create') {
          const user = await userService.create(params.data.email)
          return res.json({ data: user })
        }
      } catch (err) {
        debug(err)
        if (!useDefaultOnError) {
          throw err
        }
      }

      await defaultHandler(req, res, prisma)

      if (updateProgramInMeilisearch) {
        const index = meilisearch.index('program')
        const task = await index.updateDocuments([req.body.params.data])
        debug('updated program in meilisearch, task=%j', task)
      }
    } catch (err) {
      debug(err)
      res.status(500).json({ message: err.message })
    }
  }
  return prismaHandler
}

exports.createPrismaHandler = createPrismaHandler
