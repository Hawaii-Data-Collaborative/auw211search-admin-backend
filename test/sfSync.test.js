const { sfSync, getToken, deleteData, getData } = require('../src/scripts/sfSync')

test('getToken', async () => {
  const rv = await getToken()
  expect(rv).not.toBeNull()
})

test('sfSync', async () => {
  const rv = await sfSync()
  expect(rv).not.toBeNull()
})

test('getData', async () => {
  const rv = await getData()
  expect(rv).not.toBeNull()
})

test('deleteData', async () => {
  const rv = await deleteData()
  expect(rv).not.toBeNull()
})
