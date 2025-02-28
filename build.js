const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

// Configure marked for security
marked.setOptions({
  headerIds: false,
  mangle: false
});

// Paths
const templatesDir = path.join(__dirname, 'src', 'templates');
const markdownDir = path.join(__dirname, 'src', 'markdown');
const postsMarkdownDir = path.join(markdownDir, 'posts');
const publicDir = path.join(__dirname, 'public');
const publicPostsDir = path.join(publicDir, 'posts');

// Ensure directories exist
fs.ensureDirSync(publicDir);
fs.ensureDirSync(publicPostsDir);

// Read templates
const pageTemplate = fs.readFileSync(path.join(templatesDir, 'page.html'), 'utf8');
const postTemplate = fs.readFileSync(path.join(templatesDir, 'post.html'), 'utf8');

// Process markdown pages
function processMarkdownPages() {
  const markdownFiles = fs.readdirSync(markdownDir).filter(file => 
    file.endsWith('.md') && !fs.statSync(path.join(markdownDir, file)).isDirectory()
  );

  markdownFiles.forEach(file => {
    const filePath = path.join(markdownDir, file);
    const { content, data } = matter(fs.readFileSync(filePath, 'utf8'));
    const htmlContent = marked.parse(content);
    
    let html = pageTemplate
      .replace('{{title}}', data.title || 'Personal Blog')
      .replace('{{content}}', htmlContent)
      .replace('{{bioLine}}', '');
    
    const outputPath = path.join(publicDir, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, html);
    console.log(`Generated: ${outputPath}`);
  });
}

// Process blog posts
function processBlogPosts() {
  if (!fs.existsSync(postsMarkdownDir)) {
    console.log('No posts directory found, skipping post generation');
    return [];
  }

  const postFiles = fs.readdirSync(postsMarkdownDir).filter(file => file.endsWith('.md'));
  const posts = [];
  
  // Generate each blog post
  postFiles.forEach(file => {
    const filePath = path.join(postsMarkdownDir, file);
    const { content, data } = matter(fs.readFileSync(filePath, 'utf8'));
    const htmlContent = marked.parse(content);
    
    // Extract metadata
    const slug = file.replace('.md', '');
    
    // Clean up topics to ensure they don't have quotes
    let cleanTopics = [];
    if (data.topics && Array.isArray(data.topics)) {
      cleanTopics = data.topics.map(topic => topic.replace(/^["']|["']$/g, '').trim());
    }
    
    // Create post object
    const postObject = {
      title: data.title,
      date: data.date,
      slug: slug,
      excerpt: data.excerpt || '',
      content: content,
      topics: cleanTopics
    };
    
    // Format the date to only include the date part (no time)
    if (postObject.date) {
      const dateObj = new Date(postObject.date);
      postObject.date = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    posts.push(postObject);
    
    let html = postTemplate
      .replace(/{{title}}/g, postObject.title)
      .replace(/{{content}}/g, htmlContent)
      .replace('{{bioLine}}', '');
    
    const outputPath = path.join(publicPostsDir, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, html);
    console.log(`Generated blog post: ${outputPath}`);
  });
  
  // Sort posts by date (newest first)
  return posts.sort((a, b) => {
    return b.dateObj - a.dateObj;
  });
}

// Generate index page with blog posts
function generateIndexPage(posts) {
  // Group posts by year
  const postsByYear = {};
  posts.forEach(post => {
    const dateStr = post.date.toString();
    const year = dateStr.split('-')[0];
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });

  // Generate posts HTML
  let postsHTML = '';
  
  // Add bio line for homepage only
  const bioLine = '<div class="bio-line-container"><p class="bio-line">Writer, developer, and minimalist sharing thoughts on design and technology.</p></div>';
  
  // Add topics section
  const topics = generateTopicsList(posts);
  const topicsHTML = topics.map(topic => 
    `<a href="#" class="topic-tag" data-topic="${topic}">${topic}</a>`
  ).join(', ');

  if (topics.length > 0) {
    postsHTML += `
      <section class="topics">
        <h2>Topics</h2>
        <div class="topics-list">
          ${topicsHTML}
        </div>
      </section>
      <hr>
    `;
  }

  // Add writing section with posts by year
  postsHTML += `<section class="writing" id="posts-container"><h2>Writing</h2>`;
  
  Object.keys(postsByYear).sort().reverse().forEach(year => {
    postsByYear[year].forEach(post => {
      // Clean up topics for the data-topics attribute
      const cleanTopics = post.topics.map(topic => topic.replace(/^["']|["']$/g, '').trim());
      
      postsHTML += `
        <div class="post-item" data-topics="${cleanTopics.join(',')}">
          <div class="post-date-title">
            <a href="/posts/${post.slug}.html" class="post-title">${post.title}</a>
          </div>
        </div>
      `;
    });
  });
  
  postsHTML += `</section>`;

  // Generate index.html
  let indexHTML = pageTemplate
    .replace('{{title}}', 'Personal Blog')
    .replace('{{content}}', postsHTML)
    .replace('{{bioLine}}', '');
  
  // Insert bio line between header and main content
  indexHTML = indexHTML.replace(
    '</header>\n\n    <main>',
    '</header>\n\n    ' + bioLine + '\n\n    <main>'
  );
  
  const outputPath = path.join(publicDir, 'index.html');
  fs.writeFileSync(outputPath, indexHTML);
  console.log(`Generated index page: ${outputPath}`);
}

// Copy static assets
function copyStaticAssets() {
  // Copy CSS
  fs.copySync(
    path.join(__dirname, 'src', 'css'), 
    path.join(publicDir, 'css'),
    { overwrite: true }
  );
  
  // Copy JS
  fs.copySync(
    path.join(__dirname, 'src', 'js'), 
    path.join(publicDir, 'js'),
    { overwrite: true }
  );
  
  console.log('Static assets copied');
}

// Function to generate the topics list for the index page
function generateTopicsList(posts) {
  // Extract all unique topics from posts
  const allTopics = new Set();
  posts.forEach(post => {
    if (post.topics && Array.isArray(post.topics)) {
      post.topics.forEach(topic => {
        // Clean up the topic - remove any quotes and trim whitespace
        const cleanTopic = topic.replace(/^["']|["']$/g, '').trim();
        if (cleanTopic) {
          allTopics.add(cleanTopic);
        }
      });
    }
  });
  
  // Convert Set to Array and sort alphabetically
  return Array.from(allTopics).sort();
}

// Main build function
function build() {
  console.log('Building site...');
  
  try {
    // Clean up the public/posts directory to remove deleted posts
    if (fs.existsSync(publicPostsDir)) {
      const existingHtmlFiles = fs.readdirSync(publicPostsDir).filter(file => file.endsWith('.html'));
      const markdownFiles = fs.existsSync(postsMarkdownDir) ? 
        fs.readdirSync(postsMarkdownDir).filter(file => file.endsWith('.md')) : [];
      
      // Get slugs from markdown files
      const validSlugs = markdownFiles.map(file => file.replace('.md', ''));
      
      // Remove HTML files that don't have corresponding markdown files
      existingHtmlFiles.forEach(htmlFile => {
        const slug = htmlFile.replace('.html', '');
        if (!validSlugs.includes(slug)) {
          const fileToRemove = path.join(publicPostsDir, htmlFile);
          fs.unlinkSync(fileToRemove);
          console.log(`Removed deleted post: ${fileToRemove}`);
        }
      });
    }
    
    processMarkdownPages();
    const posts = processBlogPosts();
    generateIndexPage(posts);
    copyStaticAssets();
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
  }
}

// Run the build
build(); 