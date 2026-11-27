/* dc-lite: a tiny runtime that renders the Design-canvas pages as a real website.
   Supports {{holes}}, <sc-for>, <sc-if>, event attributes, state, and localStorage persistence. */
(function () {
  'use strict';
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const p = typeof patch === 'function' ? patch(this.state) : patch;
      this.state = Object.assign({}, this.state, p);
      if (this.__rerender) this.__rerender();
    }
    forceUpdate() { if (this.__rerender) this.__rerender(); }
  }
  window.DCLogic = DCLogic;

  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  const PAGES = window.SITE_PAGES || {};

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
  }
  function interp(str, scope) {
    return str.replace(HOLE, (m, p) => { const v = lookup(scope, p); return v == null ? '' : String(v); });
  }
  function fixHref(v) {
    const m = /^\/?([A-Za-z]+)\.dc\.html(#.*)?$/.exec(v || '');
    if (m && PAGES[m[1]]) return PAGES[m[1]] + (m[2] || '');
    return v;
  }
  function dispatch(e) {
    const h = e.currentTarget.__h && e.currentTarget.__h[e.type];
    if (h) h(e);
  }
  function setHandler(el, type, fn) {
    el.__h = el.__h || {};
    el.__lt = el.__lt || new Set();
    el.__h[type] = fn;
    if (!el.__lt.has(type)) { el.addEventListener(type, dispatch); el.__lt.add(type); }
  }

  function renderNodes(nodes, scope, parent) { for (const n of nodes) renderNode(n, scope, parent); }
  function renderNode(n, scope, parent) {
    if (n.nodeType === 3) { parent.appendChild(document.createTextNode(interp(n.nodeValue, scope))); return; }
    if (n.nodeType !== 1) return;
    const tag = n.localName;
    if (tag === 'sc-for') {
      const m = WHOLE.exec(n.getAttribute('list') || '');
      const list = (m ? lookup(scope, m[1]) : null) || [];
      const as = n.getAttribute('as') || 'item';
      list.forEach((it, i) => {
        const s = Object.create(scope); s[as] = it; s.$index = i;
        renderNodes(n.childNodes, s, parent);
      });
      return;
    }
    if (tag === 'sc-if') {
      const m = WHOLE.exec(n.getAttribute('value') || '');
      if (m && lookup(scope, m[1])) renderNodes(n.childNodes, scope, parent);
      return;
    }
    const el = n.namespaceURI && n.namespaceURI !== 'http://www.w3.org/1999/xhtml'
      ? document.createElementNS(n.namespaceURI, n.tagName)
      : document.createElement(tag);
    for (const a of Array.from(n.attributes)) {
      const name = a.name;
      if (name.startsWith('hint-')) continue;
      const whole = WHOLE.exec(a.value);
      if (name.startsWith('on') && whole) {
        const fn = lookup(scope, whole[1]);
        if (typeof fn === 'function') setHandler(el, name.slice(2).toLowerCase(), fn);
        continue;
      }
      if ((name === 'checked' || name === 'value') && whole) {
        const v = lookup(scope, whole[1]);
        el.__props = el.__props || {};
        el.__props[name] = v;
        if (name === 'value') el.setAttribute('value', v == null ? '' : String(v));
        else if (v) el.setAttribute('checked', '');
        continue;
      }
      let v;
      if (whole) {
        const raw = lookup(scope, whole[1]);
        if (raw === false || raw == null) continue;
        v = String(raw);
      } else {
        v = interp(a.value, scope);
      }
      if (name === 'href') v = fixHref(v);
      el.setAttribute(name, v);
    }
    renderNodes(n.childNodes, scope, el);
    applyProps(el);
    parent.appendChild(el);
  }
  function applyProps(el) {
    if (!el.__props) return;
    if ('checked' in el.__props) el.checked = !!el.__props.checked;
    if ('value' in el.__props) {
      const v = el.__props.value == null ? '' : String(el.__props.value);
      if (el.value !== v) el.value = v;
    }
  }

  // Patch the live DOM to match a freshly rendered tree (keeps focus, typing, slider drags).
  function morph(oldP, newP) {
    const oc = Array.from(oldP.childNodes), nc = Array.from(newP.childNodes);
    const len = Math.max(oc.length, nc.length);
    for (let i = 0; i < len; i++) {
      const o = oc[i], n = nc[i];
      if (!n) { oldP.removeChild(o); continue; }
      if (!o) { oldP.appendChild(n); continue; }
      if (o.nodeType !== n.nodeType || (o.nodeType === 1 && o.tagName !== n.tagName)) {
        oldP.replaceChild(n, o); continue;
      }
      if (o.nodeType === 3) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; continue; }
      if (o.nodeType !== 1) continue;
      for (const a of Array.from(o.attributes)) if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
      for (const a of Array.from(n.attributes)) if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
      if (n.__h) for (const t in n.__h) setHandler(o, t, n.__h[t]);
      else if (o.__h) o.__h = {};
      o.__props = n.__props;
      applyProps(o);
      morph(o, n);
    }
  }

  function save(key, inst) {
    try {
      const data = {};
      for (const k in inst.state) if (typeof inst.state[k] !== 'function') data[k] = inst.state[k];
      localStorage.setItem('sifteach:' + key, JSON.stringify(data));
    } catch (e) {}
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem('sifteach:' + key) || 'null'); } catch (e) { return null; }
  }

  // Free-text fields (no binding) are remembered per page by id.
  function wireFields(key, root) {
    let store = {};
    try { store = JSON.parse(localStorage.getItem('sifteach:fields:' + key) || '{}'); } catch (e) {}
    root.querySelectorAll('input[id]:not([type=checkbox]):not([type=range]), textarea[id]').forEach((f) => {
      if (f.__props && 'value' in f.__props) return;
      if (store[f.id] != null && !f.value) f.value = store[f.id];
      if (!f.__wired) {
        f.__wired = true;
        f.addEventListener('input', () => {
          store[f.id] = f.value;
          try { localStorage.setItem('sifteach:fields:' + key, JSON.stringify(store)); } catch (e) {}
        });
      }
    });
  }

  window.mountDC = function (opts) {
    const tpl = document.getElementById(opts.template);
    const root = opts.root;
    const inst = new opts.cls(opts.props || {});
    if (opts.persist) {
      const saved = load(opts.persist);
      if (saved) inst.state = Object.assign({}, inst.state, saved);
    }
    let first = true;
    inst.__rerender = () => {
      const vals = inst.renderVals();
      const frag = document.createElement('div');
      renderNodes(tpl.content.childNodes, vals, frag);
      if (first) { root.replaceChildren(...frag.childNodes); first = false; }
      else morph(root, frag);
      if (opts.persist) { save(opts.persist, inst); wireFields(opts.persist, root); }
      if (opts.after) opts.after(root, inst);
    };
    inst.__rerender();
    if (inst.componentDidMount) inst.componentDidMount();
    return inst;
  };
})();
