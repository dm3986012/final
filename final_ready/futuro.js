/* ===== Capa futurista: partículas, escritura, buscador, chatbot, proyectos, habilidades, línea de tiempo ===== */
(() => {
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safeUrl = u => /^(https?:\/\/|#|[\w./-]+$)/i.test(u || '');
  const jump = h => document.querySelector(h).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  /* Partículas */
  const bg = document.createElement('canvas'); bg.id = 'bg'; bg.setAttribute('aria-hidden', 'true'); document.body.prepend(bg);
  const c = bg.getContext('2d'); let P = [], w, h, mx = -999, my = -999;
  const size = () => { w = bg.width = innerWidth; h = bg.height = innerHeight; P = Array.from({ length: Math.min(90, Math.round(w * h / 16000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.5 + .4 })); };
  addEventListener('resize', size); addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true }); size();
  const frame = () => {
    c.clearRect(0, 0, w, h); const col = document.documentElement.dataset.theme === 'light' ? '30,90,200' : '120,200,255';
    for (const p of P) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy); if (d < 120 && d > 0) { p.x += dx / d * .8; p.y += dy / d * .8; } c.fillStyle = `rgba(${col},.75)`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y); if (d < 110) { c.strokeStyle = `rgba(${col},${.22 * (1 - d / 110)})`; c.beginPath(); c.moveTo(P[i].x, P[i].y); c.lineTo(P[j].x, P[j].y); c.stroke(); } }
  };
  reduce ? frame() : (function loop() { frame(); requestAnimationFrame(loop); })();

  /* Órbita de tecnologías en el hero */
  const orbit = document.createElement('div'); orbit.className = 'orbit'; orbit.setAttribute('aria-hidden', 'true');
  orbit.innerHTML = ['JS', 'SQL', 'HTML', 'CSS', 'Git', 'Java', 'DB', 'VS'].map((t, i) => `<i style="--a:${i * 45}deg"><b>${t}</b></i>`).join('');
  document.querySelector('.photo').prepend(orbit);

  /* Escritura automática */
  const ty = $('#typed'); let fi = 0, ci = 0, del = false;
  (function tick() {
    if (reduce) { ty.textContent = FRASES[0]; return; }
    const f = FRASES[fi]; ty.textContent = f.slice(0, ci);
    if (!del && ci === f.length) { del = true; return setTimeout(tick, 1700); }
    if (del && ci === 0) { del = false; fi = (fi + 1) % FRASES.length; }
    ci += del ? -1 : 1; setTimeout(tick, del ? 22 : 50);
  })();

  /* Habilidades y línea de tiempo (a partir de config.js) */
  $('#skillGrid').innerHTML = SKILLS.map(s => `<article class="skill" tabindex="0"><span class="sk-ic mono">${esc(s.n.slice(0, 2).toUpperCase())}</span><h3>${esc(s.n)}</h3><p class="mono">${esc(s.cat)}</p>
    <div class="dots">${s.lvl ? [1, 2, 3, 4, 5].map(i => `<span class="${i <= s.lvl ? 'on' : ''}"></span>`).join('') + `<span class="sr" hidden>Nivel ${s.lvl} de 5</span>` : '<small>Nivel por definir en config.js</small>'}</div>
    <p class="use">${s.use.length ? 'Usado en: ' + esc(s.use.join(' · ')) : 'Sin proyectos asociados todavía'}</p></article>`).join('');
  document.querySelectorAll('.skill').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--x', e.clientX - r.left + 'px'); el.style.setProperty('--y', e.clientY - r.top + 'px'); }));
  const tl = PROYECTOS.map(p => ({ o: p.sem[0], when: (p.sem.length > 1 ? 'Semanas ' : 'Semana ') + p.sem.map(pad).join('–'), title: p.n, sub: p.sub + ' · ' + p.tec.join(', '), kind: 'Proyecto' }))
    .sort((a, b) => a.o - b.o).concat(EXTRA);
  $('#tl').innerHTML = tl.map(t => `<li class="tl-i"><div class="tl-b"><span class="kind mono">${esc(t.kind || 'Hito')}</span><time class="mono">${esc(t.when)}</time><h3>${esc(t.title)}</h3><p>${esc(t.sub || '')}</p></div></li>`).join('');

  /* Entradas animadas, sección activa y botón de subir */
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); setTimeout(() => e.target.classList.remove('rv', 'in'), 900); } }), { threshold: .1 });
  document.querySelectorAll('.sec-head,.card,.panel,.stats div,.skill,.tl-i').forEach(el => { el.classList.add('rv'); rv.observe(el); });
  const links = [...document.querySelectorAll('#menu a')];
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach(s => so.observe(s));
  document.body.insertAdjacentHTML('beforeend', '<button id="up" type="button" aria-label="Volver al inicio">↑</button>');
  $('#up').onclick = () => jump('#inicio');
  addEventListener('scroll', () => $('#up').classList.toggle('show', scrollY > 600), { passive: true });

  /* Modal de proyecto */
  document.body.insertAdjacentHTML('beforeend', '<dialog id="pm" class="dlg" aria-label="Detalle del proyecto"></dialog>');
  const lnk = (u, t) => safeUrl(u) && u ? `<a class="btn ghost" href="${esc(u)}" ${u[0] === '#' ? '' : 'target="_blank" rel="noopener"'}>${t} ↗</a>` : `<span class="btn ghost off">${t}: no publicado</span>`;
  function openProject(i) {
    const p = PROYECTOS[i], ev = allFiles().filter(f => p.sem.includes(f.week));
    $('#pm').innerHTML = `<form method="dialog" class="dlg-x"><button aria-label="Cerrar">✕</button></form><p class="eyebrow mono">${p.sem.length > 1 ? 'SEMANAS ' : 'SEMANA '}${p.sem.map(pad).join('–')}</p><h2>${esc(p.n)}</h2><h4>${esc(p.sub)}</h4><p>${esc(p.d)}</p>
      <h5>OBJETIVO</h5><p>${esc(p.obj)}</p><h5>TECNOLOGÍAS</h5><p class="tags mono">${p.tec.map(t => `<span>${esc(t)}</span>`).join('')}</p>
      <h5>EVIDENCIAS</h5>${ev.length ? `<ul class="files">${ev.map(f => `<li><span class="nm">${esc(f.name)}</span><span class="sz mono">${f.pub ? 'publicado' : 'solo en este navegador'}</span></li>`).join('')}</ul>` : '<p>Sin evidencias registradas para esta semana.</p>'}
      <div class="actions" style="margin-top:1.2rem">${lnk(p.repo, 'Código fuente')}${lnk(p.demo, 'Demostración')}${lnk(p.doc, 'Documentación')}<button class="btn primary" type="button" data-pgo="${p.sem[0]}">Ver actividades ↓</button></div>`;
    $('#pm').showModal();
  }
  $('#pm').addEventListener('click', e => { const b = e.target.closest('[data-pgo]'), a = e.target.closest('a[href^="#"]'); if (b) { $('#pm').close(); goWeek(+b.dataset.pgo); } else if (a) $('#pm').close(); else if (e.target === $('#pm')) $('#pm').close(); });
  document.querySelectorAll('.card').forEach((el, i) => { if (!PROYECTOS[i]) return; el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Abrir proyecto ' + PROYECTOS[i].n);
    el.addEventListener('click', e => { if (!e.target.closest('.link')) openProject(i); }); el.addEventListener('keydown', e => { if (e.key === 'Enter') openProject(i); }); });

  /* Buscador global (Ctrl+K o /) */
  document.body.insertAdjacentHTML('beforeend', `<dialog id="srch" class="dlg srch" aria-label="Buscador"><input id="q" type="search" placeholder="Buscar proyectos, semanas, archivos, tecnologías…" autocomplete="off" aria-label="Buscar">
    <div class="chips" id="qf">${['Todo', 'Proyectos', 'Actividades', 'Archivos', 'Tecnologías'].map((g, i) => `<button type="button" data-g="${g}" aria-pressed="${i === 0}">${g}</button>`).join('')}</div><ul id="qr" role="listbox"></ul><p class="mono hint">↑↓ navegar · Enter abrir · Esc cerrar</p></dialog>`);
  const GRP = { Proyecto: 'Proyectos', Unidad: 'Actividades', Semana: 'Actividades', Actividad: 'Actividades', PDF: 'Archivos', Imagen: 'Archivos', Documento: 'Archivos', Tecnología: 'Tecnologías' };
  let grp = 'Todo', sel = 0, res = [];
  const items = () => {
    const I = []; PROYECTOS.forEach((p, i) => I.push({ k: 'Proyecto', t: p.n, s: p.sub, x: p.tec.join(' ') + ' ' + p.d, go: () => openProject(i) }));
    UNITS.forEach((u, ui) => { I.push({ k: 'Unidad', t: `Unidad ${ui + 1}`, s: u.name, x: '', go: () => goWeek(u.weeks[0]) });
      u.weeks.forEach(wk => { I.push({ k: 'Semana', t: `Semana ${pad(wk)}`, s: `Unidad ${ui + 1} · ${u.name}`, x: '', go: () => goWeek(wk) }); ACTIVITIES.forEach(a => I.push({ k: 'Actividad', t: `${a} · Semana ${pad(wk)}`, s: `Unidad ${ui + 1}`, x: '', go: () => goWeek(wk) })); }); });
    allFiles().forEach(f => I.push({ k: /\.pdf$/i.test(f.name) ? 'PDF' : /\.(png|jpe?g|gif|webp)$/i.test(f.name) ? 'Imagen' : 'Documento', t: f.name, s: `Semana ${pad(f.week)} · ${ACTIVITIES[f.act]} · ${f.pub ? 'publicado' : 'solo en este navegador'}`, x: '', go: () => goWeek(f.week) }));
    SKILLS.forEach(s => I.push({ k: 'Tecnología', t: s.n, s: s.cat + (s.use.length ? ' · ' + s.use.join(', ') : ''), x: '', go: () => jump('#skills') }));
    return I;
  };
  const hl = (t, toks) => { const n = norm(t), m = new Array(t.length).fill(0); toks.forEach(k => { let i = n.indexOf(k); while (i >= 0 && k) { for (let j = i; j < i + k.length; j++) m[j] = 1; i = n.indexOf(k, i + k.length); } }); let o = '', on = false; for (let i = 0; i < t.length; i++) { if (m[i] && !on) { o += '<mark>'; on = true; } if (!m[i] && on) { o += '</mark>'; on = false; } o += esc(t[i]); } return o + (on ? '</mark>' : ''); };
  function search() {
    const toks = norm($('#q').value).split(/\s+/).filter(Boolean);
    res = items().filter(it => (grp === 'Todo' || GRP[it.k] === grp) && toks.every(k => norm(it.t + ' ' + it.s + ' ' + it.x + ' ' + it.k).includes(k))).slice(0, 40); sel = 0;
    $('#qr').innerHTML = res.length ? res.map((r, i) => `<li role="option" data-i="${i}" aria-selected="${i === 0}"><span class="kind">${r.k.toUpperCase()}</span><span>${hl(r.t, toks)}<small>${hl(r.s, toks)}</small></span></li>`).join('') : '<li>Sin resultados.</li>';
  }
  const mark = () => { [...$('#qr').children].forEach((li, i) => li.setAttribute('aria-selected', i === sel)); $('#qr').children[sel]?.scrollIntoView({ block: 'nearest' }); };
  const run = i => { const r = res[i]; if (!r) return; $('#srch').close(); setTimeout(r.go, 60); };
  const openSearch = () => { $('#srch').showModal(); $('#q').value = ''; search(); $('#q').focus(); };
  $('#q').addEventListener('input', search);
  $('#srch').addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(res.length - 1, sel + 1); mark(); } else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); } else if (e.key === 'Enter') run(sel); });
  $('#qr').addEventListener('click', e => { const li = e.target.closest('[data-i]'); if (li) run(+li.dataset.i); });
  $('#qf').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; grp = b.dataset.g; $('#qf').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); search(); });
  $('#srch').addEventListener('click', e => { if (e.target === $('#srch')) $('#srch').close(); });
  $('#sBtn').onclick = openSearch;
  addEventListener('keydown', e => { const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName); if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); openSearch(); } });

  /* Chatbot local (respuestas configurables, sin API externa) */
  document.body.insertAdjacentHTML('beforeend', `<button id="chatBtn" type="button" aria-label="Abrir asistente" aria-expanded="false">💬</button>
    <section id="chat" hidden aria-label="Asistente del portafolio"><div class="ch-h"><span>Asistente del portafolio</span><button id="chatX" type="button" aria-label="Cerrar">✕</button></div><div id="cm" aria-live="polite"></div><div id="cq"></div>
    <form id="cf"><input id="ci" placeholder="Escribe tu pregunta…" autocomplete="off" aria-label="Pregunta"><button class="btn primary" type="submit">➤</button></form></section>`);
  const done = () => UNITS.flatMap(u => u.weeks).reduce((n, wk) => n + weekCount(wk), 0);
  const KB = [
    { q: 'Presentación', k: ['hola', 'quien', 'presenta', 'david', 'sobre ti', 'quien eres'], a: () => 'David Martínez es estudiante de Ingeniería de Sistemas. Usa este portafolio para documentar sus ejercicios de SQL y modelado de datos, con el proceso, las decisiones y los archivos de cada trabajo.', to: '#sobre-mi' },
    { q: 'Proyectos', k: ['proyecto', 'trabajos'], a: () => 'Proyectos publicados:\n' + PROYECTOS.map(p => `• ${p.n} (semana ${p.sem.join('–')}): ${p.sub}`).join('\n'), to: '#proyectos' },
    { q: 'Unidades', k: ['unidad', 'semana', 'curso', 'estructura'], a: () => `El curso está organizado en ${UNITS.length} unidades de 4 semanas, con 2 actividades por semana (${TOTAL} en total). Ahora mismo hay evidencia en ${done()} de ${TOTAL} actividades.`, to: '#actividades' },
    { q: 'Tecnologías', k: ['tecnolog', 'habilidad', 'skill', 'lenguaje', 'java', 'mysql', 'herramienta'], a: () => 'Panel de tecnologías: ' + SKILLS.map(s => s.n).join(', ') + '. Los niveles los define el propietario en config.js; no se muestran porcentajes inventados.', to: '#skills' },
    { q: 'Laboratorio SQL', k: ['sql', 'laboratorio', 'consulta'], a: () => 'El Laboratorio SQL ejecuta consultas reales (motor sql.js) sobre las tablas facultad, programa y alumno, directamente en tu navegador. Necesita conexión a internet para cargar el motor.', to: '#laboratorio' },
    { q: 'Juego', k: ['juego', 'encesta', 'baloncesto', 'jugar'], a: () => 'Encesta es un juego de baloncesto con 8 niveles y 3 dificultades. Arrastra la pelota hacia atrás y suéltala; tus estrellas y récords se guardan en tu navegador.', to: '#juego' },
    { q: 'CV', k: ['cv', 'curriculum', 'curriculo'], a: () => 'Puedes abrir el CV con el botón «Ver CV en PDF» de la pantalla de inicio.', to: '#inicio' },
    { q: 'Contacto', k: ['contacto', 'correo', 'mensaje', 'escribir'], a: () => 'Puedes escribir desde el formulario de Contacto: se abre tu programa de correo con el mensaje ya redactado.', to: '#contacto' },
    { q: '¿Qué está publicado?', k: ['publicado', 'github', 'local', 'editor', 'subir', 'archivo', 'evidencia'], a: () => 'Los archivos «publicados» son los registrados en config.js y subidos a GitHub Pages: los ve cualquier visitante. Los que se suben en Modo editor solo existen en el navegador del editor y no están publicados.', to: '#actividades' }
  ];
  const say = (t, who, to) => { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = esc(t).replace(/\n/g, '<br>') + (to ? `<button type="button" data-to="${to}">Ir a la sección →</button>` : ''); $('#cm').appendChild(d); $('#cm').scrollTop = 1e6; };
  const ask = txt => { say(txt, 'me'); const n = norm(txt), hit = KB.find(e => e.k.some(k => n.includes(k))); hit ? say(hit.a(), 'bot', hit.to) : say('No tengo esa información en el portafolio. Prueba con los botones de abajo o usa el buscador (Ctrl + K).', 'bot'); };
  $('#cq').innerHTML = KB.map(e => `<button type="button">${esc(e.q)}</button>`).join('');
  say('¡Hola! Soy el asistente del portafolio. Respondo con la información real de esta página. ¿Qué quieres saber?', 'bot');
  const toggle = v => { $('#chat').hidden = !v; $('#chatBtn').setAttribute('aria-expanded', v); if (v) $('#ci').focus(); };
  $('#chatBtn').onclick = () => toggle($('#chat').hidden); $('#chatX').onclick = () => toggle(false);
  $('#cq').onclick = e => { const b = e.target.closest('button'); if (b) { const q = KB.find(k => k.q === b.textContent); say(q.q, 'me'); say(q.a(), 'bot', q.to); } };
  $('#cm').onclick = e => { const b = e.target.closest('[data-to]'); if (b) { toggle(false); jump(b.dataset.to); } };
  $('#cf').onsubmit = e => { e.preventDefault(); const v = $('#ci').value.trim(); if (v) { ask(v); $('#ci').value = ''; } };
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#chat').hidden) toggle(false); });
})();
