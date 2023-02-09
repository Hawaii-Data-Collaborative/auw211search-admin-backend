const emailService = require('../src/services/email')

test('email.send()', async () => {
  const rv = await emailService.send({
    email: 'kyle@windwardapps.com',
    subject: 'Test Email',
    body: '<p>Test</p>'
  })
  expect(rv).toBeUndefined()
})
