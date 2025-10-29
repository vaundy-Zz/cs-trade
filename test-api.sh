#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}=== Alerts Workflow API Test ===${NC}\n"

# Test 1: Register a user
echo -e "${GREEN}1. Registering user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}')
echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo -e "Token: $TOKEN\n"

# Test 2: Create an alert
echo -e "${GREEN}2. Creating price alert...${NC}"
ALERT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/alerts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"BTC High Price","type":"price","asset":"BTC","condition":"above","threshold":50000}')
echo "$ALERT_RESPONSE" | jq '.'
ALERT_ID=$(echo "$ALERT_RESPONSE" | jq -r '.id')
echo ""

# Test 3: List alerts
echo -e "${GREEN}3. Listing alerts...${NC}"
curl -s "$BASE_URL/api/alerts" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 4: Get stats
echo -e "${GREEN}4. Getting stats...${NC}"
curl -s "$BASE_URL/api/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 5: Trigger alert with ingestion (below threshold - should not trigger)
echo -e "${GREEN}5. Ingesting data (below threshold)...${NC}"
curl -s -X POST "$BASE_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","price":45000}' | jq '.'
echo ""

# Test 6: Trigger alert with ingestion (above threshold - should trigger)
echo -e "${GREEN}6. Ingesting data (above threshold)...${NC}"
curl -s -X POST "$BASE_URL/api/ingest" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","price":55000}' | jq '.'
echo ""

# Test 7: View alert history
echo -e "${GREEN}7. Viewing alert history...${NC}"
curl -s "$BASE_URL/api/alerts/$ALERT_ID/history" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 8: Update alert
echo -e "${GREEN}8. Updating alert...${NC}"
curl -s -X PUT "$BASE_URL/api/alerts/$ALERT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"threshold":60000}' | jq '.'
echo ""

# Test 9: Disable alert
echo -e "${GREEN}9. Disabling alert...${NC}"
curl -s -X PUT "$BASE_URL/api/alerts/$ALERT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled":false}' | jq '.'
echo ""

# Test 10: Test rate limiting
echo -e "${GREEN}10. Testing rate limiting (creating 6 triggers)...${NC}"
curl -s -X PUT "$BASE_URL/api/alerts/$ALERT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled":true}' > /dev/null

for i in {1..6}; do
  PRICE=$((50000 + i * 5000))
  echo "Trigger $i with price $PRICE:"
  curl -s -X POST "$BASE_URL/api/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"asset\":\"BTC\",\"price\":$PRICE}" | jq '.triggered'
  sleep 0.5
done
echo ""

echo -e "${BLUE}=== Tests Complete ===${NC}"
