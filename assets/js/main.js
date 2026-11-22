/* Progressive enhancement: links and content remain usable without JavaScript. */
document.documentElement.classList.add('js');

/* Non-modal mobile navigation. The breakpoint matches the CSS. */
(function () {
  var head = document.querySelector('[data-header]');
  var btn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('#site-nav');
  if (!head || !btn || !nav) return;

  var desktop = window.matchMedia('(min-width: 861px)');

  function setOpen(open, restoreFocus) {
    if (!open && (restoreFocus || (!desktop.matches && nav.contains(document.activeElement)))) {
      btn.focus();
    }
    head.dataset.open = open ? 'true' : 'false';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  setOpen(false);

  btn.addEventListener('click', function () {
    setOpen(head.dataset.open !== 'true');
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && head.dataset.open === 'true') {
      setOpen(false, true);
    }
  });

  document.addEventListener('click', function (event) {
    if (head.dataset.open === 'true' && !head.contains(event.target)) setOpen(false);
  });

  desktop.addEventListener('change', function () {
    setOpen(false);
  });
})();

/* Poem window: synchronize the visible text, pressed state, and reading label. */
(function () {
  document.querySelectorAll('.poem-section').forEach(function (section) {
    var buttons = section.querySelectorAll('[data-poem-mode]');
    var poems = section.querySelectorAll('[data-poem]');
    var scroller = section.querySelector('.poem-scroll');

    function selectPoem(mode) {
      var poemName = mode === 'dark' ? 'eclipse' : 'tea';
      section.setAttribute('data-mode', mode);
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-poem-mode') === mode ? 'true' : 'false');
      });
      poems.forEach(function (poem) {
        var active = poem.getAttribute('data-poem') === poemName;
        poem.hidden = !active;
        var title = poem.querySelector('.poem-title');
        if (active && scroller && title) scroller.setAttribute('aria-label', title.textContent.trim());
      });
      if (scroller) scroller.scrollLeft = 0;
    }

    selectPoem(section.getAttribute('data-mode') === 'dark' ? 'dark' : 'light');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectPoem(button.getAttribute('data-poem-mode') === 'dark' ? 'dark' : 'light');
      });
    });
  });
})();

/* A page index stays a set of real anchors; observation only adds location cues. */
(function () {
  document.querySelectorAll('[data-section-nav]').forEach(function (nav) {
    var items = [];
    nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var id;
      try { id = decodeURIComponent(link.getAttribute('href').slice(1)); }
      catch (_) { return; }
      var target = document.getElementById(id);
      if (target) items.push({ link: link, target: target });
    });
    if (!items.length) return;

    function markCurrent(target) {
      items.forEach(function (item) {
        if (item.target === target) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }

    items.forEach(function (item) {
      item.link.addEventListener('click', function () { markCurrent(item.target); });
    });

    if (!('IntersectionObserver' in window)) return;
    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      var current = items.find(function (item) { return visible.has(item.target); });
      if (current) markCurrent(current.target);
    }, { rootMargin: '-18% 0px -60% 0px', threshold: 0 });
    items.forEach(function (item) { observer.observe(item.target); });
  });
})();
