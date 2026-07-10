// gloss.js — Hace tocables las palabras del glosario dentro de cualquier elemento.
// Depende de GLOSARIO (glosario.js). Uso: Gloss.glossify(elemento).
// Inyecta sus propios estilos y su ventanita de explicación, así funciona
// igual en la app (index.html) y en el manual (curso.html).
(function () {
  const WORD = /[0-9A-Za-zÀ-ÿ]/;          // ¿es letra/número? (para no cortar palabras)
  let MAP = null, RX = null, POP = null, BACK = null;

  function build() {
    MAP = {};
    const keys = [];
    (window.GLOSARIO || []).forEach(e => e.keys.forEach(k => { MAP[k.toLowerCase()] = e; keys.push(k); }));
    keys.sort((a, b) => b.length - a.length);                 // primero los términos más largos
    const esc = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    RX = new RegExp('(' + esc.join('|') + ')', 'gi');
  }

  function injectStyles() {
    const css = `
      .gloss{color:#1b5e20;border-bottom:1.5px dotted #2e7d32;cursor:pointer;font-weight:600}
      .gloss:active{background:#eef4ef}
      .gloss-back{position:fixed;inset:0;background:rgba(31,42,36,.45);opacity:0;pointer-events:none;transition:opacity .15s;z-index:60}
      .gloss-back.open{opacity:1;pointer-events:auto}
      .gloss-pop{position:fixed;left:50%;bottom:0;transform:translate(-50%,110%);width:100%;max-width:520px;
        background:#fff;border-radius:20px 20px 0 0;padding:22px 20px calc(24px + env(safe-area-inset-bottom));
        box-shadow:0 -8px 28px rgba(0,0,0,.22);z-index:61;transition:transform .22s ease}
      .gloss-pop.open{transform:translate(-50%,0)}
      .gloss-pop .gp-t{font-weight:800;font-size:18px;color:#1b5e20;margin-bottom:8px}
      .gloss-pop .gp-d{font-size:15.5px;line-height:1.55;color:#233029}
      .gloss-pop .gp-x{margin-top:18px;width:100%;padding:13px;border:none;border-radius:12px;
        background:#2e7d32;color:#fff;font-size:16px;font-weight:700;cursor:pointer}
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  function ensurePopover() {
    BACK = document.createElement('div'); BACK.className = 'gloss-back';
    POP = document.createElement('div'); POP.className = 'gloss-pop';
    POP.innerHTML = '<div class="gp-t"></div><div class="gp-d"></div><button class="gp-x">Entendido</button>';
    document.body.appendChild(BACK); document.body.appendChild(POP);
    const hide = () => { BACK.classList.remove('open'); POP.classList.remove('open'); };
    BACK.onclick = hide; POP.querySelector('.gp-x').onclick = hide;
  }

  function show(entry) {
    POP.querySelector('.gp-t').textContent = entry.t;
    POP.querySelector('.gp-d').textContent = entry.d;
    BACK.classList.add('open'); POP.classList.add('open');
  }

  function processNode(node, seen) {
    const text = node.nodeValue; RX.lastIndex = 0;
    let m, last = 0, frag = null;
    while ((m = RX.exec(text))) {
      const i = m.index, j = i + m[0].length;
      const before = i > 0 ? text[i - 1] : '';
      const after = j < text.length ? text[j] : '';
      if (WORD.test(before) || WORD.test(after)) continue;    // está dentro de otra palabra → ignorar
      const entry = MAP[m[0].toLowerCase()];
      if (!entry || seen.has(entry)) continue;                // solo la 1ª vez que aparece cada término
      seen.add(entry);
      frag = frag || document.createDocumentFragment();
      if (i > last) frag.appendChild(document.createTextNode(text.slice(last, i)));
      const span = document.createElement('span');
      span.className = 'gloss'; span.textContent = m[0];
      span.addEventListener('click', e => { e.stopPropagation(); show(entry); });
      frag.appendChild(span);
      last = j;
    }
    if (frag) {
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    }
  }

  function glossify(root) {
    if (!root) return;
    if (!RX) { build(); injectStyles(); ensurePopover(); }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest('.gloss,a,code,pre,button,.cat-pill,.gp-t,.gp-d')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    const seen = new Set();
    nodes.forEach(n => processNode(n, seen));
  }

  window.Gloss = { glossify };
})();
