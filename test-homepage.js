const axios = require('axios');

async function testHomepageAPI() {
  try {
    console.log('Testing homepage API...');
    
    // Test basic endpoint
    const testResponse = await axios.get('http://localhost:5000/api/homepage/test');
    console.log('Test endpoint:', testResponse.data);
    
    // Test main homepage endpoint
    const homepageResponse = await axios.get('http://localhost:5000/api/homepage');
    console.log('Homepage endpoint:', homepageResponse.data);
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testHomepageAPI();