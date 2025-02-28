# CSV Import for Blog Posts

This feature allows you to bulk import multiple blog posts from a CSV file.

## CSV Format

Your CSV file should have the following columns:

- `title` (required): The title of your blog post
- `date` (optional): Publication date in YYYY-MM-DD format (defaults to current date if not provided)
- `excerpt` (optional): A brief summary of the post that appears on the homepage
- `topics` (optional): Comma-separated list of topics/tags (e.g., "tech,writing,tutorial")
- `content` (required): The full content of your post in Markdown format
- `slug` (optional): Custom URL slug (will be generated from title if not provided)
- `readTime` (optional): Reading time (e.g., "3 minute read") - will be calculated automatically if not provided

## Sample CSV

A sample CSV file (`sample-posts.csv`) is included in this repository. You can use it as a template for your own posts.

## How to Import

1. Prepare your CSV file following the format described above
2. Run the import script:

```bash
npm run import path/to/your/posts.csv
```

Or directly:

```bash
node import-posts.js path/to/your/posts.csv
```

3. After importing, rebuild your site to see the changes:

```bash
npm run build
```

## Tips for CSV Formatting

- Make sure to properly escape quotes in your content by doubling them (`""`)
- For content with multiple paragraphs, you can include line breaks directly in the CSV cell
- You can use Markdown formatting in the content column
- If your content contains commas, make sure the entire content is enclosed in quotes

## Example

```csv
title,date,excerpt,topics,content
"My First Post","2024-02-28","This is a sample post.","tech,tutorial","# My First Post

This is the content of my post.

## Subheading

More content here."
```

## Troubleshooting

- If you encounter issues with CSV parsing, check that your CSV is properly formatted
- Verify that all required fields (title and content) are included
- For date parsing issues, ensure dates are in YYYY-MM-DD format 