const dayjs = require('../dayjs')
const db = require('../db')
const { prisma } = require('../prisma')

const CREATED_DATE_AS_INT = `cast(replace(substr("createdAt", 0, 11), '-', '') as integer)`

async function getTrends() {
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } })
  const start = await getTrendStartDateAsInt(settings)
  const query = `select * from "user_activity" where "event" = 'Search.Keyword' and ${CREATED_DATE_AS_INT} >= ${start}`
  const rows = await db.query(query)
  const searchTextToCount = {}
  for (const row of rows) {
    try {
      row.data = JSON.parse(row.data)
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

async function getTrendStartDateAsInt(settings) {
  let unit = settings.trendingRange || 'month'
  let value = 1
  if (unit === 'quarter') {
    unit = 'month'
    value = 3
  }
  const start = Number(dayjs().subtract(value, unit).format('YYYYMMDD'))
  return start
}

async function getManualTrends() {
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: 1 } })
  let rv = []
  if (settings.trends) {
    rv = JSON.parse(settings.trends)
  }
  return rv
}

exports.getManualTrends = getManualTrends

async function saveTrends(trends) {
  const rv = await prisma.settings.update({ data: { trends: JSON.stringify(trends) }, where: { id: 1 } })
  return rv
}

exports.saveTrends = saveTrends
