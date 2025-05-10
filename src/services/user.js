const debug = require('debug')('adminapp:services:user')
const { prisma } = require('../prisma')
const authService = require('./auth')

async function create(email, roleIds) {
  let user = await prisma.user.findFirst({ where: { email } })
  if (user) {
    const err = new Error('Email address in use')
    err.status = 400
    throw err
  }

  user = await prisma.user.create({
    data: {
      email,
      password: '',
      createdAt: new Date().toJSON()
    }
  })

  const userId = user.id
  debug('[create] created user %s', userId)

  for (const roleId of roleIds) {
    const ur = await prisma.user_role.create({
      data: {
        userId,
        roleId,
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
      }
    })
    debug('[create] created userRole %s', ur.id)
  }

  await authService.resetPassword(email, 'CREATE')

  return { ...user, password: undefined }
}

exports.create = create

async function update(data) {
  const { roleIds, ...userData } = data
  const user = await prisma.user.update({
    data: {
      ...userData,
      updatedAt: new Date().toJSON()
    },
    where: {
      id: userData.id
    }
  })

  const userId = user.id
  debug('[update] updated user %s', userId)

  const { count } = await prisma.user_role.deleteMany({ where: { userId } })
  debug('[update] deleted %s userRoles', count)
  for (const roleId of roleIds) {
    const ur = await prisma.user_role.create({
      data: {
        userId,
        roleId,
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON()
      }
    })
    debug('[update] created userRole %s', ur.id)
  }

  return { ...user, password: undefined }
}

exports.update = update
