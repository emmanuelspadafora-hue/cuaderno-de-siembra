// build-curso.js — Genera curso.html con el manual YA incrustado (sin fetch en el navegador).
// Uso: node scripts/build-curso.js   (córrelo cada vez que edites docs/curso-zapallo.md)
// Motivo: en algunos teléfonos el fetch del .md se quedaba "cargando"; incrustado abre siempre.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const marked = require(path.join(root, 'vendor', 'marked.min.js'));

const md = fs.readFileSync(path.join(root, 'docs', 'curso-zapallo.md'), 'utf8');
marked.setOptions({ gfm: true, breaks: false });
const cuerpo = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Manual del cultivo · Cuaderno de Siembra</title>
  <meta name="theme-color" content="#2e7d32">
  <link rel="manifest" href="./manifest.webmanifest">
  <style>
    :root{--paper:#f5f3ec;--card:#fff;--ink:#1f2a24;--soft:#6b7a71;--line:#e4e0d4;--green:#2e7d32;--green-d:#1b5e20}
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{margin:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--paper);color:var(--ink);line-height:1.6;-webkit-text-size-adjust:100%}
    .topbar{position:sticky;top:0;z-index:20;background:var(--green);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 10px rgba(31,42,36,.12)}
    .topbar a.back{background:rgba(255,255,255,.18);border:none;color:#fff;font-size:16px;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;text-decoration:none}
    .topbar h1{font-size:17px;font-weight:700;margin:0}
    .doc{max-width:680px;margin:0 auto;padding:18px 16px 80px}
    .doc h1{font-size:26px;line-height:1.25;color:var(--green-d);margin:26px 0 10px}
    .doc h1:first-child{margin-top:8px}
    .doc h2{font-size:21px;color:var(--green-d);margin:30px 0 8px;padding-top:14px;border-top:2px solid var(--line)}
    .doc h3{font-size:17px;margin:20px 0 6px}
    .doc p{margin:10px 0}
    .doc ul,.doc ol{padding-left:22px;margin:10px 0}
    .doc li{margin:4px 0}
    .doc blockquote{margin:14px 0;padding:10px 14px;background:#eef4ef;border-left:4px solid var(--green);border-radius:8px;color:#2c3a32}
    .doc blockquote p{margin:4px 0}
    .doc code{background:#efeee6;padding:2px 6px;border-radius:6px;font-size:.9em}
    .doc pre{background:#1f2a24;color:#e8efe8;padding:14px;border-radius:12px;overflow:auto;font-size:13px;line-height:1.5}
    .doc pre code{background:none;padding:0;color:inherit}
    .doc hr{border:none;border-top:2px solid var(--line);margin:26px 0}
    .doc a{color:var(--green-d)}
    .doc strong{color:#243029}
    .tablewrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:14px 0;border:1px solid var(--line);border-radius:12px}
    .doc table{border-collapse:collapse;width:100%;min-width:440px;background:var(--card);font-size:14px}
    .doc th,.doc td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
    .doc th{background:#eef4ef;color:var(--green-d);font-weight:700;white-space:nowrap}
    .doc tr:last-child td{border-bottom:none}
    .toc{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 16px;margin:8px 0 20px}
    .toc .toc-t{font-weight:700;color:var(--green-d);margin:6px 0}
    .toc a{display:block;padding:5px 0;color:var(--ink);text-decoration:none;border-bottom:1px solid #f0ede2;font-size:15px}
    .toc a:last-child{border-bottom:none}
  </style>
</head>
<body>
  <div class="topbar">
    <a class="back" href="./index.html">←</a>
    <h1>📖 Manual del cultivo</h1>
  </div>
  <div class="doc" id="doc">
${cuerpo}
  </div>

  <script src="./glosario.js?v=6"></script>
  <script src="./gloss.js?v=6"></script>
  <script>
    // El manual ya está escrito arriba. Esto solo lo mejora; si algo falla, la lectura no se rompe.
    (function () {
      var el = document.getElementById('doc');
      try {
        // Tablas con scroll horizontal en pantallas chicas
        el.querySelectorAll('table').forEach(function (t) {
          var w = document.createElement('div'); w.className = 'tablewrap';
          t.parentNode.insertBefore(w, t); w.appendChild(t);
        });
        // Índice (tabla de contenidos) con los módulos
        var h1s = [].slice.call(el.querySelectorAll('h1'));
        if (h1s.length > 3) {
          var toc = document.createElement('nav'); toc.className = 'toc';
          toc.innerHTML = '<div class="toc-t">Contenido</div>';
          h1s.forEach(function (h, i) {
            var id = 'sec' + i; h.id = id;
            var a = document.createElement('a'); a.href = '#' + id;
            a.textContent = h.textContent; toc.appendChild(a);
          });
          el.insertBefore(toc, h1s[0]);
        }
        // Palabras tocables del glosario
        if (window.Gloss) window.Gloss.glossify(el);
      } catch (e) { /* mejoras opcionales: nunca deben impedir leer el manual */ }
    })();
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js').catch(function () {}); }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'curso.html'), html);
console.log('curso.html generado (' + html.length + ' bytes, manual incrustado).');
