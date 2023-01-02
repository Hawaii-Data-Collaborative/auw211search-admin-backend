const { Database } = require('sqlite3')

const db = new Database(process.env.DB_FILE)

async function query(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

exports.query = query
