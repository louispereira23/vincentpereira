// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // Ensure dark theme is always used
  localStorage.setItem('theme', 'dark');
  
  // Remove any light theme class if it exists
  document.documentElement.classList.remove('light-theme');
}); 