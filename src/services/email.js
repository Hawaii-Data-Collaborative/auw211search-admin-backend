const debug = require('debug')('app:email')
const nodemailer = require('nodemailer')

const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM, SEND_EMAILS } = process.env

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
})

async function send({ to, subject, text, html }) {
  if (!SEND_EMAILS) {
    debug('SEND_EMAILS not set, return')
    return
  }

  const result = await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html
  })

  debug('[send]: result=%j', result)
  return result
}

exports.send = send
