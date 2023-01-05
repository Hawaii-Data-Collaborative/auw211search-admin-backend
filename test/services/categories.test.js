const { saveCategories } = require('../../src/services/categories')

test('saveCategories()', async () => {
  const result = await saveCategories(data)
  expect(result.length).toBeGreaterThan(0)
})

const data = [
  {
    name: 'Aging and Disabilities',
    icon: '/disability.svg',
    children: [
      {
        name: 'Senior and Older Adults',
        params:
          'LH-0350,BT-4500.6500-800,PH-2400.7000,PH-0320,PH-7000.6000-060,BH-8400.6000-060,LR-1550,BH-8500.8000,TD-1600.3100-800,ND-6500.8000,ND-9200.8000&query_type=taxonomy&category_name=Senior%20and%20Older%20Adults&query_language=en'
      },
      {
        name: 'Assistive Technology',
        params:
          'LH-0600,LH-0650.0250,LH-0650.0700,LH-2700.0500,LH-0600.5000-100,PH-3500.1470,PH-3500.8500&query_type=taxonomy&category_name=Assistive%20Technology&query_language=en'
      },
      {
        name: 'Therapy',
        params:
          'LR-0450,RP-8000.1925,PN-8100.3000,LR-8000.8000&query_type=taxonomy&category_name=Therapy&query_language=en'
      },
      {
        name: 'Deafness and Blindness',
        params:
          'TJ-4500.8300-100,TJ-3200.5000,ND-6500&query_type=taxonomy&category_name=Deafness%20and%20Blindness&query_language=en'
      },
      {
        name: 'Advocacy',
        params:
          'TN-1700,TD-1600.3100-180,DF-8000.4500,FT-1000.6600,FT-8000.8000,TD-1200.6600-900&query_type=taxonomy&category_name=Advocacy&query_language=en'
      }
    ]
  },
  {
    name: 'Crisis',
    icon: '/conflict.svg',
    children: [
      {
        name: 'Domestic Violence',
        params:
          'BH-1800.1500-100,FT-3000.1750,RP-1400.8000-020.21,RP-1500.1400-200,FF-0500.9100-180&query_type=taxonomy&category_name=Domestic%20Violence&query_language=en'
      },
      {
        name: 'Crisis Services',
        params:
          'RP-1500,RP-1500.1400,RP-1500.3300,RP-1500.1400-500&query_type=taxonomy&category_name=Crisis%20Services&query_language=en'
      },
      {
        name: 'Disaster Resources',
        params:
          'TH-2600,TH-1500.1700,TH-2900.6400-600,BD-2600.0300-130,TH-2900.1750,TH-1700,TH-1700.1800,TH-2300,TH-2100,PX-1900,TH-2300.1670,TH-1500.2000,TH-2900.1800-200,TH-2600.1580-500,TL-3650.2000-200&query_type=taxonomy&category_name=Disaster%20Resources&query_language=en'
      }
    ]
  },
  {
    name: 'Education',
    icon: '/education.svg',
    children: [
      {
        name: 'Educational Programs',
        params:
          'HD-0500,HH-0500.1830,TL-3800.1900,HH-3000,HH-7950,HH-0500.1600,HL-2500.8050,HL-8000.8000&query_type=taxonomy&category_name=Educational%20Programs&query_language=en'
      },
      {
        name: 'Schools/Institutions',
        params:
          'HD-6000.1400,HD-8000.1800-500,HD-1800.6500,HD-6500.6600-550,HD-6500.6600,HD-6500.6600-600,HH-8000.6000-650,HD-8000.8100,HH-8000.6500,HH-8000&query_type=taxonomy&category_name=Schools/Institutions&query_language=en'
      },
      {
        name: 'School Supplies',
        params: 'HL-8120.7800-200,TI-1800.8100&query_type=taxonomy&category_name=School%20Supplies&query_language=en'
      }
    ]
  },
  {
    name: 'Employment',
    icon: '/training.svg',
    children: [
      {
        name: 'Job Preparation and Training',
        params:
          'ND-3500,ND-2000.3500-630,ND-2000.6500-700,ND-6500.9500,ND-2000.3500-950&query_type=taxonomy&category_name=Job%20Preparation%20and%20Training&query_language=en'
      },
      {
        name: 'Job Search',
        params: 'ND-3500.3600&query_type=taxonomy&category_name=Job%20Search&query_language=en'
      }
    ]
  },
  {
    name: 'Family and Children',
    icon: '/people-in-need.svg',
    children: [
      {
        name: 'Child Care',
        params:
          'PH-1250.1400,NL-3000.1500,DF-4500.2000-130,PH-2400.1400,PH-2400.1500,JR-8200.1500-150,PH-2400.1550,PH-7000.6000-160,HD-1800.1800,PH-1250.1800,HD-1800.3000,HD-1800.8000&query_type=taxonomy&category_name=Child%20Care&query_language=en'
      },
      {
        name: 'Parenting Support',
        params:
          'PH-6100.6600,PH-6100.6800,PN-8100.6500,PH-6100.1600,PH-6100.3300,PN-8100.6500-650,PH-6100.1700,PH-6100&query_type=taxonomy&category_name=Parenting%20Support&query_language=en'
      },
      {
        name: 'Youth Development',
        params:
          'PS-9800.9670,PH-6500.1500-625,PS-9800.9900,TJ-3200.9500&query_type=taxonomy&category_name=Youth%20Development&query_language=en'
      }
    ]
  },
  {
    name: 'Financial',
    icon: '/poverty.svg',
    children: [
      {
        name: 'Utility Assistance',
        params: 'BV-8900.9300&query_type=taxonomy&category_name=Utility%20Assistance&query_language=en'
      },
      {
        name: 'Money Management',
        params:
          'DM,DM-7000,DM-1500.1500,BH-3700.3000,DM-1800.5000,DM-1800.1000,DM-1500.1500&query_type=taxonomy&category_name=Money%20Management&query_language=en'
      },
      {
        name: 'Rent Assistance',
        params:
          'NL-1000.2500,BH-3800.5000,BH-3800.7000,BH-3800.7250&query_type=taxonomy&category_name=Rent%20Assistance&query_language=en'
      }
    ]
  },
  {
    name: 'Food',
    icon: '/food.svg',
    children: [
      {
        name: 'Emergency Food',
        params:
          'BD-1800.2000,NL-6000.2000-220,BD-1800.2250,BD-2400.2590,BD-5000.3500,TJ-3200,BD-1800.2000-620,BD-1800.2000-640&query_type=taxonomy&category_name=Emergency%20Food&query_language=en'
      },
      {
        name: 'Food Collection and Outlets',
        params:
          'BD-2600.0300-110,BD-2600.0300-115,BD-2600.0300-130,DF-7000.2250,BD-2600.0500,JR-8200.2350,BD-1875.2000,BD-1875.2700,BD-2400.2250&query_type=taxonomy&category_name=Food%20Collection%20and%20Outlets&query_language=en'
      },
      {
        name: 'Meals',
        params:
          'BD-5000.0200,PH-2950.1500-200,BD-5000.1500,BD-5000,BD-5000.8200,BD-5000.8300,BD-5000.8500,PH-2950.8500-870&query_type=taxonomy&category_name=Meals&query_language=en'
      }
    ]
  },
  {
    name: 'Healthcare',
    icon: '/health-post.svg',
    children: [
      {
        name: 'Health Insurance',
        params: 'LH-3000,NS-8000.9000,LH-3500&query_type=taxonomy&category_name=Health%20Insurance&query_language=en'
      },
      {
        name: 'COVID-19',
        params: 'LT-3400.1525&query_type=taxonomy&category_name=COVID-19&query_language=en'
      },
      {
        name: 'Dental Care',
        params: 'LV-1600.1900,TN-5000.1800,LH-3000&query_type=taxonomy&category_name=Dental%20Care&query_language=en'
      },
      {
        name: 'Health Facilities',
        params:
          'PH-0320.0200,LL-3000.1450,LN-1500,LL-3000,LL-6000,RM-3300.6500,LL-6000.8000,LN-9000,LN-9500&query_type=taxonomy&category_name=Health%20Facilities&query_language=en'
      }
    ]
  },
  {
    name: 'Housing/Shelter',
    icon: '/house.svg',
    children: [
      {
        name: 'Emergency Housing',
        params:
          'BH-0500,BH-1800.3500,BH-8400.3000,BH-1800.8500,BM-6500.6500-850,YM-8500,LJ-5000.6550,BH-1800.1500-800&query_type=taxonomy&category_name=Emergency%20Housing&query_language=en'
      },
      {
        name: 'Permanent Housing',
        params:
          'BH-8400.6000-040,PH-6300.8000,BH-7000.4600&query_type=taxonomy&category_name=Permanent%20Housing&query_language=en'
      },
      {
        name: 'Housing Expense Assistance',
        params:
          'NL-1000.2500,BH-3800.5000,BH-3800.7000,BH-3800.7250&query_type=taxonomy&category_name=Housing%20Expense%20Assistance&query_language=en'
      }
    ]
  },
  {
    name: 'Legal',
    icon: '/rule-of-law-and-justice.svg',
    children: [
      {
        name: 'Courts',
        params:
          'FC-8200.8100-200,FC-8200.8100-650,FC-8200,FC-9500,FC-8000&query_type=taxonomy&category_name=Courts&query_language=en'
      },
      {
        name: 'Law Enforcement',
        params:
          'FL-0700,FL-1000,FL-1000,FL-5100,FL-6500,FN-1500.1550,FN-1700.1800,FN-1900,FN-2100&query_type=taxonomy&category_name=Law%20Enforcement&query_language=en'
      },
      {
        name: 'General Legal Services',
        params:
          'FT-3200,FP-4000,PX-1850,FT-3600,FT-3000.1750&query_type=taxonomy&category_name=General%20Legal%20Services&query_language=en'
      }
    ]
  },
  {
    name: 'Mental Health and Addiction',
    icon: '/mental-health.svg',
    children: [
      {
        name: 'Mental Health Care Facilities',
        params:
          'HL-8120.7800-200,TI-1800.8100&query_type=taxonomy&category_name=Mental%20Health%20Care%20Facilities&query_language=en'
      },
      {
        name: 'Mental Health Assessment & Treatment',
        params:
          'RP-1400.8000,RP-1400.8000-300&query_type=taxonomy&category_name=Mental%20Health%20Assessment%20&%20Treatment&query_language=en'
      },
      {
        name: 'Mental Health Support Services',
        params:
          'RP-1400.8000,RP-1400.8000-300&query_type=taxonomy&category_name=Mental%20Health%20Support%20Services&query_language=en'
      },
      {
        name: 'Substance Use Disorder Services',
        params:
          'RX-1700,RX-8250,RX-8250.0550,RX-8250.1700,RX-8450.8000,RX-8250.8000,RX-8500.8000,RX-8450.1150&query_type=taxonomy&category_name=Substance%20Use%20Disorder%20Services&query_language=en'
      }
    ]
  },
  {
    name: 'Transportation',
    icon: '/bus.svg',
    children: [
      {
        name: 'Local Transportation',
        params:
          'BT-4500.6500-800,BT-4500.4700-500,BT-4500.4600,BT-4500.6500,BT-4500.6500-170,BT-4500.6500-500,BT-4500.4500-153&query_type=taxonomy&category_name=Local%20Transportation&query_language=en'
      },
      {
        name: 'Long Distance Transportation',
        params: 'BT-4800.0500-080&query_type=taxonomy&category_name=Long%20Distance%20Transportation&query_language=en'
      },
      {
        name: 'Transportation Expense Assistance',
        params: 'BT-8300.0500&query_type=taxonomy&category_name=Transportation%20Expense%20Assistance&query_language=en'
      },
      {
        name: 'Transportation Passes',
        params: 'BT-8500.1000-180&query_type=taxonomy&category_name=Transportation%20Passes&query_language=en'
      },
      {
        name: 'Travelers Assistance',
        params:
          'BT-8750,BT-8750.1800,BT-8750.8500&query_type=taxonomy&category_name=Travelers%20Assistance&query_language=en'
      }
    ]
  }
]
