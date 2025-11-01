#!/bin/bash

# Revalidate Bookmarks Script
# Usage: ./revalidate-bookmarks.sh [environment] [slug]
# Examples:
#   ./revalidate-bookmarks.sh           # defaults to local
#   ./revalidate-bookmarks.sh local
#   ./revalidate-bookmarks.sh production
#   ./revalidate-bookmarks.sh production design  # specific collection

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Get arguments
ENV=${1:-local}
SLUG=${2:-}

# Set API URL based on environment
if [ "$ENV" = "production" ] || [ "$ENV" = "prod" ]; then
  API_URL="https://priyanshu.me/api/revalidate"
  echo "🌐 Revalidating PRODUCTION bookmarks..."
else
  API_URL="http://localhost:3000/api/revalidate"
  echo "🏠 Revalidating LOCAL bookmarks..."
fi

# Check if secret exists
if [ -z "$NEXT_REVALIDATE_SECRET" ]; then
  echo "❌ Error: NEXT_REVALIDATE_SECRET not found in .env file"
  echo "💡 Make sure your .env file contains: NEXT_REVALIDATE_SECRET=your-secret"
  exit 1
fi

# Build payload
if [ -z "$SLUG" ]; then
  PAYLOAD='{"contentTypeId": "bookmarks"}'
  echo "📦 Revalidating all bookmarks"
else
  PAYLOAD="{\"contentTypeId\": \"bookmarks\", \"slug\": \"$SLUG\"}"
  echo "📦 Revalidating bookmark collection: $SLUG"
fi

# Make the request with verbose output
echo "📤 Sending request to: $API_URL"
echo "🔑 Using secret: ${NEXT_REVALIDATE_SECRET:0:10}..."
echo ""

RESPONSE=$(curl -L -v -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $NEXT_REVALIDATE_SECRET" \
  -d "$PAYLOAD" 2>&1)

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | grep -E '^[0-9]{3}$' | tail -n1)
BODY=$(echo "$RESPONSE" | sed -n '/^{/,/^}/p')

# Display result
echo ""
echo "📥 Response:"
if [ -n "$BODY" ]; then
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "No JSON response received"
  echo "Full response:"
  echo "$RESPONSE"
fi
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Success! Bookmarks revalidated."
  exit 0
else
  echo "❌ Failed with HTTP status: $HTTP_CODE"
  echo ""
  echo "🔍 Troubleshooting:"
  echo "  1. Check if the site is accessible: curl -I $API_URL"
  echo "  2. Verify secret matches in Vercel environment variables"
  echo "  3. Check Vercel deployment logs"
  exit 1
fi
