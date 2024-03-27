const { sfSync, getToken } = require('../src/scripts/sfSync')

test('sync', async () => {
  const rv = await sfSync()
  expect(rv).not.toBeNull()
})

test('getToken', async () => {
  const rv = await getToken()
  expect(rv).not.toBeNull()
})
