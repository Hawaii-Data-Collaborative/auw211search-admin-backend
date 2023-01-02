const _ = require('lodash')
const dayjs = require('../dayjs')
const { prisma } = require('../prisma')

const TZ = 'US/Hawaii'

async function getKeywordChart({ start, end } = {}) {
  if (!start) {
    start = dayjs().tz(TZ).startOf('day').subtract(30, 'days').toJSON()
  }
  if (!end) {
    end = dayjs().tz(TZ).endOf('day').toJSON()
  }

  const uaList = await prisma.user_activity.findMany({
    where: {
      event: 'Search.Keyword',
      createdAt: {
        gte: start,
        lt: end
      }
    }
  })

  let map = {}
  for (const ua of uaList) {
    const data = JSON.parse(ua.data)
    const key = data.terms ? data.terms.toLowerCase().trim() : ''
    if (key) {
      if (!map[key]) {
        map[key] = 0
      }
      map[key]++
    }
  }

  let rv = []
  for (const [k, v] of Object.entries(map)) {
    rv.push({ keyword: k, count: v })
  }
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })
  rv = rv.sort((a, b) => b.count - a.count).splice(0, settings.trendingMaxShow)
  return rv
}

exports.getKeywordChart = getKeywordChart

async function getAllKeywordsChart({ start, end } = {}) {
  if (!start) {
    start = dayjs().tz(TZ).startOf('day').subtract(1, 'year').toJSON()
  }
  if (!end) {
    end = dayjs().tz(TZ).endOf('day').toJSON()
  }

  const uaList = await prisma.user_activity.findMany({
    where: {
      event: 'Search.Keyword',
      createdAt: {
        gte: start,
        lt: end
      }
    }
  })

  let map = {}
  for (const ua of uaList) {
    const key = dayjs(ua.createdAt).tz(TZ).format('YYYY-MM-DD')
    if (!map[key]) {
      map[key] = []
    }
    map[key].push(ua)
  }

  let rv = []
  for (const [k, v] of Object.entries(map)) {
    rv.push({
      date: k,
      count: v.length,
      keywords: [...new Set(v.map(ua => JSON.parse(ua.data).terms))],
      users: [...new Set(v.map(ua => ua.userId))],
      data: v
    })
  }

  return rv
}

exports.getAllKeywordsChart = getAllKeywordsChart

async function getRelatedNeedsChart({ start, end } = {}) {
  if (!start) {
    start = dayjs().tz(TZ).startOf('day').subtract(1, 'year').toJSON()
  }
  if (!end) {
    end = dayjs().tz(TZ).endOf('day').toJSON()
  }

  const uaList = await prisma.user_activity.findMany({
    where: {
      event: 'Search.Keyword',
      createdAt: {
        gte: start,
        lt: end
      }
    }
  })

  const root = { name: '', createdAt: new Date(), children: [] }
  const groups = _.groupBy(uaList, 'userId')
  // eslint-disable-next-line no-unused-vars
  for (let [userId, uaList] of Object.entries(groups)) {
    let parent = root
    for (const ua of uaList) {
      ua.createdAt = new Date(ua.createdAt)
    }
    uaList = _.sortBy(uaList, 'createdAt')
    let prevUa
    for (const ua of uaList) {
      const keywords = JSON.parse(ua.data).terms?.trim()
      if (!keywords) {
        continue
      }
      const node = { name: keywords, createdAt: ua.createdAt, children: [] }
      if (prevUa) {
        if (node.name === parent.name) {
          continue
        }
        const minutesDiff = dayjs.duration(ua.createdAt - prevUa.createdAt).asMinutes()
        if (minutesDiff > 60) {
          parent = root
          parent.children.push(node)
        } else {
          parent.children.push(node)
        }
      } else {
        parent.children.push(node)
      }
      parent = node
      prevUa = ua
    }
  }

  return root
}

exports.getRelatedNeedsChart = getRelatedNeedsChart
