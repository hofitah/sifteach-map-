(function () {
  'use strict';
  var RED = '#C1272D', BUR = '#000000', SKY = '#FFFFFF', INK = '#000000', CREAM = '#FFFFFF';
  // Make an image pure black line-art on white (for printing): dark/colourful pixels -> black, light -> white.
  function toInk(img, invert) {
    var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    var g = c.getContext('2d'); g.drawImage(img, 0, 0);
    var d = g.getImageData(0, 0, c.width, c.height), p = d.data;
    for (var i = 0; i < p.length; i += 4) {
      var l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255, a = p[i + 3] / 255;
      var ink = invert ? Math.min(1, Math.max(0, (l - 0.35) / 0.55)) : Math.min(1, Math.max(0, (0.85 - l) / 0.6));
      var v = Math.round(255 * (1 - ink * a)); p[i] = p[i + 1] = p[i + 2] = v; p[i + 3] = 255;
    }
    g.putImageData(d, 0, 0); return c;
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function msg(text, ok) {
    var box = document.getElementById('compassMsg');
    var btn = document.getElementById('downloadCompass');
    if (!box && btn) {
      box = document.createElement('p');
      box.id = 'compassMsg';
      box.setAttribute('role', 'status');
      box.style.cssText = 'margin:0;font-size:22px;font-weight:700';
      btn.insertAdjacentElement('afterend', box);
    }
    if (box) { box.textContent = text; box.style.color = ok ? '#1D6E9E' : RED; }
  }
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = String(text || '—').split(/\s+/), line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = words[i]; }
      else line = t;
    }
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }
  function loadImg(src) {
    return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; });
  }
  async function build() {
    var st = (window.__page && window.__page.state) || {};
    var params = st.params || [], strengths = st.strengths || [];
    try { await document.fonts.load('800 40px Heebo'); await document.fonts.load('400 20px Heebo'); } catch (e) {}
    var logo = await loadImg('logo.png');
    var road = await loadImg('ill-road.png');
    var c = document.createElement('canvas'); c.width = 1240; c.height = 1754;
    var x = c.getContext('2d'); x.direction = 'rtl'; x.textAlign = 'right'; x.textBaseline = 'top';
    x.fillStyle = CREAM; x.fillRect(0, 0, 1240, 1754);
    x.fillStyle = '#000'; x.fillRect(0, 0, 1240, 10); x.fillRect(0, 1744, 1240, 10);
    if (logo) x.drawImage(toInk(logo, false), 80, 70, 280, 280 * logo.naturalHeight / logo.naturalWidth);
    if (road) x.drawImage(toInk(road, true), 80, 200, 200, 200);
    var R = 1160, W = 1060, y = 80;
    x.fillStyle = '#000'; x.font = '800 68px Heebo'; x.fillText('מצפן למשרה הבאה שלי', R, y); y += 90;
    var name = val('regName');
    x.fillStyle = BUR; x.font = '700 30px Heebo'; if (name) { x.fillText(name, R, y); y += 46; }
    x.fillStyle = '#000'; x.font = '400 26px Heebo';
    x.fillText('תלו במקום בולט — ואתרו משרות שמתכתבות עם מה שכתוב כאן', R, y); y = 440;
    function chips(title, arr, color) {
      x.fillStyle = BUR; x.font = '800 30px Heebo'; x.fillText(title, R, y); y += 50;
      var xx = R; x.font = '700 26px Heebo';
      (arr.length ? arr : ['—']).forEach(function (s) {
        var w = x.measureText(s).width + 44;
        if (R - xx + w > W) { xx = R; y += 62; }
        x.fillStyle = '#fff'; x.fillRect(xx - w, y, w, 50); x.strokeStyle = '#000'; x.lineWidth = 2; x.strokeRect(xx - w + 1, y + 1, w - 2, 48);
        x.fillStyle = '#000'; x.fillText(s, xx - 22, y + 11); xx -= w + 14;
      });
      y += 86;
    }
    function sec(title, v) {
      x.fillStyle = BUR; x.font = '800 30px Heebo'; x.fillText(title, R, y); y += 44;
      x.fillStyle = INK; x.font = '400 28px Heebo'; y = wrap(x, v || '—', R, y, W, 40); y += 20;
    }
    chips('מה חשוב לי במקום העבודה הבא', params, SKY);
    chips('החוזקות שאביא איתי', strengths, '#FFFFFF');
    sec('השכר (ברוטו): הנמוך ביותר / האידיאלי', (val('fMin') || '—') + '  /  ' + (val('fIdeal') || '—'));
    sec('מה יכול לפצות אותי על שכר נמוך יחסית', val('fComp'));
    sec('דבר אחד שאני לא רוצה לוותר עליו', val('fKeep'));
    sec('תפקיד / תחום שהייתי רוצה להימנע ממנו', val('fAvoid'));
    sec('תפקיד שנתקע לי בראש ושווה לבדוק', val('fStuck'));
    sec('2-3 תפקידים אפשריים עבורי', val('fRoles'));
    x.fillStyle = BUR; x.font = '700 24px Heebo';
    x.fillText('סיפתח · וואטסאפ 02-5468647 · siftach@jerusalem.muni.il', R, 1680);
    return c;
  }
  document.addEventListener('click', async function (e) {
    if (!e.target.closest('#downloadCompass')) return;
    var name = val('regName'), email = val('regEmail'), phone = val('regPhone').replace(/[\s-]/g, '');
    if (!name) { msg('נא למלא שם מלא'); document.getElementById('regName').focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg('נא למלא כתובת מייל תקינה'); document.getElementById('regEmail').focus(); return; }
    if (!/^0\d{8,9}$/.test(phone)) { msg('נא למלא מספר טלפון תקין'); document.getElementById('regPhone').focus(); return; }
    if (!window.jspdf) { msg('רגע, הקובץ עוד נטען… נסו שוב בעוד שנייה'); return; }
    msg('מכינים את המצפן שלך…', true);
    var canvas = await build();
    var pdf = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 595.28, 841.89);
    pdf.save('מצפן למשרה הבאה שלי.pdf');
    msg('המצפן הורד! מדפיסים, תולים, ויוצאים לדרך.', true);
  });
})();
