/* "You are here" bar + "done with this station" panel on station pages.
   Progress is shared with the map (localStorage "sifteach:index" → {done:{stationId:true}}). */
(function () {
  'use strict';
  var ORDER = ['w1s1', 'w1s2', 'w1s3', 'w1s4', 'w2s1', 'w2s2', 'w2s3', 'w3s1', 'w3s2', 'w3s3', 'w4'];
  var WEEK = function (id) { return id === 'w4' ? 4 : +id[1]; };
  var PAGES = {
    compass: { ids: ['w1s1'], name: 'הגדירו כיוון' },
    orgs: { ids: ['w1s2', 'w2s1', 'w3s1'], name: 'פונים לארגונים' },
    people: { ids: ['w1s3', 'w2s2', 'w3s2'], name: 'יוצרים קשרים' },
    apply: { ids: ['w1s4', 'w2s3', 'w3s3'], name: 'הגישו למשרה אחת' },
    review: { ids: ['w4'], name: 'עצירת ביניים' }
  };
  var OTHER = {
    index: null,
    checklist: 'כיכר השבוע · נקודת הפתיחה',
    data: 'נקודת מידע · איך אנחנו יודעים זאת?',
    mail: 'תבנית כתיבה · מייל פנייה לארגון',
    finish: 'היעד · סיום הדרך'
  };
  var key = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  var page = PAGES[key];
  if (!page && !OTHER[key]) return;

  var load = function () { try { return JSON.parse(localStorage.getItem('sifteach:index') || 'null') || {}; } catch (e) { return {}; } };
  var store = function (s) { try { localStorage.setItem('sifteach:index', JSON.stringify(s)); } catch (e) {} };
  var st = load(); st.done = st.done || {}; st.chk = st.chk || {};
  var countDone = function () { return ORDER.filter(function (k) { return st.done[k]; }).length; };

  var css = document.createElement('style');
  css.textContent = '' +
    '.here{max-width:1040px;margin:28px auto 0;padding:0 24px;box-sizing:border-box;font-family:Heebo,Arial,sans-serif;color:#24211F}' +
    '.tl-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 16px;font-size:17px;margin-bottom:10px}.tl-top .yh{font-size:26px;font-weight:800;color:#C1272D}.tl-top b{color:#7A1C2B}' +
    '.tl{display:flex;gap:10px;margin:0;padding:0;list-style:none}' +
    '.tl-w{flex:var(--n) 1 0;min-width:0}' +
    '.tl-wl{display:block;font-size:14px;font-weight:800;letter-spacing:.02em;margin-bottom:16px;color:var(--c)}' +
    '.tl-w ol{display:flex;margin:0;padding:0;list-style:none;position:relative}' +
    '.tl-w ol::before{content:"";position:absolute;top:13px;right:6px;left:6px;height:4px;border-radius:2px;background:var(--c);opacity:.35}' +
    '.tl-s{flex:1 1 0;min-width:0;text-align:center;position:relative}' +
    '.tl-s a{display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;color:#24211F;font-size:14px;line-height:1.2;padding:0 2px}' +
    '.tl-d{width:22px;height:22px;border-radius:50%;box-sizing:border-box;border:3px solid var(--c);background:#FBF3E0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;position:relative;z-index:1;margin-top:4px}' +
    '.tl-s.done .tl-d{background:var(--c)}' +
    '.tl-s.cur .tl-d{width:30px;height:30px;margin-top:0;border-width:4px;box-shadow:0 0 0 4px rgba(122,28,43,.15)}' +
    '.tl-s.cur a{font-weight:800;color:#7A1C2B}' +
    '.tl-s a:hover span{text-decoration:underline}' +
    '.tl-pin{position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:800;color:#fff;background:#7A1C2B;border-radius:6px;padding:1px 6px;white-space:nowrap;z-index:2}' +
    '@media (max-width:760px){.tl-s a span{display:none}.tl-s.cur a span{display:block;font-size:11px}}' +
    '.donep{max-width:1040px;margin:0 auto;padding:0 24px;box-sizing:border-box;font-family:Heebo,Arial,sans-serif}' +
    '.donep section{background:transparent;border:2px solid #C1272D;border-radius:12px;padding:20px 24px;display:flex;flex-direction:column;gap:14px}' +
    '.donep h2{margin:0;font-size:22px;font-weight:800;color:#24211F}' +
    '.donep .weeks{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:17px}' +
    '.donep button{font:inherit;cursor:pointer;border-radius:12px;min-height:48px;padding:0 20px;font-size:20px;font-weight:700}' +
    '.donep .main{background:transparent;color:#C1272D;border:2px solid #C1272D;align-self:flex-start;font-size:18px;min-height:44px}.donep .main:hover{background:#C1272D;color:#fff}' +
    '.donep .main[aria-pressed=true]{background:#1E7A3C;border-color:#1E7A3C}' +
    '.donep .wk{min-height:40px;font-size:17px;padding:0 14px;background:transparent;color:#7A1C2B;border:2px solid #7A1C2B}' +
    '.donep .wk[aria-pressed=true]{background:#7A1C2B;color:#fff}' +
    '.donep .nav{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:28px}' +
    '.donep .nav a{display:inline-flex;align-items:center;min-height:48px;padding:0 20px;border-radius:12px;text-decoration:none;font-weight:700;font-size:19px}' +
    '.donep .prev{border:2px solid #C1272D;color:#C1272D}.donep .next{background:#C1272D;border:2px solid #C1272D;color:#fff}' +
    '.donep .next:hover{background:#A51F25;color:#fff}' +
    '#page-inner div[style*="justify-content: space-between"][style*="border-top: 1px solid"]{display:none !important}';
  document.head.appendChild(css);


  var NAMES = { w1s1: 'הגדירו כיוון', w1s2: 'ארגונים', w1s3: 'קשרים', w1s4: 'הגשה', w2s1: 'ארגונים', w2s2: 'קשרים', w2s3: 'הגשה', w3s1: 'ארגונים', w3s2: 'קשרים', w3s3: 'הגשה', w4: 'עצירת ביניים' };
  var HREF = { w1s1: 'compass.html', w4: 'review.html' };
  ['1', '2', '3'].forEach(function (w) { HREF['w' + w + (w === '1' ? 's2' : 's1')] = 'orgs.html'; HREF['w' + w + (w === '1' ? 's3' : 's2')] = 'people.html'; HREF['w' + w + (w === '1' ? 's4' : 's3')] = 'apply.html'; });
  var WCOL = { 1: '#C1272D', 2: '#1D6E9E', 3: '#1D6E9E', 4: '#7A1C2B' };
  function timeline(cur, label) {
    var dc = countDone(), html = '<div class="tl-top"><span><span class="yh">אתם כאן:</span> <b>' + label + '</b></span><span>' + dc + ' מתוך 11 תחנות הושלמו</span></div><ol class="tl">';
    [1, 2, 3, 4].forEach(function (w) {
      var ids = ORDER.filter(function (k) { return WEEK(k) === w; });
      html += '<li class="tl-w" style="--n:' + ids.length + ';--c:' + WCOL[w] + '"><span class="tl-wl">' + (w === 4 ? 'שבוע 4' : 'שבוע ' + w) + '</span><ol>';
      ids.forEach(function (k) {
        var d = !!st.done[k], c = k === cur;
        html += '<li class="tl-s' + (d ? ' done' : '') + (c ? ' cur' : '') + '">' + (c ? '<span class="tl-pin" aria-hidden="true">אתם כאן</span>' : '') +
          '<a href="' + HREF[k] + '"' + (c ? ' aria-current="step"' : '') + ' aria-label="תחנה ' + (ORDER.indexOf(k) + 1) + ', שבוע ' + w + ': ' + NAMES[k] + (d ? ' – בוצע' : '') + '">' +
          '<i class="tl-d" aria-hidden="true">' + (d ? '✓' : '') + '</i><span>' + NAMES[k] + '</span></a></li>';
      });
      html += '</ol></li>';
    });
    return html + '</ol>';
  }
  var main = document.getElementById('page');
  // let the page colour run behind the bars above/below the content
  var first = document.querySelector('#page-inner > div');
  if (first) { var bg = getComputedStyle(first).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)') document.body.style.backgroundColor = bg; }
  var pagerA = document.querySelectorAll('#page-inner div[style*="justify-content: space-between"][style*="border-top: 1px solid"] a');
  var prev = pagerA[0] ? { href: pagerA[0].getAttribute('href'), text: pagerA[0].textContent.replace(/^\s*→\s*/, '').trim() } : null;
  var nextOrig = pagerA[1] ? { href: pagerA[1].getAttribute('href'), text: pagerA[1].textContent.replace(/\s*←\s*$/, '').trim() } : null;
  var panel = document.createElement('div'); panel.className = 'donep';
  var here = document.createElement('nav'); here.className = 'here'; here.setAttribute('aria-label', 'מיקום במסלול');
  var navEl = document.createElement('div'); navEl.className = 'donep';
  main.parentNode.insertBefore(navEl, main.nextSibling);
  main.parentNode.insertBefore(here, navEl);
  main.parentNode.insertBefore(panel, here);
  function navHtml(nx, label) {
    return '<div class="nav">' + (prev ? '<a class="prev" href="' + prev.href + '">→ ' + prev.text + '</a>' : '<span></span>') +
      (nx ? '<a class="next" href="' + nx.href + '">' + (label || '') + nx.text + ' ←</a>' : '') + '</div>';
  }

  if (!page) {
    here.innerHTML = timeline(null, OTHER[key]);
    if (prev || nextOrig) navEl.innerHTML = navHtml(nextOrig, '');
    return;
  }

  // Which week is this visit about: the first week whose station here is not done yet.
  var sel = page.ids.filter(function (k) { return !st.done[k]; })[0] || page.ids[page.ids.length - 1];


  function next() {
    if (key === 'compass') return { href: 'orgs.html', text: 'פונים לארגונים' };
    if (key === 'orgs') return { href: 'people.html', text: 'יוצרים קשרים' };
    if (key === 'people') return { href: 'apply.html', text: 'הגישו למשרה אחת' };
    if (key === 'apply') return WEEK(sel) < 3 ? { href: 'orgs.html', text: 'שבוע ' + (WEEK(sel) + 1) + ' · פונים לארגונים' } : { href: 'review.html', text: 'שבוע 4 · עצירת ביניים' };
    return { href: 'finish.html', text: 'לסיום' };
  }

  function render() {
    var n = ORDER.indexOf(sel) + 1, w = WEEK(sel), on = !!st.done[sel], dc = countDone();
    document.body.style.setProperty('--stnum', '"שבוע ' + w + ' · תחנה ' + n + ' · "');
    here.innerHTML = timeline(sel, 'שבוע ' + w + ' · תחנה ' + n + ' מתוך 11 · ' + page.name);
    var weeks = page.ids.length > 1 ? '<div class="weeks"><span>התחנה הזו חוזרת בכל שבוע. סימון לפי שבוע:</span>' +
      page.ids.map(function (k) { return '<button type="button" class="wk" data-k="' + k + '" aria-pressed="' + (!!st.done[k]) + '">' + (st.done[k] ? '✓ ' : '') + 'שבוע ' + WEEK(k) + '</button>'; }).join('') + '</div>' : '';
    var nx = next();
    panel.innerHTML = '<section aria-labelledby="doneT"><h2 id="doneT">סיימת את התחנה?</h2>' +
      '<button type="button" class="main" aria-pressed="' + on + '">' + (on ? '✓ סומן כבוצע' + (page.ids.length > 1 ? ' – שבוע ' + w : '') + ' (לחיצה לביטול)' : 'סיימתי את התחנה' + (page.ids.length > 1 ? ' – שבוע ' + w : '')) + '</button>' +
      weeks + '<p role="status" aria-live="polite" style="margin:0;font-size:16px;color:#1E7A3C;min-height:1em"></p>' +
      '</section>';
    navEl.innerHTML = navHtml(nx, 'לתחנה הבאה: ');
    panel.querySelector('.main').onclick = function () { toggle(sel); };
    Array.prototype.forEach.call(panel.querySelectorAll('.wk'), function (b) { b.onclick = function () { sel = b.getAttribute('data-k'); toggle(sel); }; });
  }
  function toggle(k) {
    st = load(); st.done = st.done || {}; st.chk = st.chk || {};
    st.done[k] = !st.done[k];
    store(st); render();
    var msg = panel.querySelector('[role=status]');
    msg.textContent = st.done[k] ? 'מעולה! התחנה סומנה גם על המפה.' : 'הסימון בוטל.';
    var b = panel.querySelector(page.ids.length > 1 ? '.wk[data-k="' + k + '"]' : '.main'); if (b) b.focus();
  }
  render();
})();
