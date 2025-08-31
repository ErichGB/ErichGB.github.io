// MobileLanter Main Application - Fixed version
// Import all functionalities
import { ThemeToggle } from './theme-toggle.js';
import { QRGenerator } from './qr-generator.js';

// Main application class
class MobileLanterApp {
  constructor() {
    this.themeToggle = null;
    this.qrGenerator = null;
    this.init();
  }

  init() {
    // Initialize all components when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeComponents();
        this.addGlobalEventListeners();
      });
    } else {
      this.initializeComponents();
      this.addGlobalEventListeners();
    }
  }

  initializeComponents() {
    console.log('Initializing MobileLanter components');
    
    // Initialize theme toggle
    this.themeToggle = new ThemeToggle();
    
    // Initialize QR generator
    this.qrGenerator = new QRGenerator();
    
    console.log('All components initialized');
  }

  addGlobalEventListeners() {
    console.log('Adding global event listeners');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + T for theme toggle
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        console.log('Theme toggle shortcut pressed');
        if (window.themeToggle) {
          window.themeToggle.toggleTheme();
        }
      }
    });

    console.log('Global event listeners added');
  }
}

// Initialize the application
if (typeof window !== 'undefined') {
  console.log('Initializing MobileLanter App');
  new MobileLanterApp();
}

// Export for potential external use
export { MobileLanterApp };
