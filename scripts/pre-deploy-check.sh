#!/bin/bash

echo "==================================="
echo "Pre-Deployment Checklist"
echo "==================================="
echo ""

# Check 1: Environment variables
echo "1. Checking environment variables..."
if [ -f "./scripts/check-env.sh" ]; then
  ./scripts/check-env.sh || exit 1
else
  echo "⚠️  check-env.sh not found, skipping..."
fi
echo ""

# Check 2: Check for console.logs
echo "2. Checking for console.logs in production..."
if grep -r "console\.log" src/ --exclude-dir=node_modules | grep -v "errorLogger" | grep -v "// console.log"; then
  echo "⚠️  Warning: Found console.log statements"
  echo "Remove or replace with proper logging before deploying"
  echo ""
else
  echo "✅ No problematic console.log statements found"
  echo ""
fi

# Check 3: Check for TODO comments
echo "3. Checking for TODO comments..."
todo_count=$(grep -r "TODO" src/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ $todo_count -gt 0 ]; then
  echo "⚠️  Found $todo_count TODO comments"
  echo "Review these before deploying:"
  grep -r "TODO" src/ --exclude-dir=node_modules 2>/dev/null | head -10
  echo ""
else
  echo "✅ No TODO comments found"
  echo ""
fi

# Check 4: Check for hardcoded API keys or secrets
echo "4. Checking for hardcoded secrets..."
if grep -r "sk-" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "example"; then
  echo "❌ ERROR: Found potential API keys in source code!"
  echo "Remove all hardcoded secrets before deploying"
  exit 1
else
  echo "✅ No hardcoded secrets found"
  echo ""
fi

# Check 5: Verify critical files exist
echo "5. Verifying critical files..."
critical_files=(
  "src/pages/LandingPage.tsx"
  "src/pages/UnifiedDashboard.tsx"
  "src/pages/Auth.tsx"
  "src/components/SegmentDashboard.tsx"
  "src/lib/segmentData.ts"
  "TESTING_CHECKLIST.md"
  "ENVIRONMENT_VARIABLES.md"
  "DEPLOYMENT.md"
)

missing_files=0
for file in "${critical_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing critical file: $file"
    missing_files=$((missing_files + 1))
  fi
done

if [ $missing_files -eq 0 ]; then
  echo "✅ All critical files present"
  echo ""
else
  echo "❌ Missing $missing_files critical file(s)"
  exit 1
fi

# Check 6: TypeScript compilation
echo "6. Running TypeScript checks..."
if command -v npx &> /dev/null; then
  if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo "⚠️  TypeScript errors found"
    echo "Fix TypeScript errors before deploying"
    npx tsc --noEmit
    echo ""
  else
    echo "✅ TypeScript checks passed"
    echo ""
  fi
else
  echo "⚠️  npx not found, skipping TypeScript checks"
  echo ""
fi

# Final summary
echo "==================================="
echo "Pre-deployment checks complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Review any warnings above"
echo "2. Complete TESTING_CHECKLIST.md"
echo "3. Set production environment variables"
echo "4. Click 'Publish' in Lovable to deploy"
echo ""
