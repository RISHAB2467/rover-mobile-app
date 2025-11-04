import axios from 'axios';

const API_URL = 'https://rover-api-fb8n.onrender.com';

export const testApiConnection = async () => {
  const results = {
    baseUrl: API_URL,
    timestamp: new Date().toISOString(),
    tests: []
  };

  console.log('🧪 Starting API Connection Tests...');
  console.log('📍 API URL:', API_URL);
  console.log('-----------------------------------');

  // Test 1: Basic connectivity (Root endpoint)
  try {
    console.log('Test 1: Checking root endpoint (/)...');
    const response = await axios.get(API_URL, { timeout: 10000 });
    results.tests.push({
      name: 'Root Endpoint',
      status: 'PASS',
      statusCode: response.status,
      data: response.data,
      message: 'API is reachable'
    });
    console.log('✅ Root endpoint: PASS');
  } catch (error) {
    results.tests.push({
      name: 'Root Endpoint',
      status: 'FAIL',
      error: error.message,
      message: 'Could not reach API'
    });
    console.log('❌ Root endpoint: FAIL -', error.message);
  }

  // Test 2: Health check (same as root)
  try {
    console.log('Test 2: Checking API health...');
    const response = await axios.get(`${API_URL}/`, { timeout: 5000 });
    results.tests.push({
      name: 'Health Check',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
    console.log('✅ Health check: PASS');
  } catch (error) {
    results.tests.push({
      name: 'Health Check',
      status: 'FAIL',
      error: error.message
    });
    console.log('❌ Health check: FAIL -', error.message);
  }

  // Test 3: Reports endpoint
  try {
    console.log('Test 3: Checking reports endpoint (/api/reports)...');
    const response = await axios.get(`${API_URL}/api/reports`, { timeout: 5000 });
    results.tests.push({
      name: 'Reports Endpoint',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
    console.log('✅ Reports endpoint: PASS');
  } catch (error) {
    const statusCode = error.response?.status;
    results.tests.push({
      name: 'Reports Endpoint',
      status: statusCode === 404 ? 'NOT_IMPLEMENTED' : 'FAIL',
      statusCode: statusCode,
      error: error.message,
      note: statusCode === 404 ? 'Endpoint not implemented on backend' : undefined
    });
    console.log(statusCode === 404 ? '⚠️ Reports endpoint: NOT IMPLEMENTED' : '❌ Reports endpoint: FAIL -', error.message);
  }

  // Test 4: OpenAPI docs
  try {
    console.log('Test 4: Checking OpenAPI documentation (/openapi.json)...');
    const response = await axios.get(`${API_URL}/openapi.json`, { timeout: 5000 });
    results.tests.push({
      name: 'API Documentation',
      status: 'PASS',
      statusCode: response.status,
      message: 'OpenAPI spec available at /docs'
    });
    console.log('✅ API docs: PASS');
  } catch (error) {
    results.tests.push({
      name: 'API Documentation',
      status: 'FAIL',
      statusCode: error.response?.status,
      error: error.message
    });
    console.log('❌ API docs: FAIL -', error.message);
  }

  // Test 5: Rover update endpoint (POST - just check if it exists)
  try {
    console.log('Test 5: Testing rover update endpoint (/api/rover/update)...');
    const response = await axios.post(`${API_URL}/api/rover/update`, {
      test: true
    }, { timeout: 5000 });
    results.tests.push({
      name: 'Rover Update',
      status: 'PASS',
      statusCode: response.status,
      message: 'Rover update endpoint is accessible'
    });
    console.log('✅ Rover update endpoint: PASS');
  } catch (error) {
    // 422 validation error is acceptable - means endpoint exists but expects different data
    if (error.response?.status === 422 || error.response?.status === 400) {
      results.tests.push({
        name: 'Rover Update',
        status: 'PASS',
        statusCode: error.response.status,
        message: 'Rover update endpoint exists (validation error expected for test data)'
      });
      console.log('✅ Rover update endpoint: PASS (endpoint exists)');
    } else {
      results.tests.push({
        name: 'Rover Update',
        status: 'FAIL',
        statusCode: error.response?.status,
        error: error.message
      });
      console.log('❌ Rover update endpoint: FAIL -', error.message);
    }
  }

  console.log('-----------------------------------');
  const passedTests = results.tests.filter(t => t.status === 'PASS').length;
  const notImplemented = results.tests.filter(t => t.status === 'NOT_IMPLEMENTED').length;
  const totalTests = results.tests.length;
  console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);
  if (notImplemented > 0) {
    console.log(`⚠️ ${notImplemented} endpoint(s) not implemented on backend yet`);
  }
  
  return results;
};

export const quickConnectionTest = async () => {
  try {
    console.log('🔍 Quick connectivity test to:', API_URL);
    const response = await axios.get(API_URL, { timeout: 5000 });
    console.log('✅ Connected! Status:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return { success: false, error: error.message };
  }
};
