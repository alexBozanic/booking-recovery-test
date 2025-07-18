(function( ) {
  console.log('Tracking script loaded');
  
  // Get tracking ID from script URL - try multiple methods
  var trackingId = null;
  
  // Method 1: From current script src
  var scripts = document.getElementsByTagName('script');
  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i];
    if (script.src && script.src.includes('tracking.js')) {
      var urlParams = new URLSearchParams(script.src.split('?')[1] || '');
      trackingId = urlParams.get('id');
      console.log('Found tracking ID from script:', trackingId);
      break;
    }
  }
  
  // Method 2: From URL parameters if still not found
  if (!trackingId) {
    var urlParams = new URLSearchParams(window.location.search);
    trackingId = urlParams.get('tracking_id');
    console.log('Found tracking ID from URL:', trackingId);
  }
  
  // Method 3: Use demo ID if still not found
  if (!trackingId) {
    trackingId = 'track_demo123';
    console.log('Using default tracking ID:', trackingId);
  }
  
  if (!trackingId) {
    console.error('Booking Recovery: No tracking ID found');
    return;
  }

  console.log('Booking Recovery starting with ID:', trackingId);

  var BookingRecovery = {
    trackingId: trackingId,
    sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    formData: {},
    isTracking: false,
    abandonmentTimer: null,
    apiUrl: window.location.origin + '/api/track',
    
    init: function() {
      console.log('Booking Recovery initialized with ID:', this.trackingId);
      this.detectForms();
      this.setupAbandonmentDetection();
    },
    
    detectForms: function() {
      var forms = document.querySelectorAll('form');
      var self = this;
      
      console.log('Found', forms.length, 'forms on page');
      
      forms.forEach(function(form, index) {
        console.log('Checking form', index, ':', form);
        if (self.isBookingForm(form)) {
          console.log('Booking form detected:', form);
          self.trackForm(form);
        }
      });
    },
    
    isBookingForm: function(form) {
      var formText = form.innerHTML.toLowerCase();
      var bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'date', 'time', 'calendar'];
      
      var hasKeyword = bookingKeywords.some(function(keyword) {
        return formText.includes(keyword);
      });
      
      console.log('Form contains booking keywords:', hasKeyword);
      return hasKeyword;
    },
    
    trackForm: function(form) {
      var self = this;
      var inputs = form.querySelectorAll('input, select, textarea');
      
      console.log('Tracking form with', inputs.length, 'inputs');
      
      inputs.forEach(function(input) {
        input.addEventListener('input', function() {
          self.captureFormData(input);
          self.resetAbandonmentTimer();
        });
        
        input.addEventListener('focus', function() {
          console.log('User started interacting with form');
          self.isTracking = true;
          self.resetAbandonmentTimer();
        });
      });
      
      form.addEventListener('submit', function() {
        self.trackCompletion();
      });
    },
    
    captureFormData: function(input) {
      var name = input.name || input.id || input.type;
      var value = input.value;
      
      if (this.isSafeField(input)) {
        this.formData[name] = value;
        console.log('Captured data:', name, '=', value);
      }
    },
    
    isSafeField: function(input) {
      var type = input.type.toLowerCase();
      var name = (input.name || input.id || '').toLowerCase();
      
      var unsafeTypes = ['password', 'hidden'];
      var unsafeNames = ['password', 'pass', 'pwd', 'credit', 'card', 'cvv', 'ssn'];
      
      if (unsafeTypes.includes(type)) return false;
      
      return !unsafeNames.some(function(unsafe) {
        return name.includes(unsafe);
      });
    },
    
    resetAbandonmentTimer: function() {
      var self = this;
      
      if (this.abandonmentTimer) {
        clearTimeout(this.abandonmentTimer);
        console.log('Reset abandonment timer');
      }
      
      this.abandonmentTimer = setTimeout(function() {
        console.log('30 seconds of inactivity - triggering abandonment');
        self.trackAbandonment();
      }, 30000); // 30 seconds for demo
    },
    
    setupAbandonmentDetection: function() {
      var self = this;
      
      document.addEventListener('visibilitychange', function() {
        if (document.hidden && self.isTracking) {
          console.log('Page hidden - potential abandonment');
          setTimeout(function() {
            if (document.hidden) {
              self.trackAbandonment();
            }
          }, 2000);
        }
      });
      
      window.addEventListener('beforeunload', function() {
        if (self.isTracking) {
          console.log('Page unloading - tracking abandonment');
          self.trackAbandonment();
        }
      });
    },
    
    trackAbandonment: function() {
      if (!this.isTracking) {
        console.log('Not tracking, skipping abandonment');
        return;
      }
      
      console.log('🚨 TRACKING ABANDONMENT EVENT');
      
      var data = {
        trackingId: this.trackingId,
        sessionId: this.sessionId,
        event: 'abandonment',
        formData: this.formData,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      console.log('Sending abandonment data:', data);
      this.sendData(data);
      this.isTracking = false;
    },
    
    trackCompletion: function() {
      console.log('🎉 TRACKING COMPLETION EVENT');
      
      var data = {
        trackingId: this.trackingId,
        sessionId: this.sessionId,
        event: 'completion',
        formData: this.formData,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending completion data:', data);
      this.sendData(data);
      this.isTracking = false;
    },
    
    sendData: function(data) {
      console.log('Sending data to API:', this.apiUrl);
      
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(function(response) {
        console.log('✅ Data sent successfully! Status:', response.status);
        return response.json();
      }).then(function(result) {
        console.log('API Response:', result);
      }).catch(function(error) {
        console.error('❌ Tracking error:', error);
      });
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, initializing tracking');
      BookingRecovery.init();
    });
  } else {
    console.log('DOM already loaded, initializing tracking immediately');
    BookingRecovery.init();
  }
})();
