// Admin functionality
document.addEventListener('DOMContentLoaded', () => {
  // Auto-generate slug from title
  const titleInput = document.getElementById('title');
  const slugInput = document.getElementById('slug');
  
  if (titleInput && slugInput && !slugInput.readOnly) {
    titleInput.addEventListener('input', () => {
      const slug = titleInput.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
        .trim();
      
      slugInput.value = slug;
    });
  }
  
  // Preview functionality could be added here
  // For example, a live preview of the markdown content
  
  // Confirm before leaving page with unsaved changes
  const form = document.querySelector('form');
  if (form) {
    let formChanged = false;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        formChanged = true;
      });
      
      input.addEventListener('keyup', () => {
        formChanged = true;
      });
    });
    
    window.addEventListener('beforeunload', (e) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
    
    form.addEventListener('submit', () => {
      formChanged = false;
    });
  }
}); 