#!/bin/bash
# Test script for appointment booking API

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Appointment Booking API"
echo "=================================="

# Read the site URL
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./test-appointment-api.sh <site-url>${NC}"
    echo "Example: ./test-appointment-api.sh https://your-site.netlify.app"
    exit 1
fi

SITE_URL="$1"
API_URL="${SITE_URL}/api/appointments"

echo "📍 API Endpoint: $API_URL"
echo ""

# Test 1: Valid appointment booking
echo "Test 1: Valid Appointment Booking"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "test-provider",
    "appointmentDate": "2024-02-15",
    "startTime": "09:00",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "patientPhone": "5551234567",
    "appointmentType": "initial",
    "modality": "telehealth",
    "notes": "Test appointment",
    "utm": {}
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASSED (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${YELLOW}⚠️  VALIDATION ERROR (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${RED}❌ PROVIDER NOT FOUND (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
fi
echo ""

# Test 2: Missing required field
echo "Test 2: Missing Required Field (patientName)"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "test-provider",
    "appointmentDate": "2024-02-15",
    "startTime": "09:00",
    "patientEmail": "john@example.com",
    "patientPhone": "5551234567",
    "appointmentType": "initial",
    "modality": "telehealth"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASSED - Correctly rejected (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED - Should return 400 (Got: $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

# Test 3: Invalid email format
echo "Test 3: Invalid Email Format"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "test-provider",
    "appointmentDate": "2024-02-15",
    "startTime": "09:00",
    "patientName": "John Doe",
    "patientEmail": "invalid-email",
    "patientPhone": "5551234567",
    "appointmentType": "initial",
    "modality": "telehealth"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASSED - Correctly rejected (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED - Should return 400 (Got: $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

# Test 4: Invalid phone number (too short)
echo "Test 4: Phone Number Too Short"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "test-provider",
    "appointmentDate": "2024-02-15",
    "startTime": "09:00",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "patientPhone": "12345",
    "appointmentType": "initial",
    "modality": "telehealth"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASSED - Correctly rejected (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED - Should return 400 (Got: $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

# Test 5: Invalid time format
echo "Test 5: Invalid Time Format (9:00 instead of 09:00)"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "test-provider",
    "appointmentDate": "2024-02-15",
    "startTime": "9:00",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "patientPhone": "5551234567",
    "appointmentType": "initial",
    "modality": "telehealth"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASSED - Correctly rejected (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED - Should return 400 (Got: $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

# Test 6: Invalid appointment type
echo "Test 6: Invalid Appointment Type"
echo "-----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "test-provider",
    "appointmentDate": "2024-02-15",
    "startTime": "09:00",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "patientPhone": "5551234567",
    "appointmentType": "invalid_type",
    "modality": "telehealth"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ PASSED - Correctly rejected (Status: $HTTP_CODE)${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAILED - Should return 400 (Got: $HTTP_CODE)${NC}"
    echo "$BODY"
fi
echo ""

echo "=================================="
echo "✅ Test suite completed!"
echo ""
echo "💡 Tips:"
echo "  - If Test 1 returns 404, the provider doesn't exist in the database"
echo "  - If Test 1 returns 500, check database connection and migration"
echo "  - If all tests return 404, the API route might not be deployed"
