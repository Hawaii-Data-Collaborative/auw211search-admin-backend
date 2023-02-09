const authService = require('../../src/services/auth')

test('login()', async () => {
  const email = 'kyle@windwardapps.com'
  const rawPassword = '*** fill this in but dont commit it ***'
  const res = { cookie: jest.fn() }
  const user = await authService.login(email, rawPassword, res)
  expect(res.cookie).toHaveBeenCalled()
  expect(user).toMatchObject({
    email: expect.any(String)
  })
})

test('resetPassword()', async () => {
  const email = 'kyle@windwardapps.com'
  const user = await authService.resetPassword(email)
  expect(user.passwordResetToken).not.toBeNull()
  expect(user.passwordResetExp).not.toBeNull()
})
