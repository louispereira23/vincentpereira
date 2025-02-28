// Topic filtering functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get all topic tags and post items
  const topicTags = document.querySelectorAll('.topic-tag');
  const postItems = document.querySelectorAll('.post-item');
  const postsContainer = document.getElementById('posts-container');
  
  // Add a "clear filter" button (initially hidden)
  const clearFilterButton = document.createElement('button');
  clearFilterButton.textContent = 'Show All Topics';
  clearFilterButton.classList.add('clear-filter-btn');
  clearFilterButton.style.display = 'none';
  
  // Insert the clear filter button after the topics list
  const topicsSection = document.querySelector('.topics');
  if (topicsSection) {
    topicsSection.appendChild(clearFilterButton);
  }
  
  // Track the active filter
  let activeFilter = null;
  
  // Function to filter posts by topic
  function filterPostsByTopic(topic) {
    // Update active filter
    activeFilter = topic;
    
    // Show the clear filter button
    clearFilterButton.style.display = 'inline-block';
    
    // Update active class on topic tags
    topicTags.forEach(tag => {
      if (tag.getAttribute('data-topic') === topic) {
        tag.classList.add('active');
      } else {
        tag.classList.remove('active');
      }
    });
    
    // Filter the posts
    postItems.forEach(item => {
      const postTopics = item.getAttribute('data-topics');
      if (postTopics && postTopics.split(',').includes(topic)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Add a heading to indicate filtered view
    const existingFilterHeading = document.getElementById('filter-heading');
    if (!existingFilterHeading) {
      const filterHeading = document.createElement('div');
      filterHeading.id = 'filter-heading';
      filterHeading.classList.add('filter-heading');
      filterHeading.textContent = `Showing posts about "${topic}"`;
      postsContainer.insertBefore(filterHeading, postsContainer.querySelector('h2').nextSibling);
    } else {
      existingFilterHeading.textContent = `Showing posts about "${topic}"`;
    }
  }
  
  // Function to clear the filter
  function clearFilter() {
    // Reset active filter
    activeFilter = null;
    
    // Hide the clear filter button
    clearFilterButton.style.display = 'none';
    
    // Remove active class from all topic tags
    topicTags.forEach(tag => {
      tag.classList.remove('active');
    });
    
    // Show all posts
    postItems.forEach(item => {
      item.style.display = 'block';
    });
    
    // Remove the filter heading
    const filterHeading = document.getElementById('filter-heading');
    if (filterHeading) {
      filterHeading.remove();
    }
  }
  
  // Add click event listeners to topic tags
  topicTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = tag.getAttribute('data-topic');
      
      // If clicking the already active filter, clear it
      if (activeFilter === topic) {
        clearFilter();
      } else {
        filterPostsByTopic(topic);
      }
    });
  });
  
  // Add click event listener to clear filter button
  clearFilterButton.addEventListener('click', clearFilter);
}); 