require('dotenv').config()
const fs = require('fs/promises')
const readline = require('readline')
const util = require('util')
const bcrypt = require('bcrypt')
const debug = require('debug')('app:scripts:addUser')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = util.promisify(rl.question).bind(rl)

async function main() {
  const email = await question('Email: ')
  const rawPassword = await question('Password: ')
  const rawPassword2 = await question('Password (again): ')
  if (rawPassword !== rawPassword2) {
    console.log("Passwords don't match")
    return
  }
  const password = bcrypt.hashSync(rawPassword, 10)
  const authData = JSON.parse(await fs.readFile('./auth.json', 'utf8'))
  authData.users.push({ email, password })
  await fs.writeFile('./auth.json', JSON.stringify(authData, null, 2))
  debug('added user, index=%s', authData.users.length - 1)
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
