const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const CSV_FILE_PATH = process.argv[2] || 'posts.csv'; // Get CSV file path from command line argument or use default
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

// Function to normalize and filter topics to only include allowed values
function normalizeTopics(topicsString) {
  if (!topicsString) return ['musings']; // Default topic if none provided
  
  // Allowed topics - strictly limit to these three
  const allowedTopics = ['family', 'musings', 'memories'];
  
  // Remove any quotes and split by commas
  const rawTopics = topicsString.replace(/^["']|["']$/g, '').split(',');
  
  // Clean each topic and filter to only include allowed topics
  const cleanedTopics = rawTopics
    .map(topic => {
      return topic.trim().toLowerCase().replace(/^["']|["']$/g, '').replace(/\.$/, '');
    })
    .filter(topic => topic.length > 0);
  
  // Filter to only include allowed topics
  const validTopics = cleanedTopics.filter(topic => allowedTopics.includes(topic));
  
  // If no valid topics found, default to 'musings'
  return validTopics.length > 0 ? validTopics : ['musings'];
}

// Main import function
async function importPostsFromCSV() {
  try {
    console.log(`Importing posts from ${CSV_FILE_PATH}...`);
    
    // Read the CSV file
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    
    // First, let's clean up the existing posts directory to start fresh
    const existingFiles = fs.readdirSync(POSTS_DIR);
    for (const file of existingFiles) {
      if (file.endsWith('.md')) {
        fs.unlinkSync(path.join(POSTS_DIR, file));
        console.log(`Deleted existing file: ${file}`);
      }
    }
    
    // Parse the CSV content manually to handle multiline fields correctly
    const posts = parseCSV(csvContent);
    
    console.log(`Found ${posts.length} posts in the CSV file`);
    
    // Process each post
    let successCount = 0;
    for (const post of posts) {
      try {
        // Skip posts with missing title or content
        if (!post.title || !post.content) {
          console.warn(`Skipping post with missing title or content: ${post.title || 'Untitled'}`);
          continue;
        }
        
        // Clean up the title and content
        const title = post.title.trim();
        const content = post.content.trim();
        
        // Generate slug from title
        const slug = slugify(title);
        
        // Use current date
        const date = new Date();
        
        // Calculate reading time
        const readTime = calculateReadingTime(content);
        
        // Create front matter
        const frontMatter = {
          title: title,
          date: date,
          readTime: readTime,
          excerpt: content.split('\n')[0].substring(0, 150) + '...',
          topics: post.topics
        };
        
        // Create markdown content with front matter
        const fileContent = matter.stringify(content, frontMatter);
        
        // Write to file
        const filePath = path.join(POSTS_DIR, `${slug}.md`);
        fs.writeFileSync(filePath, fileContent);
        
        console.log(`Created post: ${slug}.md with topics: ${post.topics.join(', ')}`);
        successCount++;
      } catch (err) {
        console.error(`Error processing post: ${err.message}`);
      }
    }
    
    console.log(`Successfully imported ${successCount} out of ${posts.length} posts`);
    console.log('Run "node build.js" to rebuild your site with the new posts.');
    
  } catch (error) {
    console.error('Error importing posts:', error);
    process.exit(1);
  }
}

// Function to parse CSV content, handling multiline fields correctly
function parseCSV(csvContent) {
  // Split the content into lines
  const lines = csvContent.split('\n');
  
  // Extract the header line
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  
  // Find the indices of the title, content, and topics columns
  const titleIndex = headers.findIndex(h => h.trim().toLowerCase() === 'title');
  const contentIndex = headers.findIndex(h => h.trim().toLowerCase() === 'content');
  const topicsIndex = headers.findIndex(h => h.trim().toLowerCase() === 'topics');
  
  if (titleIndex === -1 || contentIndex === -1) {
    console.error('CSV file must have "title" and "content" columns');
    process.exit(1);
  }
  
  // Process the CSV content
  const posts = [];
  let currentLine = '';
  let inQuotedField = false;
  
  // Skip the header line and process each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Count quotes in the line to determine if we're entering or exiting a quoted field
    const quoteCount = (line.match(/"/g) || []).length;
    
    if (!inQuotedField) {
      // Starting a new line
      if (quoteCount % 2 === 1) {
        // Odd number of quotes means we're entering a quoted field
        inQuotedField = true;
        currentLine = line;
      } else {
        // Even number of quotes means the line is complete
        if (line.trim()) {
          processCompleteLine(line, posts, titleIndex, contentIndex, topicsIndex);
        }
      }
    } else {
      // Continuing a quoted field
      if (quoteCount % 2 === 1) {
        // Odd number of quotes means we're exiting a quoted field
        inQuotedField = false;
        currentLine += '\n' + line;
        processCompleteLine(currentLine, posts, titleIndex, contentIndex, topicsIndex);
        currentLine = '';
      } else {
        // Even number of quotes means we're still in a quoted field
        currentLine += '\n' + line;
      }
    }
  }
  
  // Process any remaining line
  if (currentLine.trim()) {
    processCompleteLine(currentLine, posts, titleIndex, contentIndex, topicsIndex);
  }
  
  return posts;
}

// Helper function to process a complete CSV line
function processCompleteLine(line, posts, titleIndex, contentIndex, topicsIndex) {
  try {
    const fields = parseCSVLine(line);
    
    if (fields.length <= Math.max(titleIndex, contentIndex)) {
      // Skip malformed lines
      console.warn(`Skipping malformed line: ${line.substring(0, 50)}...`);
      return;
    }
    
    const title = fields[titleIndex] || '';
    const content = fields[contentIndex] || '';
    const topics = topicsIndex !== -1 && fields.length > topicsIndex ? fields[topicsIndex] : '';
    
    posts.push({
      title: title,
      content: content,
      topics: normalizeTopics(topics)
    });
  } catch (err) {
    console.error(`Error processing line: ${err.message}`);
  }
}

// Helper function to parse a CSV line, handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      // Add character to current field
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

// Run the import
importPostsFromCSV(); 