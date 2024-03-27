require('dotenv').config()

const fs = require('fs')
const querystring = require('querystring')
const { prisma } = require('../prisma')

const { SF_CONSUMER_KEY, SF_CONSUMER_SECRET } = process.env

if (!(SF_CONSUMER_KEY && SF_CONSUMER_SECRET)) {
  throw new Error('SF_CONSUMER_KEY/SF_CONSUMER_SECRET missing')
}

const BASE_URL = 'https://auw211.my.salesforce.com'
// const BASE_URL = 'https://login.salesforce.com'
const INFO_FILE = './info.json'
let info = {}
if (fs.existsSync(INFO_FILE)) {
  info = JSON.parse(fs.readFileSync(INFO_FILE, 'utf-8'))
}

async function getData() {
  let args
  if (info?.lastSyncDate) {
    args = { where: { createdAt: { gt: info.lastSyncDate } } }
    console.log('[getData] lastSyncDate=%s', info.lastSyncDate)
  }

  const data = await prisma.user_activity.findMany(args)
  return data
}

async function getToken() {
  const body = querystring.stringify({
    grant_type: 'client_credentials',
    client_id: SF_CONSUMER_KEY,
    client_secret: SF_CONSUMER_SECRET
  })
  const res = await fetch(BASE_URL + '/services/oauth2/token', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    body
  })
  const data = await res.json()
  return data
}

exports.getToken = getToken

async function sendData(data) {
  console.log('[sendData] data.length=%s', data.length)
  const tokenInfo = await getToken()
  const token = tokenInfo.access_token
  const results = []
  for (const ua of data) {
    const res = await fetch(BASE_URL + '/services/data/v60.0/sobjects/WebUserActivity__c', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Eid__c: ua.id,
        UserId__c: ua.userId,
        Name: ua.event,
        Data__c: ua.data
      })
    })
    const result = await res.json()
    console.log('[sendData] ua.id=%s res.status=%s', ua.id, res.status)
    results.push(result)
  }
  return results
}

async function deleteData() {
  const tokenInfo = await getToken()
  const token = tokenInfo.access_token
  const results = []

  const q = querystring.stringify({ q: 'select Id from WebUserActivity__c' })
  const res = await fetch(`${BASE_URL}/services/data/v60.0/query?${q}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  const data = await res.json()

  for (const obj of data.records) {
    const res = await fetch(`${BASE_URL}/services/data/v60.0/sobjects/WebUserActivity__c/${obj.Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const result = await res.text()
    console.log('[sendData] obj.Id=%s res.status=%s', obj.Id, res.status)
    results.push(result)
  }

  return results
}

exports.deleteData = deleteData

async function sfSync() {
  console.log('[sfSync] start')
  const data = await getData()
  await sendData(data)
  info.lastSyncDate = new Date()
  fs.writeFileSync(INFO_FILE, JSON.stringify(info, null, 2), 'utf-8')
  console.log('[sfSync] end, wrote %s', INFO_FILE)
}

exports.sfSync = sfSync

if (require.main === module) {
  if (process.argv.includes('--deleteData')) {
    deleteData()
  } else {
    sfSync()
  }
}
