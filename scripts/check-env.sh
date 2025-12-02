#!/bin/bash

echo "Checking environment variables..."
echo ""

required_vars=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "VITE_SUPABASE_PROJECT_ID"
  "VITE_SITE_URL"
)

missing=0

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    missing=$((missing + 1))
  else
    echo "✅ Set: $var"
  fi
done

echo ""

if [ $missing -eq 0 ]; then
  echo "✅ All required environment variables are set!"
  exit 0
else
  echo "❌ Missing $missing required environment variable(s)"
  echo ""
  echo "Please set the missing variables in your .env file or Lovable Cloud settings."
  exit 1
fi
