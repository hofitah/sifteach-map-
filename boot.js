(function () {
  'use strict';
  var navKey = document.body.getAttribute('data-nav') || 'map';
  var pageKey = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  mountDC({ template: 'nav-tpl', root: document.getElementById('nav'), cls: window.NavComponent, props: { current: navKey } });
  window.__page = mountDC({ template: 'page-tpl', root: document.getElementById('page-inner'), cls: window.PageComponent, props: {}, persist: pageKey });

  // The map is a fixed 1800px poster: scale it to the screen, never below a readable size (then it scrolls sideways).
  if (document.body.classList.contains('wide')) {
    var outer = document.getElementById('page');
    var inner = document.getElementById('page-inner');
    var sizer = document.createElement('div');
    outer.insertBefore(sizer, inner); sizer.appendChild(inner);
    var fit = function () {
      var s = Math.max(Math.min(1, outer.clientWidth / 1800), 0.42);
      inner.style.transform = 'scale(' + s + ')';
      sizer.style.width = (1800 * s) + 'px';
      sizer.style.height = (inner.offsetHeight * s) + 'px';
    };
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
    fit();
  }
})();
