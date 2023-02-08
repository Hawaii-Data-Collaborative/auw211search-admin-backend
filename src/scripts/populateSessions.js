require('dotenv').config()
const fs = require('fs/promises')
const { prisma } = require('../prisma')

async function main() {
  const { sessions } = JSON.parse(await fs.readFile('./auth.json', 'utf8'))
  const users = await prisma.user.findMany()
  const userMap = {}
  for (const user of users) {
    userMap[user.email] = user.id
  }
  for (const [sessionId, email] of Object.entries(sessions)) {
    const userId = userMap[email]
    if (userId) {
      const session = await prisma.session.create({
        data: {
          id: sessionId,
          userId,
          createdAt: new Date().toJSON()
        }
      })
      console.log('created session %s', session.id)
    } else {
      console.log('userId not found for session %s', sessionId)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
