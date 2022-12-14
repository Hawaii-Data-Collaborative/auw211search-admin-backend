const { getUserActivityEventNames } = require('../../src/services/userActivity')

test('getUserActivityEventNames()', async () => {
  const result = await getUserActivityEventNames()
  expect(result).toMatchSnapshot()
})
