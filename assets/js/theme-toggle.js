// Theme Toggle with Button Group (like Tailwind CSS) - Fixed Version
class ThemeToggle {
  constructor() {
    this.themes = ['light', 'dark', 'auto'];
    this.currentTheme = 'auto';
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  init() {
    this.container = document.getElementById('theme-toggle-group');
    
    if (!this.container) {
      console.error('Theme toggle container not found');
      return;
    }

    console.log('Theme toggle initialized');

    // Set initial theme
    this.setInitialTheme();
    
    // Add event listeners to buttons
    this.container.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-theme]');
      if (button && button.dataset.theme) {
        console.log('Theme button clicked:', button.dataset.theme);
        this.setTheme(button.dataset.theme);
      }
    });
    
    // Listen for system theme changes ONLY when in auto mode
    this.mediaQuery.addEventListener('change', (e) => {
      console.log('System theme changed:', e.matches ? 'dark' : 'light');
      if (this.currentTheme === 'auto') {
        this.applyTheme();
      }
    });
  }

  setInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    console.log('Setting initial theme:', savedTheme);
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.error('Invalid theme:', theme);
      return;
    }

    console.log('Setting theme:', theme);
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.updateButtons();
    this.applyTheme();
  }

  updateButtons() {
    if (!this.container) return;

    const buttons = this.container.querySelectorAll('button[data-theme]');
    console.log('Updating buttons, found:', buttons.length);
    
    buttons.forEach(button => {
      const isActive = button.dataset.theme === this.currentTheme;
      console.log(`Button ${button.dataset.theme} active:`, isActive);
      
      if (isActive) {
        button.classList.add('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
        button.classList.remove('text-slate-500', 'hover:text-slate-700', 'dark:text-slate-400', 'dark:hover:text-slate-200');
      } else {
        button.classList.remove('bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
        button.classList.add('text-slate-500', 'hover:text-slate-700', 'dark:text-slate-400', 'dark:hover:text-slate-200');
      }
    });
  }

  applyTheme() {
    let shouldBeDark = false;
    
    if (this.currentTheme === 'dark') {
      shouldBeDark = true;
    } else if (this.currentTheme === 'light') {
      shouldBeDark = false;
    } else if (this.currentTheme === 'auto') {
      shouldBeDark = this.mediaQuery.matches;
    }

    console.log(`Applying theme: ${this.currentTheme}, shouldBeDark: ${shouldBeDark}`);

    // Remove existing theme classes
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    
    // Apply new theme
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }

    // Verify the classes were applied
    console.log('documentElement classes:', document.documentElement.classList.toString());
    
    // Force style recalculation
    void document.documentElement.offsetHeight;
  }

  // Method for keyboard shortcuts
  toggleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex]);
  }
}

// Initialize theme toggle when DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
  });
}

export { ThemeToggle };
