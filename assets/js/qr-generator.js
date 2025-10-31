// QR Generator with Real QRCode Library and Form Validation
import QRCode from 'qrcode';

class QRGenerator {
  constructor() {
    this.form = null;
    this.generateButton = null;
    this.downloadButton = null;
    this.canvas = null;
    this.resultContainer = null;
    this.fields = {};
    this.currentQRData = null;
    this.originalButtonText = '';
    this.debounceTimer = null;
    this.isGenerating = false;
    // Character counter elements & config
    this.charCounter = {
      text: null,
      remaining: null,
      bar: null,
      warning: null,
      max: 800
    };
    this.init();
  }

  init() {
    // Get DOM elements
    this.form = document.getElementById('qr-form');
    this.downloadButton = document.getElementById('download-btn');
    this.canvas = document.getElementById('qr-canvas');
    this.resultContainer = document.getElementById('qr-result');
    
    // Get form fields
    this.fields = {
      userName: document.getElementById('userName'),
      password: document.getElementById('password'),
      context: document.getElementById('context')
    };

    // Character counter elements
    this.charCounter.text = document.getElementById('char-counter-text');
    this.charCounter.remaining = document.getElementById('char-counter-remaining');
    this.charCounter.bar = document.getElementById('char-counter-bar');
    this.charCounter.warning = document.getElementById('char-counter-warning');

    if (!this.form || !this.canvas) {
      console.error('QR Generator: Required elements not found');
      return;
    }
    
    this.setupEventListeners();
    this.updateCharCounter();
    this.validateForm(); // Initial validation
    console.log('QR Generator initialized with auto-generation enabled');
  }

  setupEventListeners() {
    // Form submission (prevent default)
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    // Auto-generate QR on field changes with debounce
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.addEventListener('input', () => {
          this.validateForm();
          this.updateCharCounter();
          this.debouncedGenerateQR();
        });
        field.addEventListener('blur', () => {
          this.validateForm();
          this.updateCharCounter();
          this.debouncedGenerateQR();
        });
      }
    });

    // Download button
    if (this.downloadButton) {
      this.downloadButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.downloadQR();
      });
    }

    // Generate initial QR if form is valid
    setTimeout(() => {
      if (this.validateForm()) {
        this.generateQR();
      }
    }, 100);
  }

  debouncedGenerateQR() {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer to generate QR after 500ms of no input
    this.debounceTimer = setTimeout(() => {
      if (this.validateForm() && !this.isGenerating) {
        this.generateQR();
      }
    }, 500);
  }

  getQRContentString() {
    const userName = this.fields.userName?.value.trim() || '';
    const password = this.fields.password?.value.trim() || '';
    const context = this.fields.context?.value.trim() || '';
    const qrData = { userName, password, context };
    try {
      return JSON.stringify(qrData);
    } catch {
      return '';
    }
  }

  updateCharCounter() {
    if (!this.charCounter.text) return;

    const content = this.getQRContentString();
    const length = content.length;
    const max = this.charCounter.max;
    const percent = Math.min((length / max) * 100, 100);
    const remaining = max - length;

    // Update text
    this.charCounter.text.textContent = `${length} / ${max} caracteres`;
    if (this.charCounter.remaining) {
      if (remaining >= 0) {
        this.charCounter.remaining.textContent = `${remaining} restantes`;
      } else {
        this.charCounter.remaining.textContent = `${Math.abs(remaining)} sobre el límite`;
      }
    }

    // Update bar width & color with inline styles (avoid relying on purged classes)
    if (this.charCounter.bar) {
      this.charCounter.bar.style.width = `${percent}%`;
      let color = '#22c55e'; // green-500
      if (length > max) {
        color = '#dc2626'; // red-600
      } else if (length > max * 0.85) {
        color = '#f97316'; // orange-500
      } else if (length > max * 0.6) {
        color = '#facc15'; // yellow-400
      }
      this.charCounter.bar.style.backgroundColor = color;
      this.charCounter.bar.setAttribute('aria-valuenow', String(Math.min(length, max)));
    }

    // Warning visibility
    if (this.charCounter.warning) {
      if (length > max) {
        this.charCounter.warning.classList.remove('hidden');
      } else {
        this.charCounter.warning.classList.add('hidden');
      }
    }
  }

  validateForm() {
    const userName = this.fields.userName?.value.trim() || '';
    const password = this.fields.password?.value.trim() || '';
    const context = this.fields.context?.value.trim() || '';

    // Check if all required fields have values
    const basicValid = userName.length > 0 && password.length > 0 && context.length > 0;

    // Length constraint (full JSON content length inside QR)
    const qrContent = this.getQRContentString();
    const withinLimit = qrContent.length <= this.charCounter.max;

    const isValid = basicValid && withinLimit;

    return isValid;
  }

  async generateQR() {
    if (!this.validateForm() || this.isGenerating) {
      return;
    }

    // Set generating state
    this.isGenerating = true;

    try {
      // Prepare QR data
      const qrData = {
        userName: this.fields.userName.value.trim(),
        password: this.fields.password.value.trim(),
        context: this.fields.context.value.trim()
      };

      // Create QR content as JSON
      const qrContent = JSON.stringify(qrData);
      
      // Only generate if content has changed
      if (this.currentQRData === qrContent) {
        return;
      }
      
      this.currentQRData = qrContent;

      // Generate QR code using the real library
      const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Draw QR code on canvas
      await this.drawQRToCanvas(qrCodeDataURL);

      // Show result
      if (this.resultContainer) {
        this.resultContainer.classList.remove('hidden');
      }

      console.log('QR Code generated successfully');
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Don't show alert for auto-generation errors
      console.log('Auto-generation failed, will retry on next change');
    } finally {
      // Reset generating state
      this.isGenerating = false;
    }
  }

  async drawQRToCanvas(dataURL) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 200;
        this.canvas.height = 200;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, 200, 200);
        
        resolve();
      };
      img.onerror = reject;
      img.src = dataURL;
    });
  }

  downloadQR() {
    if (!this.canvas || !this.currentQRData) {
      console.log('No QR code to download');
      return;
    }

    try {
      // Ensure we only download once per click
      const timestamp = Date.now();
      const filename = `mobilelanter-qr-${timestamp}.png`;

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = this.canvas.toDataURL('image/png');
      link.style.display = 'none';

      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();

      // Remove link after a short delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);

      console.log('QR code downloaded:', filename);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error al descargar el código QR.');
    }
  }
}

// QRGenerator is initialized by MobileLanterApp - no auto-initialization needed

export { QRGenerator };