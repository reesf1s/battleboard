#!/bin/bash
# Battleboard Production Setup Script
# Run this script to provision all external services

set -e

echo "========================================="
echo "  Battleboard Production Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}$1 is required but not installed.${NC}"
    exit 1
  fi
}

check_command "npx"

# ---- STEP 1: CONVEX ----
echo -e "${GREEN}Step 1: Convex Setup${NC}"
echo "─────────────────────────────────────────"
if [ -z "$NEXT_PUBLIC_CONVEX_URL" ] || [[ "$NEXT_PUBLIC_CONVEX_URL" == *"your-project"* ]]; then
  echo "Setting up Convex..."
  echo "Running: npx convex dev --once"
  echo ""
  echo "This will:"
  echo "  1. Create a new Convex project (if needed)"
  echo "  2. Deploy your schema and functions"
  echo "  3. Generate typed API client"
  echo ""
  npx convex dev --once
  echo ""
  echo -e "${GREEN}Convex deployed! Note your deployment URL above.${NC}"
  echo "Set it as NEXT_PUBLIC_CONVEX_URL in your .env.local and on Vercel."
else
  echo -e "${YELLOW}Convex already configured: $NEXT_PUBLIC_CONVEX_URL${NC}"
fi

echo ""

# ---- STEP 2: CLERK ----
echo -e "${GREEN}Step 2: Clerk Setup${NC}"
echo "─────────────────────────────────────────"
echo "1. Go to https://dashboard.clerk.com"
echo "2. Create a new application called 'Battleboard'"
echo "3. Enable Email/Password and Google sign-in"
echo "4. Copy your API keys and paste below:"
echo ""
read -p "Publishable Key (pk_test_...): " CLERK_PK
read -p "Secret Key (sk_test_...): " CLERK_SK
echo ""

if [ -n "$CLERK_PK" ] && [ -n "$CLERK_SK" ]; then
  # Update .env.local
  sed -i '' "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PK|" .env.local
  sed -i '' "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$CLERK_SK|" .env.local
  echo -e "${GREEN}Clerk keys saved to .env.local${NC}"
else
  echo -e "${YELLOW}Skipped — set keys manually in .env.local${NC}"
fi

echo ""

# ---- STEP 3: STRIPE ----
echo -e "${GREEN}Step 3: Stripe Setup${NC}"
echo "─────────────────────────────────────────"
echo "1. Go to https://dashboard.stripe.com/test/apikeys"
echo "2. Copy your test mode keys"
echo "3. Create two products at https://dashboard.stripe.com/test/products:"
echo "   - Monthly: £3.99/month"
echo "   - Yearly: £29.99/year"
echo ""
read -p "Publishable Key (pk_test_...): " STRIPE_PK
read -p "Secret Key (sk_test_...): " STRIPE_SK
read -p "Monthly Price ID (price_...): " STRIPE_PRICE_MONTHLY
read -p "Yearly Price ID (price_...): " STRIPE_PRICE_YEARLY
echo ""

if [ -n "$STRIPE_PK" ] && [ -n "$STRIPE_SK" ]; then
  sed -i '' "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PK|" .env.local
  sed -i '' "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SK|" .env.local
  [ -n "$STRIPE_PRICE_MONTHLY" ] && sed -i '' "s|NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=.*|NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=$STRIPE_PRICE_MONTHLY|" .env.local
  [ -n "$STRIPE_PRICE_YEARLY" ] && sed -i '' "s|NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=.*|NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=$STRIPE_PRICE_YEARLY|" .env.local
  echo -e "${GREEN}Stripe keys saved to .env.local${NC}"
else
  echo -e "${YELLOW}Skipped — set keys manually in .env.local${NC}"
fi

echo ""

# ---- STEP 4: STRAVA ----
echo -e "${GREEN}Step 4: Strava Setup${NC}"
echo "─────────────────────────────────────────"
echo "1. Go to https://www.strava.com/settings/api"
echo "2. Create an app:"
echo "   - Application Name: Battleboard"
echo "   - Website: https://battleboard-rho.vercel.app"
echo "   - Authorization Callback: https://battleboard-rho.vercel.app/api/strava/callback"
echo ""
read -p "Client ID: " STRAVA_CID
read -p "Client Secret: " STRAVA_CS
echo ""

if [ -n "$STRAVA_CID" ] && [ -n "$STRAVA_CS" ]; then
  sed -i '' "s|STRAVA_CLIENT_ID=.*|STRAVA_CLIENT_ID=$STRAVA_CID|" .env.local
  sed -i '' "s|STRAVA_CLIENT_SECRET=.*|STRAVA_CLIENT_SECRET=$STRAVA_CS|" .env.local
  sed -i '' "s|NEXT_PUBLIC_STRAVA_CLIENT_ID=.*|NEXT_PUBLIC_STRAVA_CLIENT_ID=$STRAVA_CID|" .env.local
  # Generate webhook verify token
  WEBHOOK_TOKEN=$(openssl rand -hex 16)
  sed -i '' "s|STRAVA_WEBHOOK_VERIFY_TOKEN=.*|STRAVA_WEBHOOK_VERIFY_TOKEN=$WEBHOOK_TOKEN|" .env.local
  echo -e "${GREEN}Strava keys saved. Webhook token: $WEBHOOK_TOKEN${NC}"
else
  echo -e "${YELLOW}Skipped — set keys manually in .env.local${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Review .env.local to confirm all values"
echo "  2. Run 'npx convex deploy' to deploy Convex to production"
echo "  3. Set all env vars on Vercel:"
echo "     vercel env pull .env.production.local"
echo "     # or set them manually in the Vercel dashboard"
echo "  4. Deploy: git push (if auto-deploy) or 'vercel --prod'"
echo "  5. Set up Stripe webhook at:"
echo "     https://dashboard.stripe.com/test/webhooks"
echo "     Endpoint: https://battleboard-rho.vercel.app/api/stripe/webhook"
echo "     Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted"
echo ""
