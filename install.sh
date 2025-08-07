#!/bin/bash

# Glasses Discomfort Survey - Installation Script
# This script will set up the project with all required dependencies

echo "🔧 Setting up Glasses Discomfort Survey with Database Support"
echo "============================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo "Minimum required version: 14.0.0"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="14.0.0"

if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
    echo "❌ Node.js version $NODE_VERSION is too old."
    echo "Please upgrade to Node.js $REQUIRED_VERSION or higher"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ npm is available"

# Install dependencies
echo ""
echo "📦 Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create database directory if it doesn't exist
mkdir -p data
echo "✅ Database directory created"

# Set executable permissions for this script
chmod +x install.sh
echo "✅ Permissions set"

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the server: npm start"
echo "2. Open your browser and go to: http://localhost:3000"
echo "3. Access admin dashboard: http://localhost:3000/admin"
echo ""
echo "💡 For development with auto-restart: npm run dev"
echo ""
echo "📚 File structure:"
echo "├── index.html      # Main survey page"
echo "├── admin.html      # Admin dashboard"
echo "├── server.js       # Backend server"
echo "├── style.css       # Styles"
echo "├── script.js       # Frontend JavaScript"
echo "├── package.json    # Dependencies"
echo "└── survey.db       # SQLite database (created on first run)"
echo ""
echo "🔒 Security features included:"
echo "- Rate limiting"
echo "- CORS protection"
echo "- Input validation"
echo "- Helmet security headers"
echo ""
echo "Happy surveying! 📊"