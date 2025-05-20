const dayjs = require('../dayjs')
const { prisma } = require('../prisma')

async function getTrends() {
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } })
  const start = await getTrendStartDate(settings)
  const ualist = await prisma.user_activity.findMany({
    where: {
      event: 'Search.Keyword',
      createdAt: {
        gte: start
      }
    }
  })
  const searchTextToCount = {}
  for (const row of ualist) {
    try {
      if (row.data.terms && !row.data.taxonomies) {
        const text = row.data.terms.toLowerCase().trim()
        if (!searchTextToCount[text]) {
          searchTextToCount[text] = 0
        }
        searchTextToCount[text]++
      }
    } catch (err) {
      // no op
    }
  }

  const rv = []
  for (const [text, count] of Object.entries(searchTextToCount)) {
    if (rv.length >= settings.trendingMaxShow) {
      break
    }
    if (count >= settings.trendingMinCount) {
      rv.push(text)
    }
  }
  return rv
}

exports.getTrends = getTrends

async function getTrendStartDate(settings) {
  let unit = settings.trendingRange || 'month'
  let value = 1
  if (unit === 'quarter') {
    unit = 'month'
    value = 3
  }
  const start = dayjs().subtract(value, unit).toDate()
  return start
}

async function getManualTrends() {
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } })
  return settings.trends
}

exports.getManualTrends = getManualTrends

async function saveTrends(trends) {
  const rv = await prisma.settings.update({ data: { trends: JSON.stringify(trends) }, where: { id: 1 } })
  return rv
}

exports.saveTrends = saveTrends
