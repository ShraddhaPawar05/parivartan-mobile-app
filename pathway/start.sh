#!/bin/bash

echo "🚀 Parivartan Pathway Analytics - Quick Start"
echo "=============================================="

# Check if running in WSL
if ! grep -q Microsoft /proc/version; then
    echo "⚠️  Warning: Not running in WSL. This script is optimized for WSL."
fi

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check for Firebase credentials
if [ ! -f "firebase-credentials.json" ]; then
    echo "❌ Error: firebase-credentials.json not found!"
    echo "Please download from Firebase Console and place in this directory."
    exit 1
fi

echo "✓ Firebase credentials found"

# Start server
echo ""
echo "🎯 Starting Pathway Analytics Server..."
echo "Server will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

python api_server.py
