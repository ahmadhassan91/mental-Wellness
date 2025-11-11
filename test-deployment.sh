#!/bin/bash

# Mental Wellness Portal - Deployment Test Script
# This script tests all API endpoints and functionality

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Base URL (update this with your Netlify URL)
BASE_URL="${NEXT_PUBLIC_BASE_URL}"
if [ "$BASE_URL" = "https://yourdomain.com" ]; then
    echo -e "${YELLOW}⚠️  Warning: Using default BASE_URL. Update NEXT_PUBLIC_BASE_URL in .env${NC}"
    read -p "Enter your Netlify URL (e.g., https://your-site.netlify.app): " BASE_URL
fi

echo -e "${BLUE}🚀 Testing Mental Wellness Portal${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    local auth=$4
    
    echo -n "Testing ${name}... "
    
    if [ -z "$auth" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Basic ${auth}" "${url}")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        ((TESTS_FAILED++))
    fi
}

# Function to test API with JSON response
test_api_json() {
    local name=$1
    local url=$2
    local auth=$3
    
    echo -n "Testing ${name}... "
    
    if [ -z "$auth" ]; then
        response=$(curl -s "${url}")
    else
        response=$(curl -s -H "Authorization: Basic ${auth}" "${url}")
    fi
    
    if echo "$response" | jq empty 2>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC} (Valid JSON returned)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Invalid JSON response)"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Testing Static Pages${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "Homepage" "${BASE_URL}/" "200"
test_endpoint "Providers Page" "${BASE_URL}/providers" "200"
test_endpoint "Success Page" "${BASE_URL}/success" "200"
test_endpoint "Sitemap" "${BASE_URL}/sitemap.xml" "200"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Testing Public API Endpoints${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test providers API and get first provider ID
echo -n "Testing Providers API... "
providers_response=$(curl -s "${BASE_URL}/api/providers")
if echo "$providers_response" | jq empty 2>/dev/null; then
    provider_count=$(echo "$providers_response" | jq '. | length')
    echo -e "${GREEN}✓ PASS${NC} (Found ${provider_count} providers)"
    ((TESTS_PASSED++))
    
    # Get first provider ID for further testing
    PROVIDER_ID=$(echo "$providers_response" | jq -r '.[0].id // empty')
    
    if [ -n "$PROVIDER_ID" ]; then
        echo -e "  ${YELLOW}→ Using provider ID: ${PROVIDER_ID}${NC}"
        
        # Test single provider endpoint
        test_api_json "Single Provider API" "${BASE_URL}/api/providers/${PROVIDER_ID}"
        
        # Test provider page
        test_endpoint "Provider Detail Page" "${BASE_URL}/r/${PROVIDER_ID}" "200"
    else
        echo -e "  ${YELLOW}⚠️  No providers found in database. Run 'npm run db:seed'${NC}"
    fi
else
    echo -e "${RED}✗ FAIL${NC} (Invalid JSON response)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. Testing Click Tracking API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$PROVIDER_ID" ]; then
    echo -n "Testing Click Event API... "
    click_response=$(curl -s -X POST "${BASE_URL}/api/events/click" \
        -H "Content-Type: application/json" \
        -d "{
            \"providerId\": \"${PROVIDER_ID}\",
            \"utm\": {
                \"source\": \"test-script\",
                \"medium\": \"automated-test\",
                \"campaign\": \"deployment-verification\"
            }
        }")
    
    if echo "$click_response" | jq -e '.portalLink' > /dev/null 2>&1; then
        portal_link=$(echo "$click_response" | jq -r '.portalLink')
        echo -e "${GREEN}✓ PASS${NC} (Portal link: ${portal_link})"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (No portal link returned)"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (no provider ID available)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Testing Admin Endpoints (Protected)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create Basic Auth header
AUTH_STRING="${ADMIN_USER}:${ADMIN_PASS}"
AUTH_HEADER=$(echo -n "${AUTH_STRING}" | base64)

echo -n "Testing Admin Page (without auth)... "
response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/admin")
if [ "$response" = "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Correctly blocked - HTTP $response)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should be 401, got $response)"
    ((TESTS_FAILED++))
fi

echo -n "Testing Admin Page (with auth)... "
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Basic ${AUTH_HEADER}" \
    "${BASE_URL}/admin")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Auth successful - HTTP $response)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 200, got $response)"
    ((TESTS_FAILED++))
fi

test_api_json "Admin Events API" "${BASE_URL}/api/admin/events" "${AUTH_HEADER}"

echo -n "Testing Admin Export API... "
export_response=$(curl -s -H "Authorization: Basic ${AUTH_HEADER}" "${BASE_URL}/api/admin/export")
if echo "$export_response" | grep -q "Provider,Event Type,Created At"; then
    echo -e "${GREEN}✓ PASS${NC} (CSV export working)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Invalid CSV response)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Testing Database Connectivity${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Testing Supabase Connection... "
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    supabase_response=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}")
    
    if echo "$supabase_response" | jq empty 2>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC} (Supabase accessible)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Supabase connection failed)"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (Supabase credentials not set)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Performance & Security Checks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Testing Security Headers... "
headers=$(curl -s -I "${BASE_URL}/" | grep -i "x-frame-options\|x-content-type-options")
if [ -n "$headers" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Security headers present)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Some security headers missing)"
fi

echo -n "Testing HTTPS Redirect... "
if [[ "${BASE_URL}" == https://* ]]; then
    echo -e "${GREEN}✓ PASS${NC} (Using HTTPS)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Not using HTTPS)"
fi

echo -n "Testing Response Time... "
start_time=$(date +%s%3N)
curl -s -o /dev/null "${BASE_URL}/"
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ "$response_time" -lt 3000 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${response_time}ms - Excellent)"
    ((TESTS_PASSED++))
elif [ "$response_time" -lt 5000 ]; then
    echo -e "${YELLOW}⚠️  OK${NC} (${response_time}ms - Acceptable)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ SLOW${NC} (${response_time}ms - Needs optimization)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo -e "Total Tests:  ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo -e "Pass Rate:    ${GREEN}${PASS_RATE}%${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your deployment is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
    echo ""
    echo -e "${YELLOW}Common fixes:${NC}"
    echo "  1. Check environment variables are set correctly in Netlify"
    echo "  2. Verify database has been seeded (npm run db:seed)"
    echo "  3. Ensure Supabase credentials are correct"
    echo "  4. Check Netlify Functions logs for errors"
    exit 1
fi
