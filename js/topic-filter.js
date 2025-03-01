// Topic filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Topic filter script loaded');
    
    // Get all topic tags and post items
    const topicTags = document.querySelectorAll('.topic-tag');
    const postItems = document.querySelectorAll('.post-item');
    
    console.log(`Found ${topicTags.length} topic tags and ${postItems.length} post items`);
    
    // Log all topic tags for debugging
    topicTags.forEach(tag => {
        console.log(`Topic tag: ${tag.textContent.trim()}, data-topic: ${tag.getAttribute('data-topic')}`);
    });
    
    // Log all post items and their topics for debugging
    postItems.forEach(item => {
        const title = item.querySelector('h2')?.textContent || 'Unknown title';
        const topics = item.getAttribute('data-topics');
        console.log(`Post item: "${title}", data-topics: ${topics}`);
    });
    
    // Function to filter posts by topic
    function filterPostsByTopic(selectedTopic) {
        console.log(`Filtering by topic: "${selectedTopic}"`);
        
        let matchCount = 0;
        
        postItems.forEach(item => {
            try {
                const postTopics = item.getAttribute('data-topics') || '';
                const title = item.querySelector('h2')?.textContent || 'Unknown title';
                
                console.log(`Checking post "${title}" with topics: "${postTopics}"`);
                
                // Different ways to check if the topic is included
                const topicsArray = postTopics.split(',');
                const includesMatch = topicsArray.includes(selectedTopic);
                const indexOfMatch = postTopics.indexOf(selectedTopic) >= 0;
                const someMatch = topicsArray.some(t => t === selectedTopic);
                
                console.log(`  - includes match: ${includesMatch}`);
                console.log(`  - indexOf match: ${indexOfMatch}`);
                console.log(`  - some match: ${someMatch}`);
                
                // Case insensitive check as fallback
                const caseInsensitiveMatch = topicsArray.some(t => 
                    t.toLowerCase() === selectedTopic.toLowerCase());
                console.log(`  - case insensitive match: ${caseInsensitiveMatch}`);
                
                // Use a simple includes check for the final decision
                const isMatch = postTopics.includes(selectedTopic);
                
                if (isMatch) {
                    item.style.display = 'block';
                    matchCount++;
                    console.log(`  ✓ MATCH - Showing post "${title}"`);
                } else {
                    item.style.display = 'none';
                    console.log(`  ✗ NO MATCH - Hiding post "${title}"`);
                }
            } catch (error) {
                console.error(`Error filtering post:`, error);
            }
        });
        
        console.log(`Found ${matchCount} posts matching topic "${selectedTopic}"`);
    }
    
    // Function to show all posts
    function showAllPosts() {
        console.log('Showing all posts');
        postItems.forEach(item => {
            item.style.display = 'block';
        });
    }
    
    // Keep track of the currently active topic
    let activeTopic = null;
    
    // Add click event listeners to topic tags
    topicTags.forEach(tag => {
        tag.addEventListener('click', function(event) {
            event.preventDefault();
            
            const clickedTopic = tag.getAttribute('data-topic');
            console.log(`Clicked topic: "${clickedTopic}", Current active topic: "${activeTopic}"`);
            
            // If clicking the already active topic, unselect it and show all posts
            if (clickedTopic === activeTopic) {
                console.log('Unselecting current topic');
                activeTopic = null;
                topicTags.forEach(t => t.classList.remove('active'));
                showAllPosts();
                
                // Update URL to remove the topic parameter
                const url = new URL(window.location);
                url.searchParams.delete('topic');
                window.history.pushState({}, '', url);
                
                return;
            }
            
            // If clicking "all", show all posts
            if (clickedTopic === 'all') {
                activeTopic = null;
                topicTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                showAllPosts();
                
                // Update URL to remove the topic parameter
                const url = new URL(window.location);
                url.searchParams.delete('topic');
                window.history.pushState({}, '', url);
                
                return;
            }
            
            // Otherwise, select the new topic
            activeTopic = clickedTopic;
            
            // Update active class
            topicTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            // Filter posts by the selected topic
            console.log(`Selected topic: "${activeTopic}"`);
            filterPostsByTopic(activeTopic);
            
            // Update URL with the selected topic
            const url = new URL(window.location);
            url.searchParams.set('topic', activeTopic);
            window.history.pushState({}, '', url);
        });
    });
    
    // Check for topic parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const topicParam = urlParams.get('topic');
    
    if (topicParam) {
        console.log(`Found topic parameter in URL: ${topicParam}`);
        activeTopic = topicParam;
        
        // Find and activate the corresponding topic tag
        const matchingTag = Array.from(topicTags).find(tag => 
            tag.getAttribute('data-topic') === topicParam);
        
        if (matchingTag) {
            console.log(`Found matching topic tag for: ${topicParam}`);
            topicTags.forEach(t => t.classList.remove('active'));
            matchingTag.classList.add('active');
            filterPostsByTopic(topicParam);
        } else {
            console.log(`No matching topic tag found for: ${topicParam}`);
            showAllPosts();
        }
    } else {
        // Initialize with all posts shown
        showAllPosts();
    }
}); 