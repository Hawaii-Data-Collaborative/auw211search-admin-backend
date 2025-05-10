const debug = require('debug')('adminapp:services:categories')
const { prisma } = require('../prisma')

async function getCategories({ active = true } = {}) {
  const categories = await prisma.category.findMany({ where: { active } })
  const parents = categories.filter(c => !c.parentId)
  for (const parent of parents) {
    parent.children = categories.filter(c => c.parentId === parent.id)
  }
  return parents
}

exports.getCategories = getCategories

async function saveCategories(parents) {
  debug('[saveCategories] new list=%j', parents)
  const oldList = await prisma.category.findMany()
  debug('[saveCategories] old list=%j', oldList)
  const now = new Date().toJSON()
  let rv = []
  try {
    const ids = oldList.map(c => c.id)
    await prisma.category.deleteMany({ where: { id: { in: ids } } })
    for (const data of parents) {
      const parent = await prisma.category.create({
        data: {
          name: data.name,
          icon: data.icon,
          active: true,
          createdAt: now,
          updatedAt: now
        }
      })
      parent.children = []
      for (const childData of data.children) {
        const child = await prisma.category.create({
          data: {
            parentId: parent.id,
            name: childData.name,
            params: childData.params,
            active: true,
            createdAt: now,
            updatedAt: now
          }
        })
        parent.children.push(child)
      }
      rv.push(parent)
    }
  } catch (err) {
    await prisma.category.deleteMany({ where: { id: { gt: 0 } } })
    const newList = []
    for (const c of oldList) {
      delete c.id
      const newC = await prisma.category.create({ data: c })
      newList.push(newC)
    }
    debug('[saveCategories] rollback, restored %s rows, error=%s', newList.length, err)
    throw err
  }
  debug('[saveCategories] success, saved %s rows', rv.length)
  return rv
}

exports.saveCategories = saveCategories
