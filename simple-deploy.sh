#!/bin/bash

# Exit if any command fails
set -e

echo "Starting GitHub Pages deployment..."

# Build the site
echo "Building the site..."
npm run build

# Create .nojekyll file to prevent Jekyll processing
echo "Ensuring .nojekyll file exists..."
touch public/.nojekyll

# Create or switch to the gh-pages branch
echo "Setting up gh-pages branch..."
git checkout -B gh-pages

# Copy all files from public to the root directory
echo "Copying files from public to root..."
cp -r public/* .
cp public/.nojekyll .

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy to GitHub Pages: $(date)"

# Push to GitHub
echo "Pushing to GitHub..."
git push -f origin gh-pages

# Switch back to main branch
git checkout main

echo "Deployment complete!"
echo "Your site should be available at https://louispereira23.github.io/vincentpereira/" 