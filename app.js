// app.js — Lógica del Cuaderno de Siembra.
// Sin frameworks, sin login. Los datos viven en localStorage (este dispositivo).

const KEY = 'cds.siembras.v1';
const $ = (s, r = document) => r.querySelector(s);

// ---------- Utilidades de fecha (solo día, sin horas) ----------
function hoy(){ const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function parseFecha(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function addDias(fecha, n){ const d = new Date(fecha); d.setDate(d.getDate()+n); return d; }
function diffDias(a, b){ return Math.round((a - b) / 86400000); } // a - b en días
function fmtFecha(d){ return d.toLocaleDateString('es', {day:'numeric', month:'short', year:'numeric'}); }
function fmtFechaCorta(d){ return d.toLocaleDateString('es', {day:'numeric', month:'short'}); }

// ---------- Dosis: escala gramos/planta al total de plantas ----------
function fmtCantidad(g){
  if (g >= 1000) return (g/1000).toFixed(g >= 10000 ? 0 : 1) + ' kg';
  return Math.round(g) + ' g';
}
function textoDosis(dose, nPlantas){
  return dose.map(d => `<b>${fmtCantidad(d.gPlanta * nPlantas)}</b> de ${d.producto}`).join(' + ')
    + ` <span class="muted">(${dose.map(d=>d.gPlanta+' g/planta').join(', ')} × ${nPlantas})</span>`;
}

// ---------- Estado ----------
function cargar(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function guardar(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }
function crop(id){ return CROPS.find(c => c.id === id); }

let siembras = cargar();
let vista = { modo: 'home', siembraId: null }; // 'home' | 'detalle'

// ---------- Generar tareas de una siembra con fechas y estado ----------
function tareasDe(siembra){
  const c = crop(siembra.cropId);
  const base = parseFecha(siembra.fecha);
  const t0 = hoy();
  return c.tareas.map(t => {
    const fecha = addDias(base, t.day);
    const hecha = !!(siembra.hechas && siembra.hechas[t.id]);
    const dd = diffDias(fecha, t0); // días hasta la tarea (negativo = pasó)
    let estado;
    if (hecha) estado = 'hecha';
    else if (dd < 0) estado = 'vencida';
    else if (dd === 0) estado = 'hoy';
    else estado = 'proxima';
    return { ...t, fecha, hecha, dd, estado, cat: t.cat };
  });
}

function toggleTarea(siembraId, taskId){
  const s = siembras.find(x => x.id === siembraId);
  if (!s) return;
  s.hechas = s.hechas || {};
  if (s.hechas[taskId]) delete s.hechas[taskId]; else s.hechas[taskId] = true;
  guardar(siembras);
  render();
}

// ---------- Render ----------
function render(){
  const bar = $('#topbar');
  if (vista.modo === 'detalle'){ bar.classList.add('detail'); } else { bar.classList.remove('detail'); }
  $('#app').innerHTML = vista.modo === 'detalle' ? renderDetalle() : renderHome();
  cablear();
}

function cuandoTexto(t){
  if (t.estado === 'hoy') return '<span class="when" style="color:#1b5e20">Hoy</span>';
  if (t.estado === 'vencida') return `<span class="when" style="color:#b3261e">Hace ${-t.dd} día${-t.dd===1?'':'s'}</span>`;
  if (t.estado === 'proxima') return `<span class="when muted">En ${t.dd} día${t.dd===1?'':'s'} · ${fmtFechaCorta(t.fecha)}</span>`;
  return '';
}

function renderHome(){
  if (siembras.length === 0){
    return `<div class="wrap"><div class="empty">
      <div class="big">🌱</div>
      <h2>Tu cuaderno está vacío</h2>
      <p class="muted">Registra tu primera siembra y te aviso qué hacer cada día:<br>cuándo fertilizar, cuánto, cuándo regar menos y cuándo cosechar.</p>
    </div></div>`;
  }

  // Pendientes = tareas vencidas + de hoy, de todas las siembras.
  const pend = [];
  siembras.forEach(s => {
    tareasDe(s).forEach(t => {
      if (t.estado === 'vencida' || t.estado === 'hoy')
        pend.push({ s, t });
    });
  });
  pend.sort((a,b) => a.t.fecha - b.t.fecha);

  let html = '<div class="wrap">';

  if (pend.length){
    html += `<div class="section-title">⏰ Pendientes (${pend.length})</div>`;
    pend.forEach(({s,t}) => {
      const cat = CATS[t.cat];
      html += `<div class="pend ${t.estado==='vencida'?'overdue':''}">
        <div class="ic">${cat.icon}</div>
        <div class="body">
          <div class="t">${t.titulo}</div>
          <div class="d">${t.detalle}</div>
          ${t.dose ? `<div class="d" style="margin-top:4px">💊 ${textoDosis(t.dose, s.nPlantas)}</div>` : ''}
          <div class="from">${crop(s.cropId).emoji} ${s.nombre} · ${cuandoTexto(t).replace(/<[^>]+>/g,'')}</div>
        </div>
        <button class="chk" data-toggle="${s.id}|${t.id}" aria-label="Marcar hecha">○</button>
      </div>`;
    });
  } else {
    html += `<div class="section-title">Todo al día ✅</div>
      <p class="muted" style="margin:0 4px">No hay tareas pendientes hoy. Buen trabajo.</p>`;
  }

  html += `<div class="section-title">🌾 Mis siembras</div>`;
  siembras.slice().reverse().forEach(s => {
    const c = crop(s.cropId);
    const ts = tareasDe(s);
    const nPend = ts.filter(t => t.estado === 'vencida' || t.estado === 'hoy').length;
    const edad = diffDias(hoy(), parseFecha(s.fecha));
    const sub = edad < 0 ? `Siembra el ${fmtFechaCorta(parseFecha(s.fecha))}` : `Día ${edad} · ${s.nPlantas} plantas`;
    html += `<div class="siembra-card" data-open="${s.id}">
      <div class="emoji">${c.emoji}</div>
      <div class="info">
        <h3>${s.nombre}</h3>
        <div class="sub">${sub}${s.variedad ? ' · '+s.variedad : ''}</div>
      </div>
      ${nPend ? `<div class="badge alert">${nPend} pendiente${nPend===1?'':'s'}</div>` : `<div class="badge">al día</div>`}
    </div>`;
  });

  html += '</div>';
  return html;
}

function renderDetalle(){
  const s = siembras.find(x => x.id === vista.siembraId);
  if (!s){ vista = {modo:'home'}; return renderHome(); }
  const c = crop(s.cropId);
  const ts = tareasDe(s);
  const edad = diffDias(hoy(), parseFecha(s.fecha));

  const grupos = [
    { k:'vencida', clase:'vencidas', label:'⚠️ Vencidas' },
    { k:'hoy',     clase:'hoy',      label:'⏰ Hoy' },
    { k:'proxima', clase:'proximas', label:'🔜 Próximas' },
    { k:'hecha',   clase:'hechas',   label:'✅ Hechas' },
  ];

  let html = `<div class="wrap">
    <div class="siembra-card" style="cursor:default">
      <div class="emoji">${c.emoji}</div>
      <div class="info">
        <h3>${s.nombre}${s.variedad ? ' · '+s.variedad : ''}</h3>
        <div class="sub">Sembrado el ${fmtFecha(parseFecha(s.fecha))} · ${s.nPlantas} plantas${edad>=0?` · día ${edad}`:''}</div>
      </div>
    </div>
    ${s.notas ? `<p class="muted" style="margin:4px">📝 ${s.notas}</p>` : ''}`;

  grupos.forEach(g => {
    const items = ts.filter(t => t.estado === g.k);
    if (!items.length) return;
    html += `<div class="tl-group ${g.clase}"><div class="gh">${g.label} (${items.length})</div>`;
    items.forEach(t => {
      const cat = CATS[t.cat];
      html += `<div class="task ${t.hecha?'done':''}">
        <div class="ic">${cat.icon}</div>
        <div class="body">
          <div class="row1">
            <span class="cat-pill" style="background:${cat.color}">${cat.label}</span>
            <span class="t">${t.titulo}</span>
          </div>
          <div class="row1" style="margin-top:3px">
            <span class="day">Día ${t.day} · ${fmtFechaCorta(t.fecha)}</span>
            ${!t.hecha ? cuandoTexto(t) : ''}
          </div>
          <div class="d">${t.detalle}</div>
          ${t.dose ? `<div class="dose">💊 Dosis: ${textoDosis(t.dose, s.nPlantas)}</div>` : ''}
        </div>
        <button class="chk" data-toggle="${s.id}|${t.id}">${t.hecha ? '✓' : '○'}</button>
      </div>`;
    });
    html += '</div>';
  });

  html += `<div style="margin-top:24px"><button class="btn danger" data-del="${s.id}" style="width:100%">🗑️ Eliminar esta siembra</button></div>`;
  html += '</div>';
  return html;
}

// ---------- Eventos ----------
function cablear(){
  document.querySelectorAll('[data-toggle]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    const [sid, tid] = b.dataset.toggle.split('|');
    toggleTarea(sid, tid);
  });
  document.querySelectorAll('[data-open]').forEach(el => el.onclick = () => {
    vista = { modo:'detalle', siembraId: el.dataset.open }; render();
  });
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (confirm('¿Eliminar esta siembra y todo su seguimiento?')){
      siembras = siembras.filter(s => s.id !== b.dataset.del);
      guardar(siembras);
      vista = { modo:'home' }; render();
    }
  });
}

$('#back').onclick = () => { vista = { modo:'home' }; render(); };

// ---------- Formulario nueva siembra ----------
function llenarCultivos(){
  const sel = $('#f-cultivo');
  sel.innerHTML = CROPS.map(c => `<option value="${c.id}">${c.emoji} ${c.nombre}</option>`).join('');
}
function abrirForm(){
  $('#f-fecha').value = new Date().toISOString().slice(0,10);
  $('#f-plantas').value = '';
  $('#f-variedad').value = '';
  $('#f-notas').value = '';
  $('#overlay').classList.add('open');
}
function cerrarForm(){ $('#overlay').classList.remove('open'); }

$('#fab').onclick = abrirForm;
$('#f-cancelar').onclick = cerrarForm;
$('#overlay').onclick = e => { if (e.target.id === 'overlay') cerrarForm(); };

$('#f-guardar').onclick = () => {
  const cropId = $('#f-cultivo').value;
  const fecha = $('#f-fecha').value;
  const nPlantas = parseInt($('#f-plantas').value, 10);
  if (!fecha){ alert('Pon la fecha de siembra.'); return; }
  if (!nPlantas || nPlantas < 1){ alert('¿Cuántas plantas/golpes sembraste?'); return; }
  const c = crop(cropId);
  siembras.push({
    id: 's' + Date.now(),
    cropId,
    nombre: c.nombre,
    variedad: $('#f-variedad').value.trim(),
    fecha,
    nPlantas,
    notas: $('#f-notas').value.trim(),
    hechas: {},
  });
  guardar(siembras);
  cerrarForm();
  vista = { modo:'home' };
  render();
};

// ---------- Arranque ----------
llenarCultivos();
render();

// PWA: registrar service worker (ruta relativa para que funcione en Netlify)
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
