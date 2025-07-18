const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testEndpoints = async () => {
  console.log('🔍 Testing Backend Connections...\n');

  const tests = [
    { name: 'Health Check', url: `${BASE_URL}/health` },
    { name: 'Homepage Content', url: `${BASE_URL}/homepage` },
    { name: 'Categories', url: `${BASE_URL}/categories` },
    { name: 'Products', url: `${BASE_URL}/products?limit=1` }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✅ ${test.name}: Connected (${response.status})`);
      
      if (test.name === 'Homepage Content') {
        const data = response.data.data;
        console.log('   📋 Sections found:');
        Object.keys(data || {}).forEach(key => {
          if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
            const enabled = data[key]?.enabled;
            console.log(`      ${key}: ${enabled ? '🟢 Enabled' : '🔴 Disabled'}`);
          }
        });
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Failed (${error.response?.status || 'No Response'})`);
      if (error.response?.data?.message) {
        console.log(`   Error: ${error.response.data.message}`);
      }
    }
  }

  console.log('\n🔧 Testing Homepage Section Updates...');
  
  try {
    const updateResponse = await axios.put(`${BASE_URL}/homepage/heroSection`, {
      title: 'Test Update - ' + new Date().toISOString()
    });
    console.log('✅ Homepage Update: Working');
  } catch (error) {
    console.log('❌ Homepage Update: Failed');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }
};

testEndpoints().catch(console.error);