require('dotenv').config()

const fs = require('fs')
const { execSync } = require('child_process')
const querystring = require('querystring')
const converter = require('json-2-csv')
const { prisma } = require('../prisma')
const zipData = require('../../zips.json')

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

const zipcodeMap = {}
for (const d of zipData) {
  zipcodeMap[d.zip] = d.county.replace(' County', '')
}

async function getData() {
  let args
  if (info?.lastSyncDate) {
    args = { where: { createdAt: { gt: info.lastSyncDate } } }
    console.log('[getData] lastSyncDate=%s', info.lastSyncDate)
  }

  const data = await prisma.user_activity.findMany(args)
  for (const ua of data) {
    let json
    try {
      json = JSON.parse(ua.data)
    } catch {
      // no op
    }
    ua.dataTerms = json?.terms ?? ''
    ua.dataZip = json?.zip ?? ''
    ua.dataProgram = json?.program ?? ''
    ua.county = zipcodeMap[ua.dataZip] ?? ''
  }
  return data
}

exports.getData = getData

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

  fs.writeFileSync(
    './sfSync.json',
    JSON.stringify({ object: 'WebUserActivity__c', contentType: 'CSV', operation: 'insert', lineEnding: 'LF' }),
    'utf-8'
  )

  let csv = converter.json2csv(data, {
    keys: ['createdAt', 'id', 'userId', 'event', 'data', 'dataTerms', 'dataZip', 'dataProgram', 'county']
  })
  const lines = csv.split('\n')
  lines[0] = 'CreatedAt__c,Eid__c,UserId__c,Name,Data__c,Data_Terms__c,Data_Zip__c,Data_Program__c,County__c'
  csv = lines.join('\n')
  fs.writeFileSync('./sfSync.csv', csv, 'utf-8')

  const tokenInfo = await getToken()
  const token = tokenInfo.access_token

  const cmd1 = `curl ${BASE_URL}/services/data/v60.0/jobs/ingest/ -H 'Authorization: Bearer ${token}' -H "Content-Type: application/json" -H "Accept: application/json" -H "X-PrettyPrint:1" -d @sfSync.json -X POST`
  const result1 = execSync(cmd1)
  console.log('[sendData] result1=%s', result1)
  const tmp = JSON.parse(result1)
  const jobId = tmp.id
  const cmd2 = `curl ${BASE_URL}/services/data/v60.0/jobs/ingest/${jobId}/batches/ -H 'Authorization: Bearer ${token}' -H "Content-Type: text/csv" -H "Accept: application/json" -H "X-PrettyPrint:1" --data-binary @sfSync.csv -X PUT`
  const result2 = execSync(cmd2)
  console.log('[sendData] result2=%s', result2)
  const cmd3 = `curl ${BASE_URL}/services/data/v60.0/jobs/ingest/${jobId}/ -H 'Authorization: Bearer ${token}' -H "Content-Type: application/json; charset=UTF-8" -H "Accept: application/json" -H "X-PrettyPrint:1" --data-raw '{ "state" : "UploadComplete" }' -X PATCH`
  const result3 = execSync(cmd3)
  console.log('[sendData] result3=%s', result3)
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
  console.log('[deleteData] data.records.length=%s', data.records.length)

  for (const obj of data.records) {
    const res = await fetch(`${BASE_URL}/services/data/v60.0/sobjects/WebUserActivity__c/${obj.Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const result = await res.text()
    console.log('[deleteData] obj.Id=%s res.status=%s', obj.Id, res.status)
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
