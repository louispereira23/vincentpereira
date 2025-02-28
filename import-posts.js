const fs = require('fs-extra');
const path = require('path');
const { parse } = require('csv-parse/sync');
const matter = require('gray-matter');

// Configuration
const CSV_FILE_PATH = process.argv[2]; // Get CSV file path from command line argument
const POSTS_DIR = path.join(__dirname, 'src', 'markdown', 'posts');

// Ensure the posts directory exists
fs.ensureDirSync(POSTS_DIR);

// Function to convert a string to a slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

// Function to calculate reading time
function calculateReadingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes === 1 ? '1 minute read' : `${minutes} minute read`;
}

// Main import function
async function importPostsFromCSV() {
  if (!CSV_FILE_PATH) {
    console.error('Please provide a CSV file path as an argument');
    console.log('Usage: node import-posts.js path/to/your/posts.csv');
    process.exit(1);
  }

  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    
    // Parse the CSV content with relaxed options for multiline content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      escape: '\\',
      ltrim: true,
      rtrim: true
    });
    
    console.log(`Found ${records.length} posts in the CSV file`);
    
    // Process each record
    for (const record of records) {
      // Validate required fields
      if (!record.title || !record.content) {
        console.warn(`Skipping post with missing title or content: ${record.title || 'Untitled'}`);
        continue;
      }
      
      // Generate slug from title if not provided
      const slug = record.slug || slugify(record.title);
      
      // Parse date or use current date
      let date;
      try {
        date = record.date ? new Date(record.date) : new Date();
      } catch (e) {
        console.warn(`Invalid date format for "${record.title}", using current date`);
        date = new Date();
      }
      
      // Parse topics
      const topics = record.topics ? 
        record.topics.split(',').map(topic => topic.trim()) : 
        [];
      
      // Calculate reading time if not provided
      const readTime = record.readTime || calculateReadingTime(record.content);
      
      // Create front matter
      const frontMatter = {
        title: record.title,
        date: date,
        readTime: readTime,
        excerpt: record.excerpt || '',
        topics: topics
      };
      
      // Create markdown content with front matter
      const fileContent = matter.stringify(record.content, frontMatter);
      
      // Write to file
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      fs.writeFileSync(filePath, fileContent);
      
      console.log(`Created post: ${filePath}`);
    }
    
    console.log('Import completed successfully!');
    console.log('Run "node build.js" to rebuild your site with the new posts.');
    
  } catch (error) {
    console.error('Error importing posts:', error);
    process.exit(1);
  }
}

// Run the import
importPostsFromCSV(); 