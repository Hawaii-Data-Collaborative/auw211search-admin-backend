const { sfSync, getToken, deleteData, getData, writeCsvFile, jsonToCsv } = require('../src/scripts/sfSync')

test('getToken', async () => {
  const rv = await getToken()
  expect(rv).not.toBeNull()
})

test('sfSync', async () => {
  const rv = await sfSync()
  expect(rv).not.toBeNull()
})

test('getData', async () => {
  const json = await getData()
  expect(json).not.toBeNull()
  const csv = jsonToCsv(json)
  const rv = writeCsvFile(csv)
  expect(rv).toBe(true)
})

test('deleteData', async () => {
  const rv = await deleteData()
  expect(rv).not.toBeNull()
})
