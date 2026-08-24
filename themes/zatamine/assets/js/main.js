/* Minimal navigation behavior for the zatamine theme. No dependencies. */
(function () {
  'use strict';

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function close() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close the panel after choosing a link.
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  // Auto-close when resizing up to the desktop layout.
  var mq = window.matchMedia('(min-width: 768px)');
  function onResize(e) { if (e.matches) close(); }
  if (mq.addEventListener) mq.addEventListener('change', onResize);
  else mq.addListener(onResize);
})();
