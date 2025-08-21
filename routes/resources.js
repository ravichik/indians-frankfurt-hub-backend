const express = require('express');
const router = express.Router();

const resources = {
  visa: [
    {
      id: 1,
      title: 'Blue Card Application Guide',
      description: 'Complete guide for EU Blue Card application process',
      url: '/resources/blue-card',
      category: 'visa'
    },
    {
      id: 2,
      title: 'Student Visa Requirements',
      description: 'Requirements and process for student visa in Germany',
      url: '/resources/student-visa',
      category: 'visa'
    },
    {
      id: 3,
      title: 'Family Reunion Visa',
      description: 'How to bring your family to Germany',
      url: '/resources/family-visa',
      category: 'visa'
    }
  ],
  housing: [
    {
      id: 4,
      title: 'Finding Accommodation in Frankfurt',
      description: 'Tips for finding apartments and understanding rental contracts',
      url: '/resources/finding-housing',
      category: 'housing'
    },
    {
      id: 5,
      title: 'Anmeldung Process',
      description: 'How to register your address in Germany',
      url: '/resources/anmeldung',
      category: 'housing'
    },
    {
      id: 6,
      title: 'Tenant Rights in Germany',
      description: 'Understanding your rights as a tenant',
      url: '/resources/tenant-rights',
      category: 'housing'
    }
  ],
  jobs: [
    {
      id: 7,
      title: 'Job Search Platforms',
      description: 'Best platforms for finding jobs in Frankfurt',
      url: '/resources/job-platforms',
      category: 'jobs'
    },
    {
      id: 8,
      title: 'German CV Format',
      description: 'How to create a German-style CV',
      url: '/resources/cv-format',
      category: 'jobs'
    },
    {
      id: 9,
      title: 'Work Permit Guide',
      description: 'Understanding work permits and regulations',
      url: '/resources/work-permit',
      category: 'jobs'
    }
  ],
  local: [
    {
      id: 10,
      title: 'Indian Grocery Stores',
      description: 'List of Indian grocery stores in Frankfurt',
      url: '/resources/grocery-stores',
      category: 'local'
    },
    {
      id: 11,
      title: 'Indian Restaurants',
      description: 'Best Indian restaurants in Frankfurt',
      url: '/resources/restaurants',
      category: 'local'
    },
    {
      id: 12,
      title: 'Indian Consulate Frankfurt',
      description: 'Contact details and services',
      url: 'https://cgifrankfurt.gov.in/',
      external: true,
      category: 'local'
    }
  ]
};

router.get('/', (req, res) => {
  const { category } = req.query;
  
  if (category && resources[category]) {
    return res.json(resources[category]);
  }
  
  const allResources = Object.values(resources).flat();
  res.json(allResources);
});

router.get('/categories', (req, res) => {
  const categories = Object.keys(resources).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: resources[key].length
  }));
  
  res.json(categories);
});

router.get('/:category', (req, res) => {
  const { category } = req.params;
  
  if (resources[category]) {
    return res.json(resources[category]);
  }
  
  res.status(404).json({ error: 'Category not found' });
});

module.exports = router;