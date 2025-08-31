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
    this.init();
  }

  init() {
    // Get DOM elements
    this.form = document.getElementById('qr-form');
    this.generateButton = document.getElementById('generate-btn');
    this.downloadButton = document.getElementById('download-btn');
    this.canvas = document.getElementById('qr-canvas');
    this.resultContainer = document.getElementById('qr-result');
    
    // Get form fields
    this.fields = {
      userName: document.getElementById('userName'),
      password: document.getElementById('password'),
      context: document.getElementById('context')
    };

    if (!this.form || !this.generateButton || !this.canvas) {
      console.error('QR Generator: Required elements not found');
      return;
    }

    // Store original button text
    this.originalButtonText = this.generateButton.textContent.trim();
    
    this.setupEventListeners();
    this.validateForm(); // Initial validation
    console.log('QR Generator initialized with real QRCode library');
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateQR();
    });

    // Field validation on input
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.addEventListener('input', () => this.validateForm());
        field.addEventListener('blur', () => this.validateForm());
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
  }

  validateForm() {
    const userName = this.fields.userName?.value.trim() || '';
    const password = this.fields.password?.value.trim() || '';
    const context = this.fields.context?.value.trim() || '';

    // Check if all required fields have values
    const isValid = userName.length > 0 && password.length > 0 && context.length > 0;

    // Enable/disable generate button
    if (this.generateButton) {
      this.generateButton.disabled = !isValid;
      
      if (isValid) {
        this.generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
        this.generateButton.classList.add('hover:bg-slate-800', 'dark:hover:bg-slate-100');
      } else {
        this.generateButton.classList.add('opacity-50', 'cursor-not-allowed');
        this.generateButton.classList.remove('hover:bg-slate-800', 'dark:hover:bg-slate-100');
      }
    }

    return isValid;
  }

  async generateQR() {
    if (!this.validateForm()) {
      console.log('Form validation failed');
      return;
    }

    // Show loading state
    this.generateButton.textContent = 'Generando...';
    this.generateButton.disabled = true;

    try {
      // Prepare QR data
      const qrData = {
        userName: this.fields.userName.value.trim(),
        password: this.fields.password.value.trim(),
        context: this.fields.context.value.trim()
      };

      // Create QR content as JSON
      const qrContent = JSON.stringify(qrData);
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
      alert('Error al generar el código QR. Por favor, inténtalo de nuevo.');
    } finally {
      // Restore button state
      this.generateButton.textContent = this.originalButtonText;
      this.validateForm(); // Re-enable button if form is still valid
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