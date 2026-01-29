#!/bin/bash

# RR-Chat AI Assistant - Automated GitHub Setup
# Run this script after installing Xcode Command Line Tools

echo "🚀 RR-Chat AI Assistant - GitHub Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project directory"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not available. Please install Xcode Command Line Tools first:"
    echo "   xcode-select --install"
    exit 1
fi

echo "✅ Git is available"

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
else
    echo "✅ Git repository already exists"
fi

# Configure git user
echo "👤 Configuring git user..."
git config user.name "meletnaza-prog"
git config user.email "meletnaza@gmail.com"

# Add all files
echo "📝 Adding files to git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Initial commit: RR-Chat AI Assistant

- Modern AI chat application with beautiful UI
- Features voice input, file attachments, and chat history  
- Responsive design for desktop, tablet, and mobile
- Built with HTML5, CSS3, and JavaScript ES6+"

echo "✅ Commit created successfully!"

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote origin already configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote URL: $REMOTE_URL"
else
    echo "🔗 Please add the remote repository:"
    echo "   git remote add origin https://github.com/meletnaza-prog/RR-Chat-AI-Assistant.git"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Repository name: RR-Chat-AI-Assistant"
echo "3. Make it public"
echo "4. Don't initialize with README"
echo "5. Run: git remote add origin https://github.com/meletnaza-prog/RR-Chat-AI-Assistant.git"
echo "6. Run: git branch -M main"
echo "7. Run: git push -u origin main"
echo ""
echo "🎉 Your RR-Chat AI Assistant will be live on GitHub!"
