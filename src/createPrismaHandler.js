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
          const user = await userService.create(params.data.email, params.data.roleIds)
          return res.json({ data: user })
        } else if (modelName === 'user' && method === 'update') {
          const user = await userService.update(params.data)
          return res.json({ data: user })
        } else if (modelName === 'user' && method === 'getList') {
          const users = await prisma.user.findMany({
            orderBy: {
              [params.sort.field]: params.sort.order.toLowerCase()
            }
          })
          await transformUsers(users)
          const count = await prisma.user.count()
          return res.json({ data: users, total: count })
        } else if (modelName === 'user' && method === 'getOne') {
          const user = await prisma.user.findUnique({ where: params })
          await transformUsers([user])
          return res.json({ data: user })
        } else if (modelName === 'role' && ['create', 'update'].includes(method)) {
          if (method === 'create') {
            params.data.createdAt = new Date().toJSON()
          }
          params.data.updatedAt = new Date().toJSON()
          if (Array.isArray(params.data.permissions)) {
            params.data.permissions = params.data.permissions.join(';')
          }
          let role
          if (method === 'create') {
            role = await prisma.role.create({ data: params.data })
          } else {
            role = await prisma.role.update({ data: params.data, where: { id: params.id } })
          }
          transformRole(role)
          return res.json({ data: role })
        } else if (modelName === 'role' && method === 'getList') {
          const roles = await prisma.role.findMany({
            orderBy: {
              [params.sort.field]: params.sort.order.toLowerCase()
            }
          })
          for (const r of roles) {
            transformRole(r)
          }
          const count = await prisma.role.count()
          return res.json({ data: roles, total: count })
        } else if (modelName === 'role' && method === 'getOne') {
          const role = await prisma.role.findUnique({ where: params })
          transformRole(role)
          return res.json({ data: role })
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

function transformRole(role) {
  if (role.permissions) {
    role.permissions = role.permissions.split(';')
  }
}

async function transformUsers(users) {
  const userRoles = await prisma.user_role.findMany()
  for (const u of users) {
    delete u.password
    delete u.passwordResetExp
    delete u.passwordResetToken
    u.roleIds = userRoles.filter(ur => ur.userId === u.id).map(ur => ur.roleId)
  }
}
