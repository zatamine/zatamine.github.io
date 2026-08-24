// Simple Analytics Wrapper
// Handles Google Analytics and other tracking

(function() {
  'use strict';

  // Check if analytics should load
  if (!window._gat) {
    window._gat = Object.create(null);
  }

  // Set up page tracking
  window.addEventListener('load', function() {
    if (window.GoogleAnalyticsObject) {
      window[window.GoogleAnalyticsObject] = window[window.GoogleAnalyticsObject] || function() {
        (window[window.GoogleAnalyticsObject].q = window[window.GoogleAnalyticsObject].q || []).push(arguments)
      };
      window[window.GoogleAnalyticsObject].l = 1 * new Date();
    }

    // Track page view
    if (typeof ga === 'function') {
      ga('create', window.GoogleAnalyticsID, 'auto');
      ga('send', 'pageview');
    }
  });

  // Enhanced link tracking
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target && target.href && !target.href.startsWith('#') && target.href.startsWith(window.location.origin)) {
      if (typeof ga === 'function') {
        ga('send', 'event', 'navigation', 'click', target.href);
      }
    }
  });

  // Track outbound links
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target && 
        (target.href.startsWith('http://') || target.href.startsWith('https://')) &&
        !target.href.includes(window.location.hostname)) {
      if (typeof ga === 'function') {
        ga('send', 'event', 'outbound', 'click', target.href);
      }
    }
  });

})();