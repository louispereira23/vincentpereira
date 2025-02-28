# Personal Blog - Static Site

A simple personal blogging website built with HTML, CSS, JavaScript, and Node.js. This project uses markdown for content creation and converts it to HTML.

## Features

- Clean, minimalist design with dark mode by default (and light mode toggle)
- Responsive layout that works on all devices
- Markdown-based content management
- Blog post listing with latest post featured
- Topics categorization
- No complex frameworks - just vanilla HTML, CSS, and JavaScript

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone this repository or download the files
2. Install dependencies:

```bash
npm install
```

### Development

1. Create or edit markdown files:
   - Regular pages go in the `src/markdown` directory
   - Blog posts go in the `src/markdown/posts` directory
   - Use front matter (the `---` section at the top) to add metadata

2. Build the site:

```bash
npm run build
```

3. Start the development server:

```bash
npm run dev
```

4. Visit `http://localhost:3000` in your browser

### Adding Content

#### Creating Pages

Create a new markdown file in the `src/markdown` directory. For example, `contact.md`:

```markdown
---
title: Contact Me
---

# Contact Me

This is the contact page content...
```

#### Creating Blog Posts

Create a new markdown file in the `src/markdown/posts` directory. For example, `new-post.md`:

```markdown
---
title: My New Blog Post
date: 2023-09-15
readTime: 3 minute read
excerpt: A brief summary of the post that will appear on the homepage.
topics: [topic1, topic2]
---

# My New Blog Post

Content goes here...
```

#### Bulk Importing Posts from CSV

You can also bulk import multiple blog posts from a CSV file:

1. Prepare a CSV file with your posts (see `sample-posts.csv` for format)
2. Run the import script:

```bash
npm run import path/to/your/posts.csv
```

3. Rebuild the site to see your imported posts:

```bash
npm run build
```

For detailed instructions on CSV importing, see `CSV-IMPORT-README.md`.

### Deployment

To deploy the site:

1. Build the site:

```bash
npm run build
```

2. The built site will be in the `public` directory
3. Upload the contents of the `public` directory to your web hosting provider

## Project Structure

```
├── public/               # Generated site (after build)
├── src/
│   ├── css/              # CSS styles
│   ├── js/               # JavaScript files
│   ├── markdown/         # Markdown content
│   │   └── posts/        # Blog posts
│   └── templates/        # HTML templates
├── build.js              # Build script
├── server.js             # Development server
└── package.json          # Project dependencies
```

## Customization

- Edit the templates in `src/templates/` to change the site structure
- Modify `src/css/styles.css` to change the site appearance
- Update `src/js/main.js` to add or modify functionality
- Change "Your Name" in the templates to your actual name

## License

This project is open source and available under the [MIT License](LICENSE).
