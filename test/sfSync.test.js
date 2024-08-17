const { prisma } = require('../src/prisma')
const { sfSync, getToken, deleteData, getData, writeCsvFile, jsonToCsv, processData } = require('../src/scripts/sfSync')

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

test('query', async () => {
  const data = await prisma.user_activity.findMany({
    where: {
      data: {
        contains: '"zip":"9'
      }
    }
  })

  processData(data)
  const csv = jsonToCsv(data)
  writeCsvFile(csv)
  // await sendData(true)
})
