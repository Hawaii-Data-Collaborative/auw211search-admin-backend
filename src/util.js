const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

function updateDateFilter(req) {
  try {
    if (req.body.params.filter.createdAt === 'today') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('day').toDate()
      delete req.body.params.filter.createdAt
    } else if (req.body.params.filter.createdAt === 'yesterday') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('day').subtract(1, 'day').toDate()
      req.body.params.filter.createdAt_lt = dayjs().tz('US/Hawaii').startOf('day').toDate()
      delete req.body.params.filter.createdAt
    } else if (req.body.params.filter.createdAt === 'thisWeek') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('week').toDate()
      delete req.body.params.filter.createdAt
    } else if (req.body.params.filter.createdAt === 'lastWeek') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('week').subtract(1, 'week').toDate()
      req.body.params.filter.createdAt_lt = dayjs().tz('US/Hawaii').startOf('week').toDate()
      delete req.body.params.filter.createdAt
    } else if (req.body.params.filter.createdAt === 'thisMonth') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('month').toDate()
      delete req.body.params.filter.createdAt
    } else if (req.body.params.filter.createdAt === 'thisQuarter') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('month').subtract(3, 'months').toDate()
      delete req.body.params.filter.createdAt
    } else if (req.body.params.filter.createdAt === 'thisYear') {
      req.body.params.filter.createdAt_gte = dayjs().tz('US/Hawaii').startOf('year').toDate()
      delete req.body.params.filter.createdAt
    }
  } catch {
    // no op
  }
}

exports.updateDateFilter = updateDateFilter
