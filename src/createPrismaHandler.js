const { defaultHandler } = require('ra-data-simple-prisma')
const meilisearch = require('./meilisearch')
const debug = require('debug')('adminapp:createPrismaHandler')
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
        if (modelName in overrides && method in overrides[modelName]) {
          const rv = await overrides[modelName][method](params)
          if (rv !== undefined) {
            return res.json(rv)
          }
        }

        if (modelName === 'program' && method === 'update') {
          updateProgramInMeilisearch = true
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

const overrides = {
  program: {
    getList: async params => {
      if (!params.filter?.q) {
        return
      }
      return programService.getPrograms(params)
    }
  },
  user: {
    getList: async params => {
      const users = await prisma.user.findMany({
        orderBy: {
          [params.sort.field]: params.sort.order.toLowerCase()
        }
      })
      await transformUsers(users)
      const count = await prisma.user.count()
      return { data: users, total: count }
    },
    getOne: async params => {
      const user = await prisma.user.findUnique({ where: params })
      await transformUsers([user])
      return { data: user }
    },
    create: async params => {
      const user = await userService.create(params.data.email, params.data.roleIds)
      return { data: user }
    },
    update: async params => {
      const user = await userService.update(params.data)
      return { data: user }
    }
  },
  role: {
    create: async params => {
      params.data.createdAt = new Date().toJSON()
      params.data.updatedAt = new Date().toJSON()
      if (Array.isArray(params.data.permissions)) {
        params.data.permissions = params.data.permissions.join(';')
      }
      const role = await prisma.role.create({ data: params.data })
      transformRole(role)
      return { data: role }
    },
    update: async params => {
      params.data.updatedAt = new Date().toJSON()
      if (Array.isArray(params.data.permissions)) {
        params.data.permissions = params.data.permissions.join(';')
      }
      const role = await prisma.role.update({ data: params.data, where: { id: params.id } })
      transformRole(role)
      return { data: role }
    },
    getList: async params => {
      const roles = await prisma.role.findMany({
        orderBy: {
          [params.sort.field]: params.sort.order.toLowerCase()
        }
      })
      for (const r of roles) {
        transformRole(r)
      }
      const count = await prisma.role.count()
      return { data: roles, total: count }
    },
    getOne: async params => {
      const role = await prisma.role.findUnique({ where: params })
      transformRole(role)
      return { data: role }
    }
  }
}

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
