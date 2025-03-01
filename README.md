# Vincent Pereira's Blog

A personal blog built with Node.js and deployed to GitHub Pages.

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/louispereira23/vincentpereira.git
   cd vincentpereira
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build the static site:
   ```
   npm run build
   ```

## Deployment

### Option 1: Using npm deploy script

The easiest way to deploy the site to GitHub Pages is using the npm deploy script:

```
npm run deploy
```

This will:
1. Build the site (via the predeploy script)
2. Push the built files to the gh-pages branch

### Option 2: Using the deploy.sh script

Alternatively, you can use the deploy.sh script:

```
./deploy.sh
```

This script will:
1. Build the site
2. Switch to the gh-pages branch
3. Copy the built files
4. Commit and push the changes
5. Switch back to your original branch

### Option 3: GitHub Actions (Automatic Deployment)

The repository is configured with GitHub Actions to automatically deploy the site whenever changes are pushed to the main branch.

## Site Structure

- `src/markdown/posts/`: Contains all blog posts in Markdown format
- `src/templates/`: Contains HTML templates for the site
- `src/css/`: Contains CSS files
- `src/js/`: Contains JavaScript files
- `public/`: Contains the built static site (generated from the build script)

## Admin Interface

The admin interface is available at `/admin/login` when running the local development server. This interface is not available on the deployed GitHub Pages site, as GitHub Pages only supports static content.

## GitHub Pages URL

The site is deployed at: [https://louispereira23.github.io/vincentpereira/](https://louispereira23.github.io/vincentpereira/)
