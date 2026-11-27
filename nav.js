window.NavComponent=(function(){

class Component extends DCLogic {
constructor(props) { super(props); this.state = { open: props.initialOpen || null, mini: false }; }
tog(g, i) { const o = Object.assign({}, this.state[g] || {}); o[i] = !o[i]; this.setState({ [g]: o }); }
list(g, items) { const s = this.state[g] || {}; return items.map((t, i) => ({ t: t, id: g + i, on: !!s[i], toggle: () => this.tog(g, i) })); }
renderVals() {
const cur = this.props.current || 'map';
const T = [{"k": "map", "label": "המפה", "href": "index.html"}, {"k": "checklist", "label": "הצ'ק ליסט השבועי", "href": "checklist.html"}, {"k": "w1", "label": "שבוע 1", "items": [["1", "הגדירו כיוון", "compass.html", "compass"], ["2", "פונים לארגונים", "orgs.html", "orgs"], ["3", "יוצרים קשרים", "people.html", "people"], ["4", "הגישו למשרה אחת", "apply.html", "apply"]]}, {"k": "w2", "label": "שבוע 2", "items": [["1", "פונים לארגונים", "orgs.html", "orgs"], ["2", "יוצרים קשרים", "people.html", "people"], ["3", "הגישו למשרה אחת", "apply.html", "apply"]]}, {"k": "w3", "label": "שבוע 3", "items": [["1", "פונים לארגונים", "orgs.html", "orgs"], ["2", "יוצרים קשרים", "people.html", "people"], ["3", "הגישו למשרה אחת", "apply.html", "apply"]]}, {"k": "review", "label": "שבוע 4 · עצירת ביניים", "href": "review.html"}, {"k": "finish", "label": "לסיום", "href": "finish.html"}];
const open = this.state.open;
const tabs = T.map((t) => {
  const items = t.items || null;
  const active = items ? items.some((i) => i[3] === cur) : t.k === cur;
  const bg = active ? '#A8DDF5' : 'transparent'; const fg = active ? '#5A1420' : '#24211F';
  return { label: t.label, href: t.href || '', isLink: !items, isMenu: !!items, open: open === t.k, expanded: open === t.k ? 'true' : 'false', bg: bg, fg: fg,
    toggle: () => this.setState({ open: this.state.open === t.k ? null : t.k }),
    items: (items || []).map((i) => ({ n: i[0], label: i[1], href: i[2] })) };
});
return { tabs: tabs, miniOpen: this.state.mini, miniExpanded: this.state.mini ? "true" : "false", toggleMini: () => this.setState({ mini: !this.state.mini }) };
}
}

return Component;})();
