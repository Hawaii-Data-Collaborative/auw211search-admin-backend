const { exec } = require('child_process')
const fs = require('fs/promises')
const util = require('util')
const debug = require('debug')('app:services:settings')

const execAsync = util.promisify(exec)

async function getDBLastSyncDate() {
  const apiDir = process.env.MAIN_API_PATH
  const path = `${apiDir}/LAST_SYNC`
  debug('[getDBLastSyncDate] path=%s', path)
  const data = await fs.readFile(path, 'utf-8')
  return data ? data.trim() : null
}

exports.getDBLastSyncDate = getDBLastSyncDate

async function syncDb() {
  const apiDir = process.env.MAIN_API_PATH
  debug('[syncDb] apiDir=%s', apiDir)
  const cmd = `cd ${apiDir} && ./scripts/copyDataFromSF.sh`
  const result = await execAsync(cmd)
  return result.stdout
}

exports.syncDb = syncDb