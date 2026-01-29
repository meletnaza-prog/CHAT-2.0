#!/bin/bash

# RR-Chat AI Assistant - GitHub Repository Setup Script
# This script will help you set up the GitHub repository and push your code

echo "🚀 Setting up RR-Chat AI Assistant GitHub Repository"
echo "=================================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Xcode command line tools first."
    echo "Run: xcode-select --install"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project directory (where package.json is located)"
    exit 1
fi

echo "✅ Git is available"
echo "✅ Project files found"

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Configure git user (if not already configured)
echo "👤 Configuring git user..."
git config user.name "meletnaza-prog"
git config user.email "meletnaza@gmail.com"

# Add all files
echo "📝 Adding files to git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: RR-Chat AI Assistant

- Modern AI chat application with beautiful UI
- Features voice input, file attachments, and chat history
- Responsive design for desktop, tablet, and mobile
- Built with HTML5, CSS3, and JavaScript ES6+"

echo "✅ Initial commit created successfully!"

echo ""
echo "🔗 Next steps:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository named 'RR-Chat-AI-Assistant'"
echo "3. Make it public"
echo "4. Don't initialize with README (we already have one)"
echo "5. Copy the repository URL"
echo "6. Run the following commands:"
echo ""
echo "   git remote add origin https://github.com/meletnaza-prog/RR-Chat-AI-Assistant.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎉 Your RR-Chat AI Assistant will be live on GitHub!"
