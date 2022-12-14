const { prisma } = require('../prisma')

async function getUserActivityEventNames() {
  const rows = await prisma.$queryRaw`select distinct "event" from "user_activity" order by 1`
  const eventNames = rows.map(r => r.event)
  const set = new Set()
  for (const eventName of eventNames) {
    const arr = eventName.split('.')
    while (arr.length > 1) {
      arr.pop()
      set.add(arr.join('.'))
    }
    set.add(eventName)
  }

  const rv = [...set]
  rv.sort()
  return rv
}

exports.getUserActivityEventNames = getUserActivityEventNames
