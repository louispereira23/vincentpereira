const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const marked = require('marked');
const matter = require('gray-matter');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { execSync } = require('child_process');
require('dotenv').config();

// Create the Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Keep the process running despite the error
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process running despite the error
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_change_this',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up handlebars for templating
try {
  app.set('view engine', 'html');
  app.engine('html', require('express-handlebars').engine({
    extname: '.html',
    defaultLayout: false
  }));
  app.set('views', path.join(__dirname, 'src', 'templates'));
} catch (error) {
  console.error('Error setting up template engine:', error);
  // Fallback to basic rendering if handlebars fails
  app.set('view engine', 'html');
  app.engine('html', (filePath, options, callback) => {
    fs.readFile(filePath, (err, content) => {
      if (err) return callback(err);
      return callback(null, content.toString());
    });
  });
}

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/admin/login');
};

// Paths
const markdownDir = path.join(__dirname, 'src', 'markdown');
const postsMarkdownDir = path.join(markdownDir, 'posts');

// Helper functions
function getAllPosts() {
  if (!fs.existsSync(postsMarkdownDir)) {
    return [];
  }

  try {
    const postFiles = fs.readdirSync(postsMarkdownDir).filter(file => file.endsWith('.md'));
    const posts = [];
    
    postFiles.forEach(file => {
      try {
        const filePath = path.join(postsMarkdownDir, file);
        const { content, data } = matter(fs.readFileSync(filePath, 'utf8'));
        
        const post = {
          title: data.title || 'Untitled Post',
          date: data.date ? data.date.toString() : new Date().toISOString().split('T')[0],
          dateRaw: data.date ? data.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          excerpt: data.excerpt || '',
          slug: file.replace('.md', ''),
          topics: data.topics || [],
          topicsString: data.topics ? data.topics.join(', ') : '',
          content: content
        };
        
        posts.push(post);
      } catch (error) {
        console.error(`Error processing post file ${file}:`, error);
      }
    });
    
    return posts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
}

function getPostBySlug(slug) {
  const filePath = path.join(postsMarkdownDir, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const { content, data } = matter(fs.readFileSync(filePath, 'utf8'));
    
    return {
      title: data.title || 'Untitled Post',
      date: data.date ? data.date.toString() : new Date().toISOString().split('T')[0],
      dateRaw: data.date ? data.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      slug: slug,
      topics: data.topics || [],
      topicsString: data.topics ? data.topics.join(', ') : '',
      content: content
    };
  } catch (error) {
    console.error(`Error getting post by slug ${slug}:`, error);
    return null;
  }
}

function savePost(post) {
  try {
    const { title, date, readTime, excerpt, slug, topics, content } = post;
    
    const frontMatter = {
      title,
      date: new Date(date),
      readTime,
      excerpt,
      topics: topics.split(',').map(topic => topic.trim()).filter(topic => topic)
    };
    
    const fileContent = matter.stringify(content, frontMatter);
    const filePath = path.join(postsMarkdownDir, `${slug}.md`);
    
    fs.ensureDirSync(postsMarkdownDir);
    fs.writeFileSync(filePath, fileContent);
    
    // Rebuild the site
    try {
      execSync('node build.js', { stdio: 'inherit' });
      return true;
    } catch (error) {
      console.error('Error rebuilding site after saving post:', error);
      return false;
    }
  } catch (error) {
    console.error('Error saving post:', error);
    return false;
  }
}

function deletePost(slug) {
  try {
    const mdFilePath = path.join(postsMarkdownDir, `${slug}.md`);
    const htmlFilePath = path.join(__dirname, 'public', 'posts', `${slug}.html`);
    
    let mdDeleted = false;
    let htmlDeleted = false;
    
    // Delete the markdown file
    if (fs.existsSync(mdFilePath)) {
      try {
        fs.unlinkSync(mdFilePath);
        mdDeleted = true;
        console.log(`Deleted markdown file: ${mdFilePath}`);
      } catch (error) {
        console.error(`Error deleting markdown file: ${error}`);
      }
    }
    
    // Delete the HTML file directly
    if (fs.existsSync(htmlFilePath)) {
      try {
        fs.unlinkSync(htmlFilePath);
        htmlDeleted = true;
        console.log(`Deleted HTML file: ${htmlFilePath}`);
      } catch (error) {
        console.error(`Error deleting HTML file: ${error}`);
      }
    }
    
    // Rebuild the site to update the index page
    if (mdDeleted || htmlDeleted) {
      try {
        execSync('node build.js', { stdio: 'inherit' });
        return true;
      } catch (error) {
        console.error('Error rebuilding site after post deletion:', error);
        return mdDeleted || htmlDeleted; // Return true if at least one file was deleted
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

// Routes with error handling
// Public routes
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    console.error('Error serving index page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/posts/:slug', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'public', 'posts', `${req.params.slug}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    console.error(`Error serving post ${req.params.slug}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin routes
app.get('/admin/login', (req, res) => {
  try {
    if (req.session.isAuthenticated) {
      return res.redirect('/admin/dashboard');
    }
    res.render('admin-login', { error: req.query.error });
  } catch (error) {
    console.error('Error serving login page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && 
        bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH)) {
      req.session.isAuthenticated = true;
      return res.redirect('/admin/dashboard');
    }
    
    res.redirect('/admin/login?error=Invalid+username+or+password');
  } catch (error) {
    console.error('Error processing login:', error);
    res.redirect('/admin/login?error=Server+error');
  }
});

app.get('/admin/logout', (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Error processing logout:', error);
    res.redirect('/admin/login');
  }
});

app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  try {
    const posts = getAllPosts();
    res.render('admin-dashboard', { 
      posts,
      message: req.query.message
    });
  } catch (error) {
    console.error('Error serving dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/admin/new-post', isAuthenticated, (req, res) => {
  try {
    res.render('admin-post-editor');
  } catch (error) {
    console.error('Error serving new post page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/admin/new-post', isAuthenticated, (req, res) => {
  try {
    const { title, date, readTime, excerpt, slug, topics, content } = req.body;
    
    // Validate required fields
    if (!title || !date || !slug || !content) {
      return res.render('admin-post-editor', { 
        error: 'Title, date, slug, and content are required',
        post: req.body
      });
    }
    
    // Check if slug already exists
    const existingPost = getPostBySlug(slug);
    if (existingPost) {
      return res.render('admin-post-editor', { 
        error: 'A post with this slug already exists',
        post: req.body
      });
    }
    
    // Save the post
    const success = savePost(req.body);
    
    if (success) {
      res.redirect('/admin/dashboard?message=Post+created+successfully');
    } else {
      res.render('admin-post-editor', { 
        error: 'Failed to save post',
        post: req.body
      });
    }
  } catch (error) {
    console.error('Error creating new post:', error);
    res.render('admin-post-editor', { 
      error: 'Server error',
      post: req.body
    });
  }
});

app.get('/admin/edit-post/:slug', isAuthenticated, (req, res) => {
  try {
    const post = getPostBySlug(req.params.slug);
    
    if (!post) {
      return res.redirect('/admin/dashboard?error=Post+not+found');
    }
    
    res.render('admin-post-editor', { post });
  } catch (error) {
    console.error(`Error serving edit post page for ${req.params.slug}:`, error);
    res.redirect('/admin/dashboard?error=Server+error');
  }
});

app.post('/admin/edit-post/:slug', isAuthenticated, (req, res) => {
  try {
    const { title, date, readTime, excerpt, topics, content } = req.body;
    const slug = req.params.slug;
    
    // Validate required fields
    if (!title || !date || !content) {
      return res.render('admin-post-editor', { 
        error: 'Title, date, and content are required',
        post: { ...req.body, slug }
      });
    }
    
    // Check if post exists
    const existingPost = getPostBySlug(slug);
    if (!existingPost) {
      return res.redirect('/admin/dashboard?error=Post+not+found');
    }
    
    // Save the post
    const success = savePost({ ...req.body, slug });
    
    if (success) {
      res.redirect('/admin/dashboard?message=Post+updated+successfully');
    } else {
      res.render('admin-post-editor', { 
        error: 'Failed to update post',
        post: { ...req.body, slug }
      });
    }
  } catch (error) {
    console.error(`Error updating post ${req.params.slug}:`, error);
    res.redirect(`/admin/edit-post/${req.params.slug}?error=Server+error`);
  }
});

app.post('/admin/delete-post/:slug', isAuthenticated, (req, res) => {
  try {
    const success = deletePost(req.params.slug);
    
    if (success) {
      return res.redirect('/admin/dashboard?message=Post+deleted+successfully');
    }
    
    res.redirect('/admin/dashboard?error=Failed+to+delete+post');
  } catch (error) {
    console.error(`Error deleting post ${req.params.slug}:`, error);
    res.redirect('/admin/dashboard?error=Server+error');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).send('Internal Server Error');
});

// Start the server with error handling
let server;
try {
  server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please use a different port.`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('Error starting server:', error);
} 