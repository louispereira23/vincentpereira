#!/bin/bash

# Exit if any command fails
set -e

echo "Starting GitHub Pages deployment..."

# Make sure we're on the main branch
git checkout main

# Build the site
echo "Building the site..."
npm run build

# Create .nojekyll file to prevent Jekyll processing
echo "Ensuring .nojekyll file exists..."
touch public/.nojekyll

# Create a temporary directory for deployment
echo "Creating temporary directory for deployment..."
rm -rf temp-deploy
mkdir temp-deploy

# Copy all files from public to the temporary directory
echo "Copying files to temporary directory..."
cp -r public/* temp-deploy/
cp public/.nojekyll temp-deploy/

# Switch to gh-pages branch (create if it doesn't exist)
echo "Switching to gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
  git rm -rf .
fi

# Remove existing files (except .git)
echo "Cleaning gh-pages branch..."
find . -maxdepth 1 ! -name .git ! -name . -exec rm -rf {} \;

# Copy files from temporary directory
echo "Moving files to gh-pages branch..."
cp -r temp-deploy/* .
cp temp-deploy/.nojekyll .

# Add all files
echo "Adding files to git..."
git add -A

# Commit changes
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages: $(date)"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin gh-pages

# Clean up
echo "Cleaning up..."
rm -rf temp-deploy

# Switch back to main branch
git checkout main

echo "Deployment complete!"
echo "Your site should be available at https://louispereira23.github.io/vincentpereira/" 