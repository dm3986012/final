/* ===== Configuración: edita aquí los nombres de las unidades ===== */
const UNITS = [
  { name: 'Modelado de datos',        weeks: [1, 2, 3, 4] },
  { name: 'Azure SQL y arquitectura', weeks: [5, 6, 7, 8] },
  { name: 'Consultas avanzadas',      weeks: [9, 10, 11, 12] },
  { name: 'Optimización y cierre',    weeks: [13, 14, 15, 16] }
];
const ACTIVITIES = ['Actividad 1', 'Actividad 2'];
const TOTAL = UNITS.length * 4 * ACTIVITIES.length; // 32

let editor = false; try { editor = localStorage.getItem('editor') === '1'; } catch (e) {}
const PUB = Object.entries(EVIDENCIAS).flatMap(([w, l]) => l.map((f, i) => ({ id: 'p' + w + '-' + i, week: +w, act: f.act, name: f.name, url: f.url, size: 0, pub: true })));
const allFiles = () => files.concat(PUB);
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); };
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const size = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

/* ===== Base de datos local (IndexedDB) ===== */
let db;
const open = () => new Promise((ok, fail) => {
  const r = indexedDB.open('portafolio-david', 1);
  r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('files', { keyPath: 'id', autoIncrement: true }); d.createObjectStore('misc', { keyPath: 'key' }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => fail(r.error);
});
const tx = (store, mode, fn) => new Promise((ok, fail) => {
  const q = fn(db.transaction(store, mode).objectStore(store)); q.onsuccess = () => ok(q.result); q.onerror = () => fail(q.error);
});

let files = [];          // todos los archivos de actividades
let unit = 0;            // unidad activa
const slotFiles = (w, a) => allFiles().filter(f => f.week === w && f.act === a);
const weekCount = w => ACTIVITIES.reduce((n, _, a) => n + (slotFiles(w, a).length ? 1 : 0), 0);

async function addFiles(w, a, list) {
  try {
    for (const f of list) await tx('files', 'readwrite', s => s.add({ week: w, act: a, name: f.name, type: f.type, size: f.size, blob: f, date: Date.now() }));
    files = await tx('files', 'readonly', s => s.getAll());
    toast(list.length > 1 ? `${list.length} archivos guardados` : 'Archivo guardado');
    render();
  } catch (e) { toast('No se pudo guardar el archivo'); }
}
async function removeFile(id) {
  await tx('files', 'readwrite', s => s.delete(id));
  files = files.filter(f => f.id !== id); toast('Archivo eliminado'); render();
}
function openFile(f, download) {
  if (f.pub) return window.open(f.url, '_blank');
  const url = URL.createObjectURL(f.blob);
  if (!download && /^(image|text)\/|pdf/.test(f.type)) window.open(url, '_blank');
  else { const a = document.createElement('a'); a.href = url; a.download = f.name; a.click(); }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ===== Interfaz ===== */
function render() {
  // Pestañas de unidades
  $('#tabs').innerHTML = UNITS.map((u, i) => {
    const done = u.weeks.reduce((n, w) => n + weekCount(w), 0);
    return `<button class="tab" role="tab" data-u="${i}" aria-selected="${i === unit}">Unidad ${i + 1}<small class="mono">${done}/8 · ${esc(u.name)}</small></button>`;
  }).join('');
  // Semanas de la unidad activa
  $('#panel').innerHTML = UNITS[unit].weeks.map(w => `
    <article class="wk" id="wk-${w}"><p class="mono wk-h"><span>SEMANA ${pad(w)}</span><span>${weekCount(w)}/2 ACTIVIDADES</span></p>
    ${ACTIVITIES.map((name, a) => {
      const fl = slotFiles(w, a);
      return `<div class="act ${fl.length ? 'done' : ''}" data-w="${w}" data-a="${a}">
        <div class="act-h"><b><i class="st"></i>${name}<small>${fl.length ? fl.length + ' archivo(s)' : 'Sin archivos todavía'}</small></b>
        ${editor ? '<button class="up" type="button" data-up>Subir archivo ↑</button>' : ''}</div>
        ${fl.length ? `<ul class="files">${fl.map(f => `<li><span class="nm" title="${esc(f.name)}">${esc(f.name)}</span><span class="sz mono">${f.pub ? 'público' : size(f.size)}</span>
          <button type="button" data-open="${f.id}" aria-label="Abrir">↗</button>${f.pub ? '' : '<button type="button" data-dl="' + f.id + '" aria-label="Descargar">⬇</button>' + (editor ? '<button class="rm" type="button" data-rm="' + f.id + '" aria-label="Eliminar">✕</button>' : '')}</li>`).join('')}</ul>` : ''}
      </div>`;
    }).join('')}</article>`).join('');
  // Mapa de semanas y cifras
  $('#weeks').innerHTML = Array.from({ length: 16 }, (_, i) => { const c = weekCount(i + 1); return `<button type="button" data-go="${i + 1}" class="${c === 2 ? 'full' : c ? 'ok' : ''}" aria-label="Semana ${i + 1}">${pad(i + 1)}</button>`; }).join('');
  const done = Array.from({ length: 16 }, (_, i) => weekCount(i + 1)).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / TOTAL * 100);
  $('#pct').textContent = $('#stPct').textContent = pct + '%';
  $('#bar').style.width = pct + '%'; $('#nDone').textContent = done; $('#nFiles').textContent = allFiles().length;
  document.querySelectorAll('.link[data-go]').forEach(b => { const w = +b.dataset.go; const n = allFiles().filter(f => f.week === w).length; b.innerHTML = `Ver evidencia${n ? ' · ' + n + ' archivo(s)' : ''} <em>↗</em>`; });
}

function goWeek(w) {
  unit = UNITS.findIndex(u => u.weeks.includes(w)); render();
  const el = $('#wk-' + w); el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800);
}

/* Eventos (delegados) */
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.u) { unit = +t.dataset.u; render(); }
  else if (t.dataset.go) goWeek(+t.dataset.go);
  else if (t.hasAttribute('data-up')) { const act = t.closest('.act'); const w = +act.dataset.w, a = +act.dataset.a; openBasket(`Semana ${pad(w)} · ${ACTIVITIES[a]}`, f => addFiles(w, a, [f])); }
  else if (t.dataset.open) openFile(allFiles().find(f => f.id == t.dataset.open));
  else if (t.dataset.dl) openFile(allFiles().find(f => f.id == t.dataset.dl), true);
  else if (t.dataset.rm) { if (confirm('¿Eliminar este archivo?')) removeFile(+t.dataset.rm); }
});
// Arrastrar y soltar archivos sobre una actividad
['dragover', 'dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
  const act = e.target.closest && e.target.closest('.act'); if (!act || !editor) return;
  e.preventDefault();
  if (ev === 'dragover') act.classList.add('over'); else act.classList.remove('over');
  if (ev === 'drop' && e.dataTransfer.files.length) addFiles(+act.dataset.w, +act.dataset.a, [...e.dataTransfer.files]);
}));

/* Tema y menú */
const root = document.documentElement, themeBtn = $('#theme');
try { const t = localStorage.getItem('tema'); if (t) root.dataset.theme = t; } catch (e) {}
const icon = () => themeBtn.textContent = root.dataset.theme === 'dark' ? '☀' : '☾'; icon();
themeBtn.onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('tema', root.dataset.theme); } catch (e) {} icon(); };
$('#burger').onclick = () => $('#menu').classList.toggle('open');
$('#menu').onclick = e => { if (e.target.tagName === 'A') $('#menu').classList.remove('open'); };

/* CV y foto (se guardan en el navegador) */
const getMisc = k => tx('misc', 'readonly', s => s.get(k));
const setMisc = (k, blob) => tx('misc', 'readwrite', s => s.put({ key: k, blob }));
function pick(accept, cb) { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.onchange = () => i.files[0] && cb(i.files[0]); i.click(); }
function showFoto(blob) { const img = $('#fotoImg'); img.src = URL.createObjectURL(blob); img.hidden = false; $('#fotoPh').hidden = true; }
$('#fotoBtn').onclick = () => openBasket('Tu foto de perfil', async f => { await setMisc('foto', f); showFoto(f); toast('Foto actualizada'); }, { accept: 'image/*', single: true });
const uploadCv = () => openBasket('Tu CV (PDF)', async f => { await setMisc('cv', f); toast('CV guardado'); }, { accept: 'application/pdf', single: true });
$('#cvUp').onclick = uploadCv;
$('#cvBtn').onclick = async () => { let r = null; try { r = await getMisc('cv'); } catch (e) {} if (r) window.open(URL.createObjectURL(r.blob), '_blank'); else if (editor) { toast('Aún no hay CV: súbelo ahora'); uploadCv(); } else window.open(CONFIG.CV_URL, '_blank'); };

/* Inicio */
(async () => {
  try {
    db = await open();
    files = await tx('files', 'readonly', s => s.getAll());
    const f = await getMisc('foto'); if (f) showFoto(f.blob);
  } catch (e) { toast('Tu navegador no permite guardar archivos localmente'); }
  render();
})();

/* ===== Modo editor (solo el dueño sube archivos) ===== */
function setEditor(v) {
  editor = v; document.body.classList.toggle('editor', v);
  try { localStorage.setItem('editor', v ? '1' : '0'); } catch (e) {}
  $('#edBtn').textContent = v ? 'Salir del modo editor' : 'Modo editor'; render();
}
$('#edBtn').onclick = () => {
  if (editor) return setEditor(false);
  const k = prompt('Clave de editor:');
  if (k === CONFIG.CLAVE_EDITOR) { setEditor(true); toast('Modo editor activado'); } else if (k !== null) toast('Clave incorrecta');
};
setEditor(editor);

/* ===== Filtro de proyectos ===== */
document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
  document.querySelectorAll('.card').forEach(c => c.hidden = b.dataset.f !== 'todos' && !c.dataset.tags.includes(b.dataset.f));
});

/* ===== Laboratorio SQL (sql.js en el navegador) ===== */
const SEED = `CREATE TABLE facultad(id INTEGER PRIMARY KEY, nombre TEXT);
CREATE TABLE programa(id INTEGER PRIMARY KEY, nombre TEXT, facultad_id INTEGER REFERENCES facultad(id));
CREATE TABLE alumno(id INTEGER PRIMARY KEY, nombre TEXT, programa_id INTEGER REFERENCES programa(id), ciclo INTEGER);
CREATE INDEX idx_alumno_programa ON alumno(programa_id);
INSERT INTO facultad VALUES(1,'Ingeniería'),(2,'Ciencias Empresariales'),(3,'Humanidades');
INSERT INTO programa VALUES(1,'Ingeniería de Sistemas',1),(2,'Ingeniería Civil',1),(3,'Administración',2),(4,'Contabilidad',2),(5,'Psicología',3);
INSERT INTO alumno VALUES(1,'Ana Ríos',1,5),(2,'Luis Paredes',1,3),(3,'Marta Soto',2,7),(4,'Jorge Vela',3,2),(5,'Lucía Rojas',1,8),(6,'Carlos Díaz',4,4),(7,'Elena Cruz',5,6),(8,'Pedro Huamán',2,1),(9,'Rosa Quispe',3,9),(10,'Diego Salas',1,2);`;
const EXAMPLES = [
  ['JOIN', 'SELECT a.nombre, p.nombre AS programa\nFROM alumno a\nJOIN programa p ON p.id = a.programa_id\nORDER BY a.nombre;'],
  ['GROUP BY', 'SELECT p.nombre, COUNT(*) AS alumnos\nFROM alumno a\nJOIN programa p ON p.id = a.programa_id\nGROUP BY p.nombre\nORDER BY alumnos DESC;'],
  ['Índice', 'EXPLAIN QUERY PLAN\nSELECT * FROM alumno WHERE programa_id = 1;'],
  ['Todo alumno', 'SELECT * FROM alumno;']
].map(([n, q]) => [n, q.replace(/\\n/g, '\n')]);
$('#sqlChips').innerHTML = EXAMPLES.map((e, i) => `<button type="button" data-q="${i}" aria-pressed="false">${e[0]}</button>`).join('');
$('#sqlIn').value = EXAMPLES[0][1];
const loadScript = src => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/';
let SQL, sdb;
async function getDb(fresh) {
  if (!SQL) { await loadScript(SQLJS + 'sql-wasm.js'); SQL = await initSqlJs({ locateFile: f => SQLJS + f }); }
  if (!sdb || fresh) { sdb = new SQL.Database(); sdb.run(SEED); }
  return sdb;
}
async function runSql() {
  const out = $('#sqlOut'); out.innerHTML = '<p class="mono hint">Ejecutando…</p>';
  let d; try { d = await getDb(); } catch (e) { out.innerHTML = '<p class="mono err">No se pudo cargar el motor SQL. Necesitas conexión a internet.</p>'; return; }
  try {
    const res = d.exec($('#sqlIn').value);
    if (!res.length) { out.innerHTML = '<p class="mono hint">Consulta ejecutada. No hay filas para mostrar.</p>'; return; }
    const r = res[res.length - 1];
    out.innerHTML = `<div class="tw"><table><thead><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.slice(0, 50).map(row => `<tr>${row.map(v => `<td>${esc(String(v ?? 'NULL'))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="mono hint">${r.values.length} fila(s)</p>`;
  } catch (e) { out.innerHTML = `<p class="mono err">Error: ${esc(e.message || String(e))}</p>`; }
}
$('#sqlRun').onclick = runSql;
$('#sqlReset').onclick = async () => { try { await getDb(true); toast('Datos reiniciados'); } catch (e) { toast('Sin conexión al motor SQL'); } };
$('#sqlIn').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') runSql(); });
$('#sqlChips').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('#sqlIn').value = EXAMPLES[+b.dataset.q][1]; $('#sqlChips').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); runSql(); };

/* ===== Quiz ===== */
const QUIZ = [
  { q: '¿Qué cláusula une filas de dos tablas por una columna en común?', o: ['JOIN', 'LIMIT', 'GROUP BY', 'DISTINCT'], a: 0, e: 'JOIN relaciona tablas, normalmente con una clave foránea.' },
  { q: '¿Para qué sirve un índice?', o: ['Hacer copias de seguridad', 'Acelerar las búsquedas', 'Cifrar los datos', 'Borrar duplicados'], a: 1, e: 'Un índice permite encontrar filas sin recorrer toda la tabla.' },
  { q: '¿Qué garantiza una clave primaria?', o: ['Que la columna sea numérica', 'Que la tabla sea temporal', 'Que cada fila sea única e identificable', 'Que no existan relaciones'], a: 2, e: 'La clave primaria identifica de forma única cada fila.' },
  { q: 'En SQL Server, ¿qué archivo guarda los datos principales?', o: ['.bak', '.ldf', '.sql', '.mdf'], a: 3, e: '.mdf guarda los datos, .ldf el registro y .bak el respaldo.' }
];
let qi = 0, score = 0;
function renderQuiz() {
  const box = $('#quiz');
  if (qi >= QUIZ.length) {
    box.innerHTML = `<p class="mono lbl">RESULTADO</p><p class="score">${score}/${QUIZ.length}</p><p class="qtext">${score === QUIZ.length ? '¡Perfecto! Dominas lo básico.' : score >= 2 ? 'Buen avance. Repasa los temas que fallaste.' : 'Sigue practicando: prueba las consultas del laboratorio.'}</p><button class="btn primary" id="qRe" type="button">Reintentar</button>`;
    $('#qRe').onclick = () => { qi = 0; score = 0; renderQuiz(); }; return;
  }
  const q = QUIZ[qi];
  box.innerHTML = `<p class="mono lbl">PREGUNTA ${qi + 1} DE ${QUIZ.length}</p><p class="qtext">${q.q}</p><div class="opts">${q.o.map((t, i) => `<button type="button" data-o="${i}">${esc(t)}</button>`).join('')}</div><p class="fb" id="qFb" aria-live="polite"></p>`;
  box.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
    const ok = +b.dataset.o === q.a; if (ok) score++;
    box.querySelectorAll('[data-o]').forEach(x => { x.disabled = true; if (+x.dataset.o === q.a) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    $('#qFb').innerHTML = `${ok ? '¡Correcto! ' : 'No exactamente. '}${q.e} <button class="btn ghost" id="qNext" type="button">${qi + 1 < QUIZ.length ? 'Siguiente' : 'Ver resultado'}</button>`;
    $('#qNext').onclick = () => { qi++; renderQuiz(); };
  });
}
renderQuiz();

/* ===== Formulario de contacto (abre tu correo) ===== */
$('#msgForm').onsubmit = e => {
  e.preventDefault(); const f = new FormData(e.target);
  const body = `${f.get('msg')}\n\n— ${f.get('name')} (${f.get('mail')})`;
  location.href = `mailto:${CONFIG.EMAIL}?subject=${encodeURIComponent('Mensaje desde tu portafolio')}&body=${encodeURIComponent(body)}`;
  toast('Abriendo tu correo…');
};

/* ===== Foto inclinable y barra de lectura ===== */
const photo = document.querySelector('.photo');
if (photo && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  photo.addEventListener('mousemove', e => { const r = photo.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; photo.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`; });
  photo.addEventListener('mouseleave', () => photo.style.transform = '');
}
addEventListener('scroll', () => { $('#prog').style.width = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100) + '%'; }, { passive: true });

/* ===== Subida con baloncesto: arrastra la ficha al aro o pulsa "Lanzar por mí" ===== */
let bm, bmSave, bmOpts = {}, bmBusy = false, bmN = 0;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, REDUCED ? 0 : ms));
function pickFiles(cb) { const i = document.createElement('input'); i.type = 'file'; i.multiple = !bmOpts.single; if (bmOpts.accept) i.accept = bmOpts.accept; i.onchange = () => i.files.length && cb([...i.files]); i.click(); }
function buildBm() {
  document.body.insertAdjacentHTML('beforeend', `<div class="bm" id="bm" hidden role="dialog" aria-modal="true" aria-labelledby="bmT"><div class="bm-box">
    <div class="bm-top"><div><h3 id="bmT">Subir archivos</h3><p>Arrastra y suelta, o lanza el tiro.</p></div>
      <div class="bm-r"><span class="bm-count mono">Subidos <b id="bmN">0</b></span><button class="icon-btn" id="bmX" type="button" aria-label="Cerrar">✕</button></div></div>
    <div class="actions"><button class="btn ghost" id="bmBrowse" type="button">Buscar archivos</button><button class="btn primary" id="bmShot" type="button">Lanzar por mí</button></div>
    <div class="bm-court" id="bmCourt">
      <div class="bm-zone"><span class="up-i">⬆</span><b>Suelta archivos aquí</b><small class="mono">o arrastra la ficha al aro</small>
        <svg class="hoop" viewBox="0 0 140 120" aria-hidden="true"><rect class="bb" x="30" y="4" width="80" height="52" rx="3"/><rect class="bb2" x="52" y="26" width="36" height="26"/>
          <g class="net" id="bmNet"><path d="M36 64L52 110M54 66L60 112M70 68V114M86 66L80 112M104 64L88 110M40 80H100M46 94H94"/></g><ellipse class="rim" id="bmRim" cx="70" cy="62" rx="34" ry="6"/></svg></div>
      <div class="bm-q" id="bmQ"></div></div>
    <p class="mono hint" id="bmInfo"></p></div></div>`);
  bm = $('#bm');
  $('#bmX').onclick = closeBasket;
  bm.addEventListener('click', e => { if (e.target === bm) closeBasket(); });
  $('#bmBrowse').onclick = () => pickFiles(stage);
  $('#bmShot').onclick = () => $('#bmQ').children.length ? shootAll() : pickFiles(l => { stage(l); shootAll(); });
  ['dragover', 'drop'].forEach(ev => bm.addEventListener(ev, e => { e.preventDefault(); if (ev === 'drop' && e.target.closest('#bmCourt') && e.dataTransfer.files.length) { stage([...e.dataTransfer.files]); shootAll(); } }));
  $('#bmQ').addEventListener('pointerdown', e => { const c = e.target.closest('.fc'); if (c) drag(c, e); });
  $('#bmQ').addEventListener('keydown', e => { const c = e.target.closest('.fc'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!bmBusy) { bmBusy = true; shoot(c).then(() => bmBusy = false); } } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !bm.hidden) closeBasket(); });
}
function openBasket(label, save, opts = {}) {
  if (!bm) buildBm();
  bmSave = save; bmOpts = opts; bmN = 0; $('#bmN').textContent = 0; $('#bmQ').innerHTML = '';
  $('#bmInfo').textContent = label; bm.hidden = false; $('#bmBrowse').focus();
}
function closeBasket() { bm.hidden = true; $('#bmCourt').querySelectorAll('.fc').forEach(c => c.remove()); bmBusy = false; }
function stage(list) {
  if (bmOpts.single) { list = list.slice(0, 1); $('#bmQ').innerHTML = ''; }
  list.forEach(f => {
    const c = document.createElement('div'); c.className = 'fc'; c.tabIndex = 0; c.setAttribute('role', 'button');
    c.setAttribute('aria-label', 'Lanzar ' + f.name + ' (Enter)'); c._f = f; c.innerHTML = `<i>📄</i><span>${esc(f.name)}</span>`; $('#bmQ').appendChild(c);
  });
}
function lift(card) {  // saca la ficha de la fila para poder moverla libremente sobre la cancha
  const court = $('#bmCourt'), c = court.getBoundingClientRect(), r = card.getBoundingClientRect();
  const ph = document.createElement('div'); ph.className = 'fc ph'; card.before(ph);
  court.appendChild(card); card.classList.add('lifted'); card._ph = ph;
  card.style.left = (r.left - c.left) + 'px'; card.style.top = (r.top - c.top) + 'px'; return ph;
}
function drag(card, e) {
  if (bmBusy) return; e.preventDefault();
  const c = $('#bmCourt').getBoundingClientRect(), r = card.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
  const ph = lift(card); card.setPointerCapture(e.pointerId);
  let last = [e.clientY, performance.now()], vy = 0;
  const mv = ev => { card.style.left = (ev.clientX - c.left - ox) + 'px'; card.style.top = (ev.clientY - c.top - oy) + 'px'; const n = performance.now(); vy = (ev.clientY - last[0]) / Math.max(1, n - last[1]); last = [ev.clientY, n]; };
  const up = async () => {
    card.removeEventListener('pointermove', mv); card.removeEventListener('pointerup', up); card.removeEventListener('pointercancel', up);
    const rim = $('#bmRim').getBoundingClientRect(), cr = card.getBoundingClientRect();
    const d = Math.hypot(cr.left + cr.width / 2 - (rim.left + rim.width / 2), cr.top + cr.height / 2 - rim.top);
    if (d < 140 || vy < -.8) { bmBusy = true; await shoot(card); bmBusy = false; }
    else { card.classList.remove('lifted'); card.removeAttribute('style'); ph.replaceWith(card); delete card._ph; toast('Más cerca del aro, o pulsa «Lanzar por mí»'); }
  };
  card.addEventListener('pointermove', mv); card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
}
async function shoot(card) {
  const ph = card._ph || lift(card), court = $('#bmCourt').getBoundingClientRect(), r = card.getBoundingClientRect(), rim = $('#bmRim').getBoundingClientRect();
  const sx = r.left - court.left, sy = r.top - court.top, tx = rim.left - court.left + rim.width / 2 - r.width / 2, ty = rim.top - court.top - r.height / 2;
  if (!REDUCED) {
    const dur = 850, arc = Math.max(70, Math.abs(sy - ty) * .45) + 50, t0 = performance.now();
    await new Promise(done => { const step = t => { const k = Math.min((t - t0) / dur, 1);
      card.style.left = (sx + (tx - sx) * k) + 'px'; card.style.top = (sy + (ty - sy) * k - arc * 4 * k * (1 - k)) + 'px';
      card.style.transform = `rotate(${k * 540}deg) scale(${1 - .3 * k})`; k < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
    $('#bmNet').classList.remove('swish'); void $('#bmNet').getBoundingClientRect(); $('#bmNet').classList.add('swish');
    await card.animate([{ opacity: 1, transform: 'rotate(540deg) scale(.7)' }, { opacity: 0, transform: 'rotate(560deg) translateY(75px) scale(.35)' }], { duration: 400, easing: 'ease-in' }).finished;
  }
  ph.remove(); card.remove();
  await bmSave(card._f);
  $('#bmN').textContent = ++bmN; $('#bmInfo').textContent = '¡Canasta! ' + card._f.name + ' guardado';
  if (bmOpts.single) setTimeout(closeBasket, 800);
}
async function shootAll() {
  if (bmBusy) return; bmBusy = true;
  for (const c of [...$('#bmQ').querySelectorAll('.fc')]) { await shoot(c); await wait(200); }
  bmBusy = false;
}

/* ===== Juego: niveles y dificultades ===== */
(() => {
  const cv = $('#gm'), g = cv.getContext('2d'), W = cv.width, H = cv.height, BX = 110, BY = H - 60, R = 15, GRAV = .42, FLOOR = H - 14, WALLX = 300, WALLW = 14;
  const DIFFS = { facil: { n: 'Fácil', time: 45, s: 1.25, wind: .6, goal: .7 }, normal: { n: 'Normal', time: 35, s: 1, wind: 1, goal: 1 }, dificil: { n: 'Difícil', time: 28, s: .8, wind: 1.4, goal: 1.3 } };
  const LEVELS = [
    { n: 'Calentamiento', goal: 3, fixed: true },
    { n: 'El aro viaja', goal: 4 },
    { n: 'Aro ascensor', goal: 4, osc: 45 },
    { n: 'Viento', goal: 5, wind: 2.2 },
    { n: 'El muro', goal: 5, wall: true },
    { n: 'Ascensor y viento', goal: 6, osc: 50, wind: 2.6 },
    { n: 'Muro móvil', goal: 6, wall: true, wallMove: 50, small: .9 },
    { n: 'Maestro', goal: 8, osc: 40, wind: 3, wall: true, wallMove: 40, small: .9 }
  ];
  let save = { u: { facil: 1, normal: 1, dificil: 1 }, st: {}, best: {} };
  try { const j = JSON.parse(localStorage.getItem('basket')); if (j) save = Object.assign(save, j); } catch (e) {}
  const persist = () => { try { localStorage.setItem('basket', JSON.stringify(save)); } catch (e) {} };
  let diff = 'normal', lvl = 0, state = 'menu', score = 0, baskets = 0, goal = 3, left = 0, streak = 0, touched = false, scored = false, resetAt = 0, winAt = 0, swish = 0, wind = 0, ball, hoop, drag = null, timer; const pops = [];
  const L = () => LEVELS[lvl], D = () => DIFFS[diff], key = () => diff + '-' + lvl;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wallTop = () => 200 + (L().wallMove ? Math.sin(performance.now() / 900) * L().wallMove : 0);
  function newHoop() { hoop = { x: L().fixed ? 470 : rnd(400, 560), by: L().fixed ? 170 : rnd(125, 205), y: 170, py: 170, hw: 34 * D().s * (L().small || 1) }; hoop.y = hoop.py = hoop.by; }
  function reset(missed) {
    if (missed && !scored) streak = 0;
    if (scored && !L().fixed) newHoop();
    ball = { x: BX, y: BY, px: BX, py: BY, vx: 0, vy: 0, fly: false }; scored = false; touched = false; resetAt = 0;
    wind = L().wind ? (Math.random() * 2 - 1) * L().wind * D().wind : 0;
  }
  function hud() {
    $('#gLvl').textContent = state === 'menu' ? '—' : `${lvl + 1} · ${L().n}`; $('#gGoal').textContent = `${baskets}/${goal}`;
    $('#gTime').textContent = left; $('#gScore').textContent = score; $('#gBest').textContent = save.best[key()] || 0;
  }
  function start(i) {
    lvl = i; state = 'playing'; score = baskets = streak = 0; goal = Math.max(2, Math.round(L().goal * D().goal)); left = D().time; winAt = 0;
    newHoop(); reset(); hud(); $('#gOver').hidden = true; clearInterval(timer);
    timer = setInterval(() => { if (state === 'playing' && --left <= 0) { left = 0; finish(false); } hud(); }, 1000);
  }
  function finish(won) {
    clearInterval(timer); state = won ? 'won' : 'lost'; let stars = 0;
    if (won) {
      stars = left >= D().time * .4 ? 3 : left >= D().time * .15 ? 2 : 1; score += left * 10;
      save.st[key()] = Math.max(save.st[key()] || 0, stars); save.best[key()] = Math.max(save.best[key()] || 0, score);
      save.u[diff] = Math.min(LEVELS.length, Math.max(save.u[diff], lvl + 2)); persist();
    }
    hud(); overlay(stars);
  }
  function toMenu() { clearInterval(timer); state = 'menu'; hud(); overlay(); }
  function overlay(stars = 0) {
    const o = $('#gOver'); o.hidden = false;
    if (state === 'menu') {
      o.innerHTML = `<p class="mono lbl">DIFICULTAD</p><div class="chips">${Object.entries(DIFFS).map(([k, d]) => `<button type="button" data-d="${k}" aria-pressed="${k === diff}">${d.n}</button>`).join('')}</div>
      <p class="mono lbl">ELIGE UN NIVEL</p><div class="lvls">${LEVELS.map((v, i) => { const lock = i + 1 > save.u[diff], s = save.st[diff + '-' + i] || 0; return `<button type="button" data-l="${i}" ${lock ? 'disabled' : ''}><b>${lock ? '🔒' : i + 1}</b><small>${v.n}</small><span>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span></button>`; }).join('')}</div>
      <p class="mono hint">Arrastra la pelota hacia atrás y suéltala. Supera el nivel para desbloquear el siguiente.</p>`;
    } else {
      const won = state === 'won';
      o.innerHTML = `<h3>${won ? '¡Nivel superado!' : 'Se acabó el tiempo'}</h3><p class="stars">${won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : ''}</p><p>Canastas ${baskets}/${goal} · Puntos ${score}</p>
      <div class="actions" style="justify-content:center">${won && lvl < LEVELS.length - 1 ? '<button class="btn primary" type="button" data-act="next">Siguiente nivel ▶</button>' : ''}<button class="btn ${won ? 'ghost' : 'primary'}" type="button" data-act="again">Repetir</button><button class="btn ghost" type="button" data-act="menu">Niveles</button></div>`;
    }
  }
  $('#gOver').onclick = e => { const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d) { diff = b.dataset.d; overlay(); } else if (b.dataset.l !== undefined) start(+b.dataset.l);
    else if (b.dataset.act === 'next') start(lvl + 1); else if (b.dataset.act === 'again') start(lvl); else if (b.dataset.act === 'menu') toMenu(); };
  $('#gMenu').onclick = toMenu;
  function shoot(vx, vy) { if (!ball.fly) { ball.vx = vx; ball.vy = vy; ball.fly = true; } }
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  cv.onpointerdown = e => { if (state !== 'playing' || ball.fly) return; const [x, y] = pt(e); if (Math.hypot(x - ball.x, y - ball.y) < 70) { drag = [x, y]; cv.setPointerCapture(e.pointerId); } };
  cv.onpointermove = e => { if (drag) drag = pt(e); };
  const power = () => { const vx = (BX - drag[0]) * .13, vy = (BY - drag[1]) * .13, m = Math.hypot(vx, vy), k = m > 24 ? 24 / m : 1; return [vx * k, vy * k, m]; };
  cv.onpointerup = cv.onpointercancel = () => { if (!drag) return; const [vx, vy, m] = power(); drag = null; if (m > 2.5) shoot(vx, vy); };
  function step() {
    if (state !== 'playing') return;
    hoop.py = hoop.y; hoop.y = hoop.by + (L().osc ? Math.sin(performance.now() / 700) * L().osc : 0);
    if (winAt && performance.now() > winAt) return finish(true);
    if (!ball.fly) return;
    ball.px = ball.x; ball.py = ball.y; ball.vx += wind * .01; ball.vy += GRAV; ball.x += ball.vx; ball.y += ball.vy;
    for (const cx of [hoop.x - hoop.hw, hoop.x + hoop.hw]) {  // puntas del aro
      const dx = ball.x - cx, dy = ball.y - hoop.y, d = Math.hypot(dx, dy);
      if (d < R + 4 && d > 0) { const nx = dx / d, ny = dy / d, dot = ball.vx * nx + ball.vy * ny; if (dot < 0) { ball.vx = (ball.vx - 1.6 * dot * nx) * .8; ball.vy = (ball.vy - 1.6 * dot * ny) * .8; touched = true; } ball.x = cx + nx * (R + 4); ball.y = hoop.y + ny * (R + 4); }
    }
    const bx = hoop.x + hoop.hw + 6;  // tablero
    if (ball.x + R > bx && ball.x < bx + 12 && ball.y > hoop.y - 70 && ball.y < hoop.y + 6) { ball.x = bx - R; ball.vx = -Math.abs(ball.vx) * .6; touched = true; }
    if (L().wall) {  // muro
      const top = wallTop(), cx = Math.max(WALLX, Math.min(ball.x, WALLX + WALLW)), cy = Math.max(top, Math.min(ball.y, FLOOR)), dx = ball.x - cx, dy = ball.y - cy, d = Math.hypot(dx, dy);
      if (d < R) { const nx = d ? dx / d : -1, ny = d ? dy / d : 0, dot = ball.vx * nx + ball.vy * ny; if (dot < 0) { ball.vx -= 1.55 * dot * nx; ball.vy -= 1.55 * dot * ny; } ball.x = cx + nx * R; ball.y = cy + ny * R; touched = true; }
    }
    if (!scored && ball.vy > 0 && ball.py < hoop.py && ball.y >= hoop.y && Math.abs(ball.x - hoop.x) < hoop.hw - 4) {
      scored = true; baskets++; streak++; const pts = 100 + (touched ? 0 : 50) + 25 * (streak - 1); score += pts; swish = 24;
      pops.push({ x: hoop.x, y: hoop.y - 40, t: 60, txt: '+' + pts + (touched ? '' : ' ¡limpio!') }); if (baskets >= goal) winAt = performance.now() + 700; hud();
    }
    if (ball.y + R > FLOOR) { ball.y = FLOOR - R; ball.vy *= -.55; ball.vx *= .85; if (!resetAt) resetAt = performance.now() + 700; }
    if (ball.x > W + 40 || ball.x < -40) reset(true);
    if (resetAt && performance.now() > resetAt) reset(true);
  }
  function draw() {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = '#2b5da8'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, FLOOR); g.lineTo(W, FLOOR); g.stroke();
    if (L().wall) { const t = wallTop(), gr = g.createLinearGradient(0, t, 0, FLOOR); gr.addColorStop(0, '#a855f7'); gr.addColorStop(1, '#312e81'); g.fillStyle = gr; g.fillRect(WALLX, t, WALLW, FLOOR - t); }
    const hw = hoop.hw, s = hw / 34;
    g.fillStyle = '#8d9cc4'; g.fillRect(hoop.x + hw + 6, hoop.y - 70, 8, 80); g.strokeStyle = '#f87171'; g.lineWidth = 2; g.strokeRect(hoop.x + hw - 14, hoop.y - 38, 20, 22);
    const w = swish > 0 ? Math.sin(swish-- * .6) * 4 : 0;
    g.strokeStyle = '#9fb0d8'; g.lineWidth = 1.2; g.beginPath();
    for (let i = 0; i <= 4; i++) { g.moveTo(hoop.x - hw + i * hw / 2, hoop.y); g.lineTo(hoop.x - hw * .65 + i * hw * .325 + w, hoop.y + 46); }
    for (const t of [16, 32]) { g.moveTo(hoop.x - hw + t * .3 + w * t / 46, hoop.y + t); g.lineTo(hoop.x + hw - t * .3 + w * t / 46, hoop.y + t); } g.stroke();
    g.strokeStyle = '#fb923c'; g.lineWidth = 4; g.beginPath(); g.moveTo(hoop.x - hw, hoop.y); g.lineTo(hoop.x + hw, hoop.y); g.stroke();
    if (L().wind) {  // indicador de viento
      g.fillStyle = '#8d9cc4'; g.font = '12px monospace'; g.fillText('VIENTO', 16, 26); const len = wind / (L().wind * 1.4) * 60; g.strokeStyle = '#22d3ee'; g.lineWidth = 3; g.beginPath(); g.moveTo(100, 22); g.lineTo(100 + len, 22); g.stroke();
      if (Math.abs(len) > 6) { const d = Math.sign(len); g.beginPath(); g.moveTo(100 + len, 22); g.lineTo(100 + len - 8 * d, 17); g.lineTo(100 + len - 8 * d, 27); g.fill(); }
    }
    let bxp = ball.x, byp = ball.y;
    if (drag) {  // guía de tiro (sin viento)
      const [vx, vy] = power(); let x = BX, y = BY, v = vy; g.fillStyle = '#22d3ee';
      for (let i = 0; i < 34; i++) { v += GRAV; x += vx; y += v; if (i % 3 === 0) { g.globalAlpha = 1 - i / 40; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } } g.globalAlpha = 1;
      const dx = drag[0] - BX, dy = drag[1] - BY, d = Math.min(80, Math.hypot(dx, dy)), a = Math.atan2(dy, dx); bxp = BX + Math.cos(a) * d; byp = BY + Math.sin(a) * d;
    }
    g.save(); g.translate(bxp, byp); g.rotate(ball.fly ? ball.x / 18 : 0);
    g.fillStyle = '#f97316'; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
    g.strokeStyle = '#7c2d12'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-R, 0); g.lineTo(R, 0); g.moveTo(0, -R); g.lineTo(0, R); g.arc(0, 0, R * .62, -.9, .9); g.stroke(); g.restore();
    g.font = 'bold 15px sans-serif'; g.textAlign = 'center'; for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; g.globalAlpha = p.t / 60; g.fillStyle = '#fde047'; g.fillText(p.txt, p.x, p.y); p.y -= .6; if (--p.t <= 0) pops.splice(i, 1); } g.globalAlpha = 1; g.textAlign = 'start';
  }
  newHoop(); reset(); hud(); overlay();
  (function loop() { step(); draw(); requestAnimationFrame(loop); })();
  window.basketGame = { start: (i, d) => { if (d) diff = d; start(i); }, shoot, setTime: n => { left = n; }, get score() { return score; }, get baskets() { return baskets; }, get goal() { return goal; }, get hoop() { return hoop; }, get state() { return state; }, get save() { return save; } };
})();
