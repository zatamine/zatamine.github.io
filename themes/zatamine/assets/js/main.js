// Dark mode toggle
function initializeDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  // Check for saved theme preference or respect OS setting
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');

  // Apply theme on load
  if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Toggle function
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // Add event listener to toggle button if it exists
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleTheme);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
  // DOM already loaded
  initializeDarkMode();
}

// Mobile menu toggle
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', function() {
      const isExpanded = navList.classList.contains('show');
      navList.classList.toggle('show');
      
      // Update aria-expanded attribute
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
  }

  // Close mobile menu when clicking a link
  if (navList) {
    const navLinks = navList.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Close mobile menu when clicking outside
  if (menuToggle && navList) {
    document.addEventListener('click', (event) => {
      if (!menuToggle.contains(event.target) && !navList.contains(event.target)) {
        navList.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Initialize mobile menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMobileMenu);
} else {
  // DOM already loaded
  initializeMobileMenu();
}