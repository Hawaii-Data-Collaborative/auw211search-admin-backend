const { getRelatedNeedsChart } = require('../../src/services/charts')

test('getRelatedNeedsChart()', async () => {
  const result = await getRelatedNeedsChart()
  expect(result.children.length).toBeGreaterThan(0)
})
