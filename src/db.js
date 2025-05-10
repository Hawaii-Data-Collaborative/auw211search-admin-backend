const { Pool } = require('pg')

const DB_URL = process.env.DB_URL
if (!DB_URL) {
  throw new Error('DB_URL is not set')
}

const pool = new Pool({
  connectionString: DB_URL,
  max: 3
})

async function query(sql) {
  const result = await pool.query(sql)
  return result.rows
}

exports.query = query
