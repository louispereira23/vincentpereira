// Static admin page functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Static admin page loaded');
  
  // Function to count posts
  function countPosts() {
    const postItems = document.querySelectorAll('.post-item');
    return postItems.length;
  }
  
  // Function to get unique topics
  function getUniqueTopics() {
    const topicTags = document.querySelectorAll('.topic-tag');
    const topics = new Set();
    
    topicTags.forEach(tag => {
      const topic = tag.getAttribute('data-topic');
      if (topic) {
        topics.add(topic);
      }
    });
    
    return Array.from(topics).sort();
  }
  
  // Function to update the admin page with site information
  function updateAdminInfo() {
    // Get site information
    fetch('../index.html')
      .then(response => response.text())
      .then(html => {
        // Create a temporary element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Count posts
        const postItems = tempDiv.querySelectorAll('.post-item');
        const postCount = postItems.length;
        
        // Get topics
        const topicElements = tempDiv.querySelectorAll('.topic-tag');
        const topics = new Set();
        
        topicElements.forEach(tag => {
          const topic = tag.getAttribute('data-topic');
          if (topic) {
            topics.add(topic);
          }
        });
        
        const uniqueTopics = Array.from(topics).sort();
        
        // Update the admin page
        const siteInfoSection = document.querySelector('#site-info');
        if (siteInfoSection) {
          siteInfoSection.innerHTML = `
            <ul>
              <li><strong>Total Posts</strong>: ${postCount}</li>
              <li><strong>Topics</strong>: ${uniqueTopics.join(', ')}</li>
              <li><strong>Last Updated</strong>: ${new Date().toLocaleString()}</li>
            </ul>
          `;
        }
      })
      .catch(error => {
        console.error('Error fetching site information:', error);
      });
  }
  
  // Find the site info section and update it
  const siteInfoSection = document.querySelector('#site-info');
  if (siteInfoSection) {
    updateAdminInfo();
  }
}); 