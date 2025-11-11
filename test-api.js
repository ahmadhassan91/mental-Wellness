#!/usr/bin/env node

/**
 * Mental Wellness Portal - API Test Script
 * Tests all endpoints and functionality
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && !line.startsWith('//')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

const env = loadEnv();

// Configuration
const BASE_URL = env.NEXT_PUBLIC_BASE_URL || 'https://mental-health-clustox.netlify.app';
const ADMIN_USER = env.ADMIN_USER;
const ADMIN_PASS = env.ADMIN_PASS;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let testsPassed = 0;
let testsFailed = 0;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await testFn();
    console.log(`${colors.green}✓ PASS${colors.reset}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    testsFailed++;
  }
}

// Test functions
async function testHomepage() {
  const response = await makeRequest(`${BASE_URL}/`);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
}

async function testProvidersPage() {
  const response = await makeRequest(`${BASE_URL}/providers`);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
}

async function testProvidersAPI() {
  const response = await makeRequest(`${BASE_URL}/api/providers`);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  
  const providers = JSON.parse(response.body);
  if (!Array.isArray(providers)) {
    throw new Error('Response is not an array');
  }
  
  return providers;
}

async function testSingleProviderAPI(providerId) {
  const response = await makeRequest(`${BASE_URL}/api/providers/${providerId}`);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  
  const provider = JSON.parse(response.body);
  if (!provider.id) {
    throw new Error('Invalid provider data');
  }
}

async function testClickTrackingAPI(providerId) {
  const response = await makeRequest(`${BASE_URL}/api/events/click`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      providerId,
      utm: {
        source: 'test-script',
        medium: 'automated-test',
        campaign: 'deployment-verification',
      },
    },
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  
  const result = JSON.parse(response.body);
  if (!result.portalLink) {
    throw new Error('No portal link returned');
  }
}

async function testAdminPageWithoutAuth() {
  const response = await makeRequest(`${BASE_URL}/admin`);
  if (response.statusCode !== 401) {
    throw new Error(`Expected 401, got ${response.statusCode}`);
  }
}

async function testAdminPageWithAuth() {
  const auth = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
  const response = await makeRequest(`${BASE_URL}/admin`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
}

async function testAdminEventsAPI() {
  const auth = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
  const response = await makeRequest(`${BASE_URL}/api/admin/events`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  
  const data = JSON.parse(response.body);
  if (!data.events || !data.providers) {
    throw new Error('Invalid response structure');
  }
}

async function testAdminExportAPI() {
  const auth = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
  const response = await makeRequest(`${BASE_URL}/api/admin/export`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  
  if (!response.body.includes('Provider,Event Type,Created At')) {
    throw new Error('Invalid CSV format');
  }
}

async function testSupabaseConnection() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  
  const response = await makeRequest(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_KEY,
    },
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Supabase connection failed: ${response.statusCode}`);
  }
}

// Main test suite
async function runAllTests() {
  console.log(`${colors.blue}🚀 Testing Mental Wellness Portal${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);

  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}1. Testing Static Pages${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  await runTest('Homepage', testHomepage);
  await runTest('Providers Page', testProvidersPage);
  await runTest('Success Page', async () => {
    const response = await makeRequest(`${BASE_URL}/success`);
    if (response.statusCode !== 200) throw new Error(`Expected 200, got ${response.statusCode}`);
  });

  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}2. Testing Public API Endpoints${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  let providerId;
  await runTest('Providers API', async () => {
    const providers = await testProvidersAPI();
    if (providers.length > 0) {
      providerId = providers[0].id;
      console.log(`  ${colors.yellow}→ Using provider ID: ${providerId}${colors.reset}`);
    }
  });
  
  if (providerId) {
    await runTest('Single Provider API', () => testSingleProviderAPI(providerId));
    await runTest('Provider Detail Page', async () => {
      const response = await makeRequest(`${BASE_URL}/r/${providerId}`);
      if (response.statusCode !== 200) throw new Error(`Expected 200, got ${response.statusCode}`);
    });
  } else {
    console.log(`${colors.yellow}⚠️  No providers found - skipping provider-specific tests${colors.reset}`);
  }

  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}3. Testing Click Tracking API${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (providerId) {
    await runTest('Click Event API', () => testClickTrackingAPI(providerId));
  } else {
    console.log(`${colors.yellow}⚠️  Skipped (no provider ID available)${colors.reset}`);
  }

  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}4. Testing Admin Endpoints${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  await runTest('Admin Page (without auth)', testAdminPageWithoutAuth);
  await runTest('Admin Page (with auth)', testAdminPageWithAuth);
  await runTest('Admin Events API', testAdminEventsAPI);
  await runTest('Admin Export API', testAdminExportAPI);

  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}5. Testing Database Connectivity${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  await runTest('Supabase Connection', testSupabaseConnection);

  // Summary
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 Test Results Summary${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  const totalTests = testsPassed + testsFailed;
  const passRate = Math.round((testsPassed / totalTests) * 100);
  
  console.log(`Total Tests:  ${colors.blue}${totalTests}${colors.reset}`);
  console.log(`Tests Passed: ${colors.green}${testsPassed}${colors.reset}`);
  console.log(`Tests Failed: ${colors.red}${testsFailed}${colors.reset}`);
  console.log(`Pass Rate:    ${colors.green}${passRate}%${colors.reset}\n`);
  
  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All tests passed! Your deployment is working correctly.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed. Please review the errors above.${colors.reset}`);
    console.log(`\n${colors.yellow}Common fixes:${colors.reset}`);
    console.log('  1. Check environment variables are set correctly in Netlify');
    console.log('  2. Verify database has been seeded (npm run db:seed)');
    console.log('  3. Ensure Supabase credentials are correct');
    console.log('  4. Check Netlify Functions logs for errors');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
