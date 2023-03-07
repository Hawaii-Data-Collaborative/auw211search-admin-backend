const { defaultHandler } = require('ra-data-simple-prisma')
const debug = require('debug')('app:createPrismaHandler')
const { prisma } = require('./prisma')
const { updateDateFilter } = require('./util')

function createPrismaHandler(modelName) {
  const prismaHandler = async (req, res) => {
    updateDateFilter(req)
    try {
      try {
        if (req.body.method === 'getList' && req.body.params.filter.q) {
          const { filter, pagination, sort } = req.body.params
          const q = filter.q.trim()
          if (modelName === 'program') {
            const where = {
              where: {
                OR: [
                  { keywords: { contains: q } },
                  { OwnerId: { contains: q } },
                  { IsDeleted: { contains: q } },
                  { Name: { contains: q } },
                  { Additional_Program_Information__c: { contains: q } },
                  { Age_Range_restrictions__c: { contains: q } },
                  { Criteria_for_Participation__c: { contains: q } },
                  { Description__c: { contains: q } },
                  { Family_Composition_restrictions__c: { contains: q } },
                  { Gender_restrictions_Other__c: { contains: q } },
                  { Income_Status_restrictions__c: { contains: q } },
                  { Insurance_Other__c: { contains: q } },
                  { Medical_Insurance_Plans_Accepted__c: { contains: q } },
                  { Other_restrictions__c: { contains: q } },
                  { Program_Contact_Email__c: { contains: q } },
                  { Program_Contact_Fax__c: { contains: q } },
                  { Program_Contact_Name__c: { contains: q } },
                  { Program_Contact_Phone__c: { contains: q } },
                  { Program_Contact_Title__c: { contains: q } },
                  { Race_or_Ethnicity_restrictions__c: { contains: q } },
                  { Status__c: { contains: q } },
                  { AKA_Name__c: { contains: q } },
                  { Accessibility__c: { contains: q } },
                  { Additional_Information__c: { contains: q } },
                  { Additional_Phones__c: { contains: q } },
                  { Eligibility__c: { contains: q } },
                  { Fax__c: { contains: q } },
                  { Fees_Text__c: { contains: q } },
                  { Hours__c: { contains: q } },
                  { Insurance__c: { contains: q } },
                  { Intake_Procedure__c: { contains: q } },
                  { Languages_Text__c: { contains: q } },
                  { Languages__c: { contains: q } },
                  { Program_Email_Text__c: { contains: q } },
                  { Program_Email__c: { contains: q } },
                  { Program_Phone__c: { contains: q } },
                  { Program_Taxonomies__c: { contains: q } },
                  { ServiceArea__c: { contains: q } },
                  { Service_Description__c: { contains: q } },
                  { Service_Group__c: { contains: q } },
                  { Taxonomy_10__c: { contains: q } },
                  { Taxonomy_1__c: { contains: q } },
                  { Taxonomy_2__c: { contains: q } },
                  { Taxonomy_3__c: { contains: q } },
                  { Taxonomy_4__c: { contains: q } },
                  { Taxonomy_5__c: { contains: q } },
                  { Taxonomy_6__c: { contains: q } },
                  { Taxonomy_7__c: { contains: q } },
                  { Taxonomy_8__c: { contains: q } },
                  { Taxonomy_9__c: { contains: q } },
                  { Transportation__c: { contains: q } },
                  { Website__c: { contains: q } },
                  { of_Search_Terms__c: { contains: q } },
                  { Program_Phone_Text__c: { contains: q } },
                  { Target_Long__c: { contains: q } },
                  { Eligibility_Long__c: { contains: q } },
                  { Accessibility_Long__c: { contains: q } },
                  { X211_Agency__c: { contains: q } },
                  { Program_Taxonomy_Rollup__c: { contains: q } },
                  { Age_Restriction_Other__c: { contains: q } },
                  { Age_Restrictions__c: { contains: q } },
                  { Business_Hours_Friday__c: { contains: q } },
                  { Business_Hours_Monday__c: { contains: q } },
                  { Business_Hours_Saturday__c: { contains: q } },
                  { Business_Hours_Sunday__c: { contains: q } },
                  { Business_Hours_Thursday__c: { contains: q } },
                  { Business_Hours_Tuesday__c: { contains: q } },
                  { Business_Hours_Wednesday__c: { contains: q } },
                  { Close_Time_Friday__c: { contains: q } },
                  { Close_Time_Monday__c: { contains: q } },
                  { Close_Time_Saturday__c: { contains: q } },
                  { Close_Time_Sunday__c: { contains: q } },
                  { Close_Time_Thursday__c: { contains: q } },
                  { Close_Time_Tuesday__c: { contains: q } },
                  { Close_Time_Wednesday__c: { contains: q } },
                  { CommunitiesServed__c: { contains: q } },
                  { Communities_Served_Other__c: { contains: q } },
                  { DocumentsRequiredPicklist__c: { contains: q } },
                  { Documents_Required_Other__c: { contains: q } },
                  { Gender_Restrictions__c: { contains: q } },
                  { Income_Restrictions_Other__c: { contains: q } },
                  { Income_Restrictions__c: { contains: q } },
                  { Intake_Procedure_Picklist__c: { contains: q } },
                  { Intake_Procedures_Other__c: { contains: q } },
                  { Languages_Consistently_Available__c: { contains: q } },
                  { Medical_Insurance_Types_Accepted__c: { contains: q } },
                  { Medical_Insurance_required__c: { contains: q } },
                  { Open_247__c: { contains: q } },
                  { Open_Time_Friday__c: { contains: q } },
                  { Open_Time_Monday__c: { contains: q } },
                  { Open_Time_Saturday__c: { contains: q } },
                  { Open_Time_Sunday__c: { contains: q } },
                  { Open_Time_Thursday__c: { contains: q } },
                  { Open_Time_Tuesday__c: { contains: q } },
                  { Open_Time_Wednesday__c: { contains: q } },
                  { Program_Special_Notes_Hours__c: { contains: q } },
                  { Race_Restrictions__c: { contains: q } },
                  { Race_or_Ethnicity_restrictions_other__c: { contains: q } },
                  { Site_Address__c: { contains: q } },
                  { Site_Name__c: { contains: q } },
                  { Site_Program_Changes__c: { contains: q } },
                  { Transportation_Description__c: { contains: q } },
                  { Transportation_Services_Offered__c: { contains: q } }
                ]
              }
            }
            const data = await prisma.program.findMany({
              where,
              take: pagination.perPage,
              skip: pagination.perPage * (pagination.page - 1),
              orderBy: {
                [sort.field]: sort.order.toLowerCase()
              }
            })
            const total = await prisma.program.count(where)
            return res.json({ data, total })
          }
        }
      } catch (err) {
        debug(err)
      }
      await defaultHandler(req, res, prisma)
    } catch (err) {
      debug(err)
      res.status(500).json({ message: err.message })
    }
  }
  return prismaHandler
}

exports.createPrismaHandler = createPrismaHandler
