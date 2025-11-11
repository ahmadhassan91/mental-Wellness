#!/usr/bin/env node

/**
 * Mental Wellness Portal - Quick API Test
 * Interactive test script that prompts for your Netlify URL
 */

const https = require('https');
const http = require('http');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  
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

// Colors
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

// Helper to make HTTP requests
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
      timeout: 10000,
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
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function main() {
  console.log(`${c.cyan}╔════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.cyan}║  Mental Wellness Portal - API Tester  ║${c.reset}`);
  console.log(`${c.cyan}╚════════════════════════════════════════╝${c.reset}\n`);

  // Get Netlify URL
  let baseUrl = env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl || baseUrl === 'https://yourdomain.com') {
    console.log(`${c.yellow}From your screenshot, your URL appears to be:${c.reset}`);
    console.log(`${c.cyan}https://mental-health-clustox.netlify.app${c.reset}\n`);
    baseUrl = await question('Enter your Netlify URL (or press Enter to use above): ');
    if (!baseUrl.trim()) {
      baseUrl = 'https://mental-health-clustox.netlify.app';
    }
  }

  baseUrl = baseUrl.trim().replace(/\/$/, ''); // Remove trailing slash
  
  console.log(`\n${c.blue}Testing: ${baseUrl}${c.reset}\n`);

  const ADMIN_USER = env.ADMIN_USER || 'admin';
  const ADMIN_PASS = env.ADMIN_PASS || 'demo_password_123';

  let passed = 0, failed = 0;

  // Test 1: Homepage
  console.log(`${c.cyan}[1/10]${c.reset} Testing Homepage...`);
  try {
    const res = await makeRequest(`${baseUrl}/`);
    if (res.statusCode === 200) {
      console.log(`      ${c.green}✓ PASS${c.reset} - Homepage loaded successfully\n`);
      passed++;
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Test 2: Providers page
  console.log(`${c.cyan}[2/10]${c.reset} Testing Providers Page...`);
  try {
    const res = await makeRequest(`${baseUrl}/providers`);
    if (res.statusCode === 200) {
      console.log(`      ${c.green}✓ PASS${c.reset} - Providers page loaded\n`);
      passed++;
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Test 3: Providers API
  console.log(`${c.cyan}[3/10]${c.reset} Testing Providers API...`);
  let providerId = null;
  try {
    const res = await makeRequest(`${baseUrl}/api/providers`);
    if (res.statusCode === 200) {
      const providers = JSON.parse(res.body);
      if (Array.isArray(providers) && providers.length > 0) {
        providerId = providers[0].id;
        console.log(`      ${c.green}✓ PASS${c.reset} - Found ${providers.length} providers`);
        console.log(`      ${c.yellow}→ Provider ID: ${providerId}${c.reset}\n`);
        passed++;
      } else {
        console.log(`      ${c.yellow}⚠ WARNING${c.reset} - No providers in database\n`);
        console.log(`      ${c.yellow}→ Run: npm run db:seed${c.reset}\n`);
        failed++;
      }
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Test 4: Single provider API
  if (providerId) {
    console.log(`${c.cyan}[4/10]${c.reset} Testing Single Provider API...`);
    try {
      const res = await makeRequest(`${baseUrl}/api/providers/${providerId}`);
      if (res.statusCode === 200) {
        const provider = JSON.parse(res.body);
        console.log(`      ${c.green}✓ PASS${c.reset} - Retrieved: ${provider.name}\n`);
        passed++;
      } else {
        console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
      failed++;
    }
  } else {
    console.log(`${c.cyan}[4/10]${c.reset} Testing Single Provider API... ${c.yellow}SKIPPED${c.reset}\n`);
  }

  // Test 5: Provider detail page
  if (providerId) {
    console.log(`${c.cyan}[5/10]${c.reset} Testing Provider Detail Page...`);
    try {
      const res = await makeRequest(`${baseUrl}/r/${providerId}`);
      if (res.statusCode === 200) {
        console.log(`      ${c.green}✓ PASS${c.reset} - Provider page rendered\n`);
        passed++;
      } else {
        console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
      failed++;
    }
  } else {
    console.log(`${c.cyan}[5/10]${c.reset} Testing Provider Detail Page... ${c.yellow}SKIPPED${c.reset}\n`);
  }

  // Test 6: Click tracking API
  if (providerId) {
    console.log(`${c.cyan}[6/10]${c.reset} Testing Click Tracking API...`);
    try {
      const res = await makeRequest(`${baseUrl}/api/events/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          providerId,
          utm: { source: 'test', medium: 'script', campaign: 'verification' },
        },
      });
      if (res.statusCode === 200) {
        const data = JSON.parse(res.body);
        console.log(`      ${c.green}✓ PASS${c.reset} - Click tracked`);
        console.log(`      ${c.yellow}→ Portal: ${data.portalLink}${c.reset}\n`);
        passed++;
      } else {
        console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
      failed++;
    }
  } else {
    console.log(`${c.cyan}[6/10]${c.reset} Testing Click Tracking API... ${c.yellow}SKIPPED${c.reset}\n`);
  }

  // Test 7: Admin page without auth
  console.log(`${c.cyan}[7/10]${c.reset} Testing Admin Security (no auth)...`);
  try {
    const res = await makeRequest(`${baseUrl}/admin`);
    if (res.statusCode === 401) {
      console.log(`      ${c.green}✓ PASS${c.reset} - Correctly blocked (401)\n`);
      passed++;
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - Should be 401, got ${res.statusCode}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Test 8: Admin page with auth
  console.log(`${c.cyan}[8/10]${c.reset} Testing Admin Login...`);
  try {
    const auth = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
    const res = await makeRequest(`${baseUrl}/admin`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (res.statusCode === 200) {
      console.log(`      ${c.green}✓ PASS${c.reset} - Admin access granted\n`);
      passed++;
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Test 9: Admin events API
  console.log(`${c.cyan}[9/10]${c.reset} Testing Admin Events API...`);
  try {
    const auth = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
    const res = await makeRequest(`${baseUrl}/api/admin/events`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      console.log(`      ${c.green}✓ PASS${c.reset} - Retrieved ${data.events.length} events\n`);
      passed++;
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - HTTP ${res.statusCode}\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Test 10: Admin export API
  console.log(`${c.cyan}[10/10]${c.reset} Testing CSV Export...`);
  try {
    const auth = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
    const res = await makeRequest(`${baseUrl}/api/admin/export`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (res.statusCode === 200 && res.body.includes('Provider,Event Type')) {
      console.log(`      ${c.green}✓ PASS${c.reset} - CSV export working\n`);
      passed++;
    } else {
      console.log(`      ${c.red}✗ FAIL${c.reset} - Invalid CSV response\n`);
      failed++;
    }
  } catch (err) {
    console.log(`      ${c.red}✗ ERROR${c.reset} - ${err.message}\n`);
    failed++;
  }

  // Summary
  console.log(`${c.cyan}╔════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.cyan}║          Test Results Summary          ║${c.reset}`);
  console.log(`${c.cyan}╚════════════════════════════════════════╝${c.reset}\n`);
  
  const total = passed + failed;
  const rate = Math.round((passed / total) * 100);
  
  console.log(`Total Tests:  ${total}`);
  console.log(`Tests Passed: ${c.green}${passed}${c.reset}`);
  console.log(`Tests Failed: ${c.red}${failed}${c.reset}`);
  console.log(`Pass Rate:    ${rate >= 80 ? c.green : c.yellow}${rate}%${c.reset}\n`);
  
  if (failed === 0) {
    console.log(`${c.green}🎉 All tests passed! Your deployment is working perfectly.${c.reset}\n`);
  } else if (passed >= failed) {
    console.log(`${c.yellow}⚠️  Most tests passed, but there are some issues.${c.reset}\n`);
  } else {
    console.log(`${c.red}❌ Many tests failed. Check your deployment.${c.reset}\n`);
  }

  console.log(`${c.blue}Quick Links:${c.reset}`);
  console.log(`  Homepage:   ${baseUrl}/`);
  console.log(`  Providers:  ${baseUrl}/providers`);
  console.log(`  Admin:      ${baseUrl}/admin`);
  console.log(`  API Docs:   ${baseUrl}/api/providers\n`);

  rl.close();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error(`${c.red}Fatal error:${c.reset}`, err);
  rl.close();
  process.exit(1);
});
