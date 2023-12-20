const emailService = require('../src/services/email')

test('email.send()', async () => {
  const rv = await emailService.send({
    to: 'kyle@windwardapps.com',
    subject: 'Test Email',
    html: '<p>Test</p>'
  })
  expect(rv).toBeUndefined()
})
