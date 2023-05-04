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

  const MIN_SEARCH_COUNT_PER_NODE = 5

  const uaList = await prisma.user_activity.findMany({
    where: {
      event: 'Search.Keyword',
      createdAt: {
        gte: start,
        lt: end
      }
    }
  })

  let nodes = new Set()
  let links = []
  const groups = _.groupBy(uaList, 'userId')
  // eslint-disable-next-line no-unused-vars
  for (let [userId, uaList] of Object.entries(groups)) {
    for (const ua of uaList) {
      ua.createdAt = new Date(ua.createdAt)
    }
    uaList = _.sortBy(uaList, 'createdAt')
    let prevUa
    let prevSearchText
    for (const ua of uaList) {
      const searchText = JSON.parse(ua.data).terms?.toLowerCase().trim()
      if (searchText) {
        nodes.add(searchText)
        if (prevUa) {
          if (searchText !== prevSearchText) {
            const minutesDiff = dayjs.duration(ua.createdAt - prevUa.createdAt).asMinutes()
            if (minutesDiff <= 60) {
              links.push([prevSearchText, searchText])
            }
          }
        }
      }
      prevUa = ua
      prevSearchText = searchText
    }
  }

  nodes = Array.from(nodes).map(n => ({ id: n, value: 0 }))
  links = links.map(entry => {
    const [prevSearchText, searchText] = entry
    return {
      source: prevSearchText,
      target: searchText
    }
  })

  for (const node of nodes) {
    for (const link of links) {
      if (link.source === node.id || link.target === node.id) {
        node.value++
      }
    }
  }

  const filteredNodes = nodes.filter(n => n.value >= MIN_SEARCH_COUNT_PER_NODE)
  const filteredNodeNames = new Set(filteredNodes.map(n => n.id))
  const filteredLinks = links.filter(l => filteredNodeNames.has(l.source) && filteredNodeNames.has(l.target))

  return {
    nodes: filteredNodes,
    links: filteredLinks
  }
}

exports.getRelatedNeedsChart = getRelatedNeedsChart
