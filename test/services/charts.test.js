const { getRelatedNeedsChart } = require('../../src/services/charts')

test('getRelatedNeedsChart()', async () => {
  const result = await getRelatedNeedsChart()
  expect(result.nodes.length).toBeGreaterThan(0)
  expect(result.links.length).toBeGreaterThan(0)
})
