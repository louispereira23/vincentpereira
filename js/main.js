// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const toggleIcon = document.querySelector('.toggle-icon');
  
  // Check for saved theme preference or use default dark theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    toggleIcon.textContent = '☀️';
  }
  
  // Toggle theme when button is clicked
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-theme');
      
      // Update icon and save preference
      if (document.documentElement.classList.contains('light-theme')) {
        toggleIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
      } else {
        toggleIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
      }
    });
  }
}); 