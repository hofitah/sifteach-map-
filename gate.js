/* Entry registration gate: name, email, phone. Shown once per browser; sends to a Google Sheet. */
(function () {
  'use strict';
  var KEY = 'sifteach:registered';
  if (/(accessibility|privacy)\.html$/.test(location.pathname)) return; // statement stays open to all
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }

  var css = '' +
    '#gate{position:fixed;inset:0;z-index:1000;background:rgba(122,28,43,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Heebo,Arial,sans-serif;overflow:auto}' +
    '#gate .card{background:#FBF3E0;border-top:10px solid #C1272D;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.25);width:100%;max-width:520px;padding:30px 30px 26px;box-sizing:border-box;direction:rtl;color:#24211F}' +
    '#gate img{height:56px;display:block;margin-bottom:14px}' +
    '#gate h2{margin:0 0 6px;font-size:32px;font-weight:800;color:#C1272D;line-height:1.15}' +
    '#gate p{margin:0 0 18px;font-size:18px;line-height:1.5}' +
    '#gate label{display:block;font-size:17px;font-weight:700;margin:12px 0 6px}' +
    '#gate input{width:100%;box-sizing:border-box;min-height:50px;padding:8px 14px;border:2px solid #E6D9BE;border-radius:10px;font:inherit;font-size:18px;background:#fff}' +
    '#gate input:focus{outline:none;border-color:#1D6E9E}' +
    '#gate button{margin-top:22px;width:100%;min-height:54px;border:0;border-radius:12px;background:#C1272D;color:#fff;font:inherit;font-size:21px;font-weight:700;cursor:pointer}' +
    '#gate button:hover{background:#A51F25}#gate button[disabled]{opacity:.6;cursor:default}' +
    '#gate label.chk{display:flex;gap:10px;align-items:flex-start;font-weight:400;font-size:16px;margin:16px 0 0;cursor:pointer}#gate label.chk input{width:22px;height:22px;min-height:0;margin:2px 0 0;flex:none;accent-color:#C1272D}' +
    '#gate .err{color:#C1272D;font-size:15px;min-height:20px;margin-top:8px}' +
    '#gate .note{font-size:13px;color:#5b5550;margin:10px 0 0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var g = document.createElement('div');
  g.id = 'gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); g.setAttribute('aria-labelledby', 'gateT');
  g.innerHTML =
    '<form class="card" novalidate>' +
    '<img src="logo.png" alt="סיפתח – מחברים אותך לקריירה בירושלים">' +
    '<h2 id="gateT">ברוכים הבאים למפת הדרכים של מחפש העבודה המתחיל</h2>' +
    '<p>רגע לפני שיוצאים לדרך – נשמח להכיר אותך.</p>' +
    '<label for="gName">שם מלא</label><input id="gName" autocomplete="name" required aria-required="true">' +
    '<label for="gEmail">מייל</label><input id="gEmail" type="email" autocomplete="email" dir="ltr" required aria-required="true">' +
    '<label for="gPhone">טלפון</label><input id="gPhone" type="tel" autocomplete="tel" dir="ltr" required aria-required="true">' +
    '<label class="chk"><input id="gMail" type="checkbox"> <span>אני מאשר/ת קבלת דיוור ועדכונים מאת מרכז סיפתח</span></label>' +
    '<div class="err" role="alert" aria-live="assertive"></div>' +
    '<button type="submit">כניסה למפה ←</button>' +
    '<p class="note">הפרטים נשמרים אצל מרכז סיפתח ומשמשים ליצירת קשר בנוגע לליווי בחיפוש עבודה. ההתקדמות שלך במפה נשמרת במכשיר הזה בלבד. <a href="privacy.html" target="_blank" rel="noopener">למדיניות הפרטיות</a></p>' +
    '</form>';
  document.body.appendChild(g);
  var others = Array.prototype.filter.call(document.body.children, function (el) { return el !== g && el.tagName !== 'SCRIPT' && el.tagName !== 'TEMPLATE'; });
  others.forEach(function (el) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); });
  document.documentElement.style.overflow = 'hidden';
  var f = g.querySelector('form'), err = g.querySelector('.err'), btn = g.querySelector('button');
  setTimeout(function () { g.querySelector('#gName').focus(); }, 50);

  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var mail = f.gMail.checked ? 'כן' : 'לא';
    var name = f.gName.value.trim(), email = f.gEmail.value.trim(), phone = f.gPhone.value.trim();
    [f.gName,f.gEmail,f.gPhone].forEach(function(x){x.removeAttribute('aria-invalid');});
    if (name.length < 2) { f.gName.setAttribute('aria-invalid','true'); err.textContent = 'נא למלא שם'; f.gName.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { f.gEmail.setAttribute('aria-invalid','true'); err.textContent = 'נא למלא כתובת מייל תקינה'; f.gEmail.focus(); return; }
    if (phone.replace(/\D/g, '').length < 9) { f.gPhone.setAttribute('aria-invalid','true'); err.textContent = 'נא למלא מספר טלפון תקין'; f.gPhone.focus(); return; }
    err.textContent = ''; btn.disabled = true; btn.textContent = 'רגע...';
    var done = function () {
      try {
        localStorage.setItem(KEY, JSON.stringify({ name: name, email: email, phone: phone, mailing: mail, at: Date.now() }));
        // prefill the compass registration form
        var k = 'sifteach:fields:compass', s = JSON.parse(localStorage.getItem(k) || '{}');
        if (!s.regName) s.regName = name; if (!s.regEmail) s.regEmail = email; if (!s.regPhone) s.regPhone = phone;
        localStorage.setItem(k, JSON.stringify(s));
      } catch (e) {}
      document.documentElement.style.overflow = '';
      others.forEach(function (el) { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); });
      g.remove();
    };
    var url = window.SIFTEACH_SHEET_URL;
    if (!url) { done(); return; }
    var body = new URLSearchParams({ name: name, email: email, phone: phone, mailing: mail, page: location.pathname });
    var t = setTimeout(done, 6000);
    fetch(url, { method: 'POST', mode: 'no-cors', body: body }).then(function () { clearTimeout(t); done(); }, function () { clearTimeout(t); done(); });
  });
})();
