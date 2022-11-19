const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({ log: ['query'] })
exports.prisma = prisma
