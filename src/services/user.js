const debug = require('debug')('app:services:user')
const { prisma } = require('../prisma')
const authService = require('./auth')

async function create(email) {
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

  debug('[create] created user %s', user.id)

  await authService.resetPassword(email, 'CREATE')

  return { id: user.id, email: user.email }
}

exports.create = create
