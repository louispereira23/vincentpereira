#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build the site
echo "Building the site..."
node build.js

# Save the current branch name
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Stash any changes
echo "Stashing any uncommitted changes..."
git stash

# Switch to gh-pages branch
echo "Switching to gh-pages branch..."
git checkout gh-pages

# Remove existing content (except .git folder)
echo "Cleaning gh-pages branch..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} \;

# Copy public directory contents to root
echo "Copying built files to gh-pages branch..."
cp -r public/* .

# Create a .nojekyll file to bypass Jekyll processing
echo "Creating .nojekyll file..."
touch .nojekyll

# Add CNAME file if you have a custom domain
# echo "yourdomain.com" > CNAME

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy: $(date)"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin gh-pages

# Switch back to original branch
echo "Switching back to $CURRENT_BRANCH branch..."
git checkout $CURRENT_BRANCH

# Apply stashed changes if any
echo "Applying stashed changes if any..."
git stash pop || true

echo "Deployment complete! Your site should be available at https://louispereira23.github.io/vincentpereira/" 