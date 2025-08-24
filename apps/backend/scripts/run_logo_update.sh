#!/bin/bash

# Company Logo Update Script Runner
# This script makes it easy to run the logo update process

set -e  # Exit on any error

echo "🚀 Toast AI - Company Logo Update"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: Please run this script from the backend directory (apps/backend)"
    exit 1
fi

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed or not in PATH"
    exit 1
fi

# Check if required dependencies are installed
echo "📦 Checking dependencies..."
python -c "import aiohttp" 2>/dev/null || {
    echo "❌ Error: aiohttp is not installed. Please install it with:"
    echo "   pip install aiohttp"
    exit 1
}

# Check if environment variables are set
if [ -z "$MONGO_URI" ]; then
    echo "⚠️  Warning: MONGO_URI environment variable is not set"
    echo "   Make sure your .env file is loaded or set MONGO_URI manually"
fi

echo "✅ Dependencies check passed"

# Ask user which script to run
echo ""
echo "Choose a script to run:"
echo "1) Simple logo update (recommended) - no API keys required"
echo "2) Advanced logo update - requires API keys"
echo "3) Test script - verify functionality"
echo "4) Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔄 Running simple logo update..."
        python scripts/simple_logo_update.py
        ;;
    2)
        echo "🔄 Running advanced logo update..."
        echo "⚠️  Make sure you have set the required API keys:"
        echo "   - CLEARBIT_API_KEY (optional)"
        echo "   - GOOGLE_API_KEY (optional)"
        echo "   - GOOGLE_CSE_ID (optional)"
        echo ""
        read -p "Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            python scripts/update_company_logos.py
        else
            echo "❌ Cancelled"
            exit 0
        fi
        ;;
    3)
        echo "🧪 Running test script..."
        python scripts/test_logo_script.py
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Logo update process completed!"
echo ""
echo "Next steps:"
echo "1) Check the logs above for any errors"
echo "2) Visit your companies page to see the updated logos"
echo "3) Run this script again periodically to keep logos up to date"
