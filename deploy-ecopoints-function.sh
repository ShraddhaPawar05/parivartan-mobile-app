#!/bin/bash

# EcoPoints Cloud Function Deployment Script

echo "=========================================="
echo "  EcoPoints Cloud Function Deployment"
echo "=========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found!"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if logged in
echo "Checking Firebase login status..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase"
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Logged in to Firebase"
echo ""

# Show current project
echo "Current Firebase project:"
firebase use
echo ""

# Confirm deployment
read -p "Deploy calculateEcoPointsOnCompletion function? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying function..."
echo ""

# Deploy the function
firebase deploy --only functions:calculateEcoPointsOnCompletion

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ Deployment Successful!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Test by completing a waste request"
    echo "2. Check logs: firebase functions:log"
    echo "3. Verify ecoPoints are awarded"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ❌ Deployment Failed"
    echo "=========================================="
    echo ""
    echo "Common issues:"
    echo "1. Project not on Blaze plan"
    echo "2. Missing permissions"
    echo "3. Syntax errors in function code"
    echo ""
    echo "Check the error message above for details"
    echo ""
fi
