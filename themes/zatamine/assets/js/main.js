/* zatamine theme — minimal JS: mobile nav + client-side tag filtering */
(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close the menu after clicking a link (mobile)
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- Client-side tag filtering (posts archive) ---------- */
  var filters = document.querySelectorAll('.chip-filter');
  var rows = document.querySelectorAll('.post-row-filterable');

  if (filters.length && rows.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.getAttribute('data-tag');

        filters.forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        rows.forEach(function (row) {
          var tags = (row.getAttribute('data-tags') || '').trim();
          var show = tag === 'all' || tags.split(/\s+/).indexOf(tag) !== -1;
          row.style.display = show ? '' : 'none';
        });
      });
    });
  }
})();
