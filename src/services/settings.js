const { exec } = require('child_process')
const fs = require('fs/promises')
const util = require('util')
const debug = require('debug')('adminapp:services:settings')

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
  try {
    const result = await execAsync(cmd)
    debug('[syncDb] stdout=%s', result.stdout)
    debug('[syncDb] stderr=%s', result.stderr)
    return result.stdout
  } catch (err) {
    debug('[syncDb] error=%o', err)
    setTimeout(async () => {
      try {
        debug('[syncDb] restarting app')
        const cmd = `cd ${process.cwd()} && sudo ./restart.sh`
        await execAsync(cmd)
        debug('[syncDb] success')
      } catch (err) {
        debug('[syncDb] %o', err)
      }
    }, 500)
    throw err
  }
}

exports.syncDb = syncDb
