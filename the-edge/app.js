/* ============================================================
   THE EDGE — application logic
   Router, persistence, daily-nudge engine, ambient motion,
   and the interactive learning modules.
   ============================================================ */
(function () {
  'use strict';
  const D = window.EDGE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $('#app');
  const topbar = $('#topbar');

  /* ---------------- persistence ---------------- */
  const KEY = 'theEdge.v1';
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  };
  let store = Object.assign(
    { streak: 0, lastVisit: null, checkedToday: null, practiced: {}, checks: {},
      journal: {}, commits: {}, sound: false, dailyDone: {} },
    load()
  );
  const save = () => localStorage.setItem(KEY, JSON.stringify(store));

  /* ---------------- sound (soft UI blips via WebAudio) ---------------- */
  let actx = null;
  function beep(freq = 440, dur = 0.07, type = 'sine', gain = 0.04) {
    if (!store.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = gain; o.connect(g); g.connect(actx.destination);
      const t = actx.currentTime;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur);
    } catch {}
  }
  const sMove = () => beep(520, 0.05, 'sine', 0.03);
  const sSelect = () => { beep(660, 0.06, 'triangle', 0.045); setTimeout(() => beep(880, 0.06, 'triangle', 0.035), 55); };
  const sBack = () => beep(320, 0.06, 'sine', 0.03);
  const sReward = () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.05), i * 90)); };

  /* ---------------- streak / daily engine ---------------- */
  function computeStreak() {
    const today = todayStr();
    if (store.lastVisit === today) return; // already counted
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if (store.lastVisit === yesterday) store.streak = (store.streak || 0) + 1;
    else store.streak = 1; // reset (or first ever)
    store.lastVisit = today;
    save();
  }
  // deterministic "edge of the day"
  function dailyIndex() {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const doy = Math.floor((d - start) / 864e5);
    return doy % D.dailyDeck.length;
  }
  const daily = () => D.dailyDeck[dailyIndex()];

  function progressPct() {
    const totalTech = D.chapters.reduce(
      (n, c) => n + c.blocks.filter((b) => b.type === 'technique').length, 0);
    const done = Object.keys(store.practiced).length;
    return totalTech ? Math.min(100, Math.round((done / totalTech) * 100)) : 0;
  }

  /* ---------------- top bar ---------------- */
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
  function paintTopbar() {
    $('#greet').textContent =
      `${greeting()} — ${daily().tag.toLowerCase()} is today’s edge.`;
    $('#streakNum').textContent = store.streak || 0;
    const pct = progressPct();
    $('#progPct').textContent = pct + '%';
    const c = 2 * Math.PI * 15.5;
    $('#ringFg').style.strokeDashoffset = c - (c * pct) / 100;
    $('#soundBtn').textContent = store.sound ? '🔊' : '🔈';
  }

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(msg, emoji = '✨', ms = 4200) {
    const el = $('#toast');
    el.innerHTML = `<span class="emoji">${emoji}</span><span>${msg}</span>`;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), ms);
  }

  /* ---------------- particles (ambient, PS5-ish drifting motes) ---------------- */
  (function particles() {
    const cv = $('#particles');
    if (!cv) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = cv.getContext('2d');
    let w, h, pts;
    function resize() {
      w = cv.width = innerWidth; h = cv.height = innerHeight;
      const n = reduce ? 0 : Math.min(70, Math.floor((w * h) / 24000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2 + 0.4, s: Math.random() * 0.25 + 0.05,
        o: Math.random() * 0.4 + 0.1,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y -= p.s; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = `rgba(230,240,255,${p.o})`; ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    resize(); addEventListener('resize', resize);
    if (!reduce) tick();
  })();

  /* ---------------- pointer parallax for tiles ---------------- */
  function attachTilt(el, max = 8) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `translateY(-8px) scale(1.025) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
      });
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  /* ---------------- router ---------------- */
  const routes = {};
  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  function render() {
    const hash = location.hash || '#/home';
    const [, path, arg] = hash.split('/');
    const view = routes[path] ? routes[path](arg) : routes.home();
    const prev = app.firstElementChild;
    const mount = () => {
      app.innerHTML = '';
      app.appendChild(view);
      resolveAssets(app);
      scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      observeReveals();
    };
    if (prev) { prev.classList.add('is-out'); setTimeout(mount, 200); }
    else mount();
    paintTopbar();
  }
  window.addEventListener('hashchange', render);

  /* reveal-on-scroll */
  let io;
  function observeReveals() {
    if (io) io.disconnect();
    io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal', app).forEach((el) => io.observe(el));
  }

  /* helper builders */
  function h(tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // When bundled as a single standalone file, window.__EA maps asset paths to
  // inlined data URIs. On the hosted (multi-file) version it's undefined → no-op.
  function resolveAssets(root) {
    if (!window.__EA || !root) return;
    root.querySelectorAll('img').forEach((im) => {
      const s = im.getAttribute('src');
      if (s && window.__EA[s]) im.src = window.__EA[s];
    });
  }

  /* ============================================================
     HOME HUB
     ============================================================ */
  routes.home = function () {
    const v = h('div', 'view');
    const dd = daily();
    const doneToday = store.dailyDone[todayStr()];

    // header
    const head = h('div', 'hub__head');
    head.innerHTML = `
      <div class="hub__title">
        <h1>The&nbsp;<span>Edge</span></h1>
        <p>Learn · Reflect · Apply</p>
      </div>`;
    v.appendChild(head);

    // daily edge hero
    const daEl = h('section', 'daily');
    daEl.innerHTML = `
      <div class="daily__body">
        <span class="daily__eyebrow"><span class="dot"></span> Your Daily Edge · ${new Date().toLocaleDateString(undefined,{weekday:'long', month:'short', day:'numeric'})}</span>
        <span class="daily__tag">${esc(dd.tag)}</span>
        <h2 class="daily__title">${esc(dd.title)}</h2>
        <p class="daily__text">${esc(dd.body)}</p>
        <div class="daily__actions">
          <button class="btn ${doneToday ? 'btn--done' : 'btn--primary'}" id="dailyDone">
            ${doneToday ? '✓ Practised today' : '<span class="ic">✓</span> I practised this today'}
          </button>
          ${dd.action === 'pomodoro' ? '<button class="btn btn--ghost" id="daPomo"><span class="ic">🍅</span> Run a focus round</button>' : ''}
          ${dd.action === 'breathe' ? '<button class="btn btn--ghost" id="daBreathe"><span class="ic">🌬️</span> Breathe with me</button>' : ''}
          <button class="btn btn--ghost" id="daOpen">Open chapter →</button>
          <button class="btn btn--ghost" id="daRemind" title="Get a gentle daily nudge"><span class="ic">🔔</span> Remind me daily</button>
        </div>
      </div>
      <div class="daily__art"><img src="${dd.art}" alt="" /></div>`;
    v.appendChild(daEl);

    daEl.querySelector('#dailyDone').addEventListener('click', markDailyDone);
    daEl.querySelector('#daOpen').addEventListener('click', () => { sSelect(); go('#/chapter/' + dd.chapter); });
    daEl.querySelector('#daRemind').addEventListener('click', () => window.EdgeRemind());
    const dp = daEl.querySelector('#daPomo'); if (dp) dp.addEventListener('click', () => openTool('pomodoro'));
    const db = daEl.querySelector('#daBreathe'); if (db) db.addEventListener('click', () => openTool('breathe'));

    // rail label
    v.appendChild(h('div', 'rail__label', 'Your Journey — three chapters, one path'));

    // tiles
    const tiles = h('div', 'tiles');
    D.chapters.forEach((c) => {
      const done = c.blocks.filter((b) => b.type === 'technique' && store.practiced[c.id + ':' + b.n]).length;
      const total = c.blocks.filter((b) => b.type === 'technique').length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const t = h('button', 'tile tile--go');
      t.innerHTML = `
        <div class="tile__glow"></div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="tile__kicker">${esc(c.kicker)}</span>
          <span class="tile__num">0${c.index}</span>
        </div>
        <div class="tile__art"><img src="${c.tile}" alt="" /></div>
        <h3 class="tile__title">${esc(c.title.replace(/\n/g, ' '))}</h3>
        <p class="tile__desc">${esc(c.summary)}</p>
        <div class="tile__foot">
          <div class="tile__prog"><i style="width:${pct}%"></i></div>
          <span>${total ? done + '/' + total : 'Read'}</span>
        </div>`;
      t.addEventListener('click', () => { sSelect(); go('#/chapter/' + c.id); });
      attachTilt(t);
      tiles.appendChild(t);
    });

    // commitment tile
    const ct = h('button', 'tile tile--go');
    ct.innerHTML = `
      <div class="tile__glow"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="tile__kicker">${esc(D.closing.kicker)}</span><span class="tile__num">★</span>
      </div>
      <div class="tile__art"><img src="${D.closing.tile}" alt="" /></div>
      <h3 class="tile__title">${esc(D.closing.title.replace(/\n/g,' '))}</h3>
      <p class="tile__desc">Turn insight into a promise. Track the shift you’re making.</p>
      <div class="tile__foot"><div class="tile__prog"><i style="width:${Math.round(Object.values(store.commits).filter(x=>x&&x.done).length/3*100)}%"></i></div><span>Commit</span></div>`;
    ct.addEventListener('click', () => { sSelect(); go('#/commit'); });
    attachTilt(ct); tiles.appendChild(ct);

    // journal tile
    const jt = h('button', 'tile tile--go tile--journal');
    const jCount = Object.values(store.journal).filter((x) => x && x.trim()).length;
    jt.innerHTML = `
      <div class="tile__glow"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="tile__kicker">Your Space</span><span class="tile__num">✎</span>
      </div>
      <div class="tile__art"><img src="${D.introCards.creed.art}" alt="Learn Reflect Apply" style="max-height:110px"/></div>
      <h3 class="tile__title">My Journal</h3>
      <p class="tile__desc">Every reflection you’ve written, in one calm place.</p>
      <div class="tile__foot"><div class="tile__prog"><i style="width:${Math.min(100,jCount*10)}%"></i></div><span>${jCount} note${jCount===1?'':'s'}</span></div>`;
    jt.addEventListener('click', () => { sSelect(); go('#/journal'); });
    attachTilt(jt); tiles.appendChild(jt);

    v.appendChild(tiles);
    return v;
  };

  function markDailyDone() {
    const t = todayStr();
    if (store.dailyDone[t]) { toast('Already logged today — see you tomorrow!', '🔥'); return; }
    store.dailyDone[t] = daily().tag;
    save(); sReward();
    const chip = $('#streakChip'); chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
    const milestone = { 3: 'Three days strong 💪', 7: 'A full week — habit forming!', 14: 'Two weeks of edge!', 30: 'A month. You’ve changed the default.' }[store.streak];
    toast(milestone || `Day ${store.streak} streak logged. Come back tomorrow!`, '🔥');
    render();
  }

  /* ============================================================
     CHAPTER VIEW
     ============================================================ */
  routes.chapter = function (id) {
    const c = D.chapters.find((x) => x.id === id) || D.chapters[0];
    const v = h('div', 'view chap');

    const hero = h('header', 'chap__hero');
    hero.innerHTML = `
      <div class="chap__hero-txt">
        <div class="chap__kicker">${esc(c.kicker)}</div>
        <h1 class="chap__h1">${esc(c.title)}</h1>
        <div class="chap__tag">${esc(c.tagline)}</div>
      </div>
      <div class="chap__hero-art"><img src="${c.hero}" alt=""/></div>`;
    v.appendChild(hero);

    c.blocks.forEach((b) => v.appendChild(renderBlock(c, b)));

    // chapter nav
    const nav = h('div', 'chap-nav reveal');
    const idx = D.chapters.indexOf(c);
    const prev = D.chapters[idx - 1];
    const next = D.chapters[idx + 1];
    nav.innerHTML = `
      ${prev ? `<button class="btn btn--ghost" data-go="#/chapter/${prev.id}">← ${esc(prev.title.replace(/\n/g,' '))}</button>` : '<span></span>'}
      ${next ? `<button class="btn btn--primary" data-go="#/chapter/${next.id}">${esc(next.title.replace(/\n/g,' '))} →</button>`
             : `<button class="btn btn--primary" data-go="#/commit">Make your commitment →</button>`}`;
    nav.querySelectorAll('[data-go]').forEach((btn) =>
      btn.addEventListener('click', () => { sSelect(); go(btn.dataset.go); }));
    v.appendChild(nav);
    return v;
  };

  function sheet(inner) { const s = h('section', 'sheet reveal'); s.appendChild(inner); return s; }

  function renderBlock(c, b) {
    switch (b.type) {
      case 'intro': return introBlock(b);
      case 'compare': return compareBlock(b);
      case 'technique': return techniqueBlock(c, b);
      case 'together': return togetherBlock(b);
      case 'checklist': return checklistBlock(c, b);
      case 'reflect': return reflectBlock(b);
      case 'pillars': return pillarsBlock(b);
      case 'formula': return formulaBlock(b);
      default: return h('div');
    }
  }

  function introBlock(b) {
    const w = h('div');
    if (b.rich2) {
      w.innerHTML = b.rich2.map((r) => `<p class="lede"><b style="color:var(--display)">${esc(r.b)}</b>${esc(r.t)}</p>`).join('');
    }
    if (b.lede) w.appendChild(h('p', 'lede', esc(b.lede)));
    if (b.punch) w.appendChild(h('p', 'punch', esc(b.punch)));
    if (b.accent) w.appendChild(h('p', 'accent-line', esc(b.accent)));
    if (b.body) w.appendChild(h('p', 'body', esc(b.body)));
    if (b.bullets) {
      const ul = h('ul', 'dots'); b.bullets.forEach((x) => ul.appendChild(h('li', null, esc(x)))); w.appendChild(ul);
    }
    if (b.art) { const a = h('div', 'art-wrap art-float'); a.innerHTML = `<img src="${b.art}" alt="">`; w.appendChild(a); }
    return sheet(w);
  }

  function compareBlock(b) {
    const w = h('div');
    w.appendChild(h('h2', 'h2', esc(b.heading)));
    const grid = h('div', 'compare');
    const yes = h('div', b.tone === 'warn' ? 'cmp-card cmp-card--warn' : 'cmp-card');
    yes.innerHTML =
      `<div class="cmp-badge ${b.tone === 'neutral' ? 'cmp-badge--neutral' : 'cmp-badge--yes'}">${b.tone === 'neutral' ? '◆' : '✓'}</div>
       <div class="cmp-title">${esc(b.isTitle)}</div>
       ${b.isLede ? `<div class="cmp-lede">${esc(b.isLede)}</div>` : ''}
       <ul>${b.is.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const no = h('div', b.tone === 'warn' ? 'cmp-card cmp-card--warn' : 'cmp-card');
    no.innerHTML =
      `<div class="cmp-badge ${b.tone === 'neutral' ? 'cmp-badge--neutral' : (b.tone === 'warn' ? 'cmp-badge--no' : 'cmp-badge--no')}">${b.tone === 'neutral' ? '◇' : '✕'}</div>
       <div class="cmp-title">${esc(b.isntTitle)}</div>
       ${b.isntLede ? `<div class="cmp-lede">${esc(b.isntLede)}</div>` : ''}
       <ul>${b.isnt.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    grid.appendChild(yes); grid.appendChild(no); w.appendChild(grid);
    if (b.closing) {
      w.appendChild(h('p', 'closing-quote', esc(b.closing)));
      if (b.closingArt) { const a = h('div', 'art-wrap'); a.innerHTML = `<img src="${b.closingArt}" style="max-height:200px" alt="">`; w.appendChild(a); }
    }
    return sheet(w);
  }

  function techniqueBlock(c, b) {
    const w = h('div');
    w.appendChild(h('div', 'tech-badge', `<b>Technique ${b.n}</b> · <span class="h3" style="margin:0">${esc(b.name)}</span>`));
    if (b.intro) w.appendChild(h('p', 'body', esc(b.intro)));

    if (b.kind === 'accordion') w.appendChild(accordion(b.items));
    if (b.kind === 'pieee') w.appendChild(pieee(b));
    if (b.kind === 'picklejar') w.appendChild(pickleJar(b));
    if (b.kind === 'pomodoro') w.appendChild(pomodoro(b));
    if (b.kind === 'stop') w.appendChild(stopBlock(b));
    if (b.kind === 'reframe') w.appendChild(reframeBlock(b));
    if (b.kind === 'eec') w.appendChild(pieee(b, true));

    // "practise" action
    const pkey = c.id + ':' + b.n;
    const done = store.practiced[pkey];
    const act = h('div', 'center mt');
    const btn = h('button', 'btn ' + (done ? 'btn--done' : 'btn--primary'),
      done ? '✓ Practised' : '<span class="ic">✓</span> Mark as practised');
    btn.addEventListener('click', () => {
      store.practiced[pkey] = store.practiced[pkey] ? undefined : true;
      if (!store.practiced[pkey]) delete store.practiced[pkey];
      save();
      if (store.practiced[pkey]) { sReward(); toast(`“${b.name}” marked as practised.`, '⭐'); }
      render();
    });
    act.appendChild(btn);
    w.appendChild(act);
    return sheet(w);
  }

  function accordion(items) {
    const acc = h('div', 'acc');
    items.forEach((it) => {
      const item = h('div', 'acc__item');
      item.innerHTML = `
        <button class="acc__head"><span class="acc__k">${esc(it.k)}</span><span class="acc__chev">▸</span></button>
        <div class="acc__body"><div class="acc__body-in">${esc(it.v)}</div></div>`;
      const head = item.querySelector('.acc__head');
      const body = item.querySelector('.acc__body');
      head.addEventListener('click', () => {
        const open = item.classList.toggle('open');
        body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
        beep(open ? 620 : 380, 0.05, 'sine', 0.03);
      });
      acc.appendChild(item);
    });
    return acc;
  }

  function pieee(b, isEEC) {
    const w = h('div');
    const grid = h('div', 'pieee');
    b.items.forEach((it) => {
      const cell = h('div', 'pieee__cell');
      cell.innerHTML = `<div class="pieee__letter">${esc(it.k)}</div>
        <div><div class="pieee__t">${esc(it.t)}</div><div class="pieee__v">${esc(it.v)}</div></div>`;
      grid.appendChild(cell);
    });
    if (isEEC) grid.style.gridTemplateColumns = '1fr';
    w.appendChild(grid);
    if (b.formula) w.appendChild(h('div', 'formula', esc(b.formula)));
    if (b.note) { const p = h('p', 'center'); p.appendChild(h('span', 'note note--tag', esc(b.note))); w.appendChild(p); }
    if (b.art) { const a = h('div', 'art-wrap art-float'); a.innerHTML = `<img src="${b.art}" style="max-height:220px" alt="">`; w.appendChild(a); }
    return w;
  }

  /* -------- Pickle Jar (interactive sorter) -------- */
  function pickleJar(b) {
    const w = h('div');
    w.appendChild(h('div', 'jar-wrap'));
    const wrap = w.firstChild;

    const colors = { Rocks: '#34517e', Pebbles: '#4a73aa', Sand: '#8aa8d8', Water: '#aec1e0' };
    const sample = {
      Rocks: ['SLA breach', 'P1 escalation'],
      Pebbles: ['Follow-up', 'Pending validation'],
      Sand: ['Admin task', 'Low-urgency query'],
      Water: ['Optional reading', 'Internal update'],
    };

    const jar = h('div', 'jar');
    jar.innerHTML = '<div class="jar__lid"></div>';
    // four horizontal bands, big at bottom
    const order = ['Water', 'Sand', 'Pebbles', 'Rocks'];
    const heights = { Rocks: 34, Pebbles: 26, Sand: 22, Water: 18 };
    let top = 0;
    order.forEach((k) => {
      const band = h('div', 'jar__layer');
      band.dataset.k = k;
      band.style.bottom = top + '%';
      band.style.height = heights[k] + '%';
      band.style.background = colors[k] + (k === 'Rocks' ? '22' : '14');
      band.innerHTML = `<div class="jar__seg"></div>`;
      jar.appendChild(band);
      top += heights[k];
    });

    const legend = h('div', 'jar-legend');
    b.layers.forEach((l) => {
      const row = h('div', 'jar-row');
      row.style.borderLeftColor = colors[l.k];
      row.innerHTML = `<b>${esc(l.k)}</b> — <span class="tag">${esc(l.tag)}</span><br>
        <span style="font-size:14px;color:var(--ink-soft)">${esc(l.v)}</span><br>
        <span class="rule">${esc(l.rule)}</span>`;
      legend.appendChild(row);
    });

    wrap.appendChild(jar);
    wrap.appendChild(legend);

    // token bank + tap-to-place mini exercise
    const ex = h('div');
    ex.innerHTML = `<p class="body" style="margin-top:16px"><b>Try it:</b> tap a task, then tap the layer it belongs in. Rocks go in first.</p>`;
    const bank = h('div', 'jar-bank');
    const tokens = [];
    Object.entries(sample).forEach(([k, arr]) => arr.forEach((label) => tokens.push({ label, k })));
    tokens.sort(() => 0.5 - ((tokens.indexOf.length) % 2)); // stable-ish shuffle by index
    // simple deterministic shuffle
    const shuffled = tokens.map((t, i) => ({ t, r: (i * 7 + 3) % tokens.length })).sort((a, b2) => a.r - b2.r).map((x) => x.t);
    let selected = null;
    shuffled.forEach((tok) => {
      const el = h('button', 'jar-token');
      el.textContent = tok.label;
      el.style.background = colors[tok.k];
      el.dataset.k = tok.k;
      el.addEventListener('click', () => {
        if (el.classList.contains('placed')) return;
        $$('.jar-token', bank).forEach((x) => x.style.outline = '');
        selected = el; el.style.outline = '3px solid #ffd97a'; sMove();
      });
      bank.appendChild(el);
    });
    jar.querySelectorAll('.jar__layer').forEach((band) => {
      band.addEventListener('click', () => {
        if (!selected) { toast('Pick a task from the bank first.', '👇', 2500); return; }
        const correct = selected.dataset.k === band.dataset.k;
        if (correct) {
          selected.classList.add('placed'); selected.style.outline = '';
          band.querySelector('.jar__seg').appendChild(selected);
          sReward();
          if ($$('.jar-token:not(.placed)', bank).length === 0) toast('Jar packed perfectly — rocks first!', '🫙', 3500);
        } else {
          band.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 });
          toast(`That’s a ${selected.dataset.k.toLowerCase()} task — try another layer.`, '🤔', 2600);
          beep(200, 0.12, 'sawtooth', 0.03);
        }
        selected = null;
      });
    });
    ex.appendChild(bank);
    w.appendChild(ex);
    return w;
  }

  /* -------- Pomodoro (working timer) -------- */
  function pomodoro(b) {
    const w = h('div');
    const pomo = h('div', 'pomo');
    pomo.innerHTML = `
      <div class="pomo__dial">
        <svg viewBox="0 0 240 240"><circle class="pomo__track" cx="120" cy="120" r="110"/>
          <circle class="pomo__prog" cx="120" cy="120" r="110"/></svg>
        <img class="pomo__tomato" src="${b.art}" alt="tomato timer"/>
        <div class="pomo__time">25:00</div>
      </div>
      <div>
        <div class="pomo__phase">Focus round <span class="pill-round"><i class="on"></i><i></i><i></i><i></i></span></div>
        <p class="body">${esc(b.intro)}</p>
        <div class="pomo__ctrl">
          <button class="btn btn--primary" data-a="start"><span class="ic">▶</span> Start 25 min</button>
          <button class="btn btn--ghost" data-a="reset">Reset</button>
        </div>
        <ol class="pomo__steps">${b.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        <p class="note" style="margin-top:12px">${esc(b.outcome)}</p>
      </div>`;
    w.appendChild(pomo);

    const prog = pomo.querySelector('.pomo__prog');
    const timeEl = pomo.querySelector('.pomo__time');
    const phaseEl = pomo.querySelector('.pomo__phase');
    const dots = $$('.pill-round i', pomo);
    const C = 2 * Math.PI * 110;
    prog.style.strokeDasharray = C;

    let phase = 'focus', total = 25 * 60, left = total, timer = null, round = 0;
    function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function paint() {
      timeEl.textContent = fmt(left);
      prog.style.strokeDashoffset = C * (1 - left / total);
    }
    function setPhase(p) {
      phase = p;
      if (p === 'focus') { total = 25 * 60; prog.style.stroke = 'var(--accent)'; phaseEl.childNodes[0].textContent = 'Focus round '; }
      else if (p === 'short') { total = 5 * 60; prog.style.stroke = '#3f8f5b'; phaseEl.childNodes[0].textContent = 'Short break '; }
      else { total = 20 * 60; prog.style.stroke = '#c9803e'; phaseEl.childNodes[0].textContent = 'Long reset '; }
      left = total; paint();
    }
    function tick() {
      left--; paint();
      if (left <= 0) {
        clearInterval(timer); timer = null; sReward();
        if (phase === 'focus') {
          round++; dots.forEach((d, i) => d.classList.toggle('on', i <= round));
          if (round >= 4) { toast('Four rounds done — take a long reset 🌿', '🍅'); setPhase('long'); round = 0; dots.forEach((d, i) => d.classList.toggle('on', i === 0)); }
          else { toast('Ring! Time for a 5-minute break.', '🍅'); setPhase('short'); }
        } else { toast('Break over — back to focus.', '🍅'); setPhase('focus'); }
      }
    }
    pomo.querySelector('[data-a="start"]').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (timer) { clearInterval(timer); timer = null; btn.innerHTML = '<span class="ic">▶</span> Resume'; }
      else { timer = setInterval(tick, 1000); btn.innerHTML = '<span class="ic">❚❚</span> Pause'; sSelect(); }
    });
    pomo.querySelector('[data-a="reset"]').addEventListener('click', () => {
      clearInterval(timer); timer = null; setPhase('focus'); round = 0;
      dots.forEach((d, i) => d.classList.toggle('on', i === 0));
      pomo.querySelector('[data-a="start"]').innerHTML = '<span class="ic">▶</span> Start 25 min';
      sBack();
    });
    // stop timer when leaving view
    window.addEventListener('hashchange', () => { if (timer) { clearInterval(timer); timer = null; } }, { once: true });
    paint();
    return w;
  }

  /* -------- STOP + breathing -------- */
  function stopBlock(b) {
    const w = h('div');
    // breathing guide
    const br = h('div', 'breathe');
    br.innerHTML = `
      <div class="breathe__orb"><div class="breathe__ring"></div><div class="breathe__ball"></div></div>
      <div class="breathe__cue">Breathe with me</div>
      <div class="breathe__count"></div>
      <div class="breathe__hand">${esc(b.breathing.note)}</div>
      <div class="pomo__ctrl" style="margin-top:14px"><button class="btn btn--primary" data-a="br"><span class="ic">🌬️</span> Begin 4·7·8</button></div>`;
    const ball = br.querySelector('.breathe__ball');
    const cue = br.querySelector('.breathe__cue');
    const cnt = br.querySelector('.breathe__count');
    let running = false, seq;
    function phaseRun(name, secs, cls, next) {
      cue.textContent = name; ball.className = 'breathe__ball ' + cls;
      let s = secs; cnt.textContent = s;
      beep(name === 'Inhale' ? 440 : name === 'Exhale' ? 300 : 520, 0.08, 'sine', 0.035);
      seq = setInterval(() => { s--; cnt.textContent = s > 0 ? s : ''; if (s <= 0) { clearInterval(seq); if (running) next(); } }, 1000);
    }
    function cycle() {
      phaseRun('Inhale', b.breathing.in, 'inhale', () =>
        phaseRun('Hold', b.breathing.hold, 'hold', () =>
          phaseRun('Exhale', b.breathing.out, 'exhale', () => { if (running) cycle(); })));
    }
    br.querySelector('[data-a="br"]').addEventListener('click', (e) => {
      running = !running;
      if (running) { e.currentTarget.innerHTML = '<span class="ic">❚❚</span> Stop'; cycle(); }
      else { clearInterval(seq); ball.className = 'breathe__ball'; cue.textContent = 'Breathe with me'; cnt.textContent = ''; e.currentTarget.innerHTML = '<span class="ic">🌬️</span> Begin 4·7·8'; }
    });
    window.addEventListener('hashchange', () => { running = false; clearInterval(seq); }, { once: true });
    w.appendChild(br);

    // STOP steps
    const flow = h('div', 'stop-flow mt');
    b.steps.forEach((s) => {
      const step = h('div', 'stop-step');
      step.innerHTML = `<div class="stop-step__k">${esc(s.k)}</div>
        <div><div class="stop-step__hl">${esc(s.hl)}</div><div class="stop-step__v">${esc(s.v)}</div></div>`;
      flow.appendChild(step);
    });
    w.appendChild(flow);
    return w;
  }

  /* -------- Reframe flip cards -------- */
  function reframeBlock(b) {
    const w = h('div');
    const grid = h('div', 'reframe-grid');
    b.scenarios.forEach((s) => {
      const card = h('div', 'flip');
      card.innerHTML = `
        <div class="flip__inner">
          <div class="flip__face flip__front">
            <div class="flip__n">Scenario ${s.n}</div>
            <div class="flip__lbl">What happened</div>
            <div class="flip__happened">${esc(s.happened)}</div>
            <div class="flip__lbl">Auto story</div>
            <div class="flip__auto">“${esc(s.auto)}”</div>
            <div class="flip__hint">tap to reframe ↻</div>
          </div>
          <div class="flip__face flip__back">
            <div class="flip__n" style="color:#ffd97a">Reframe</div>
            <div class="flip__lbl">New story</div>
            <div class="flip__reframe">${esc(s.reframe)}</div>
            <div class="flip__hint">tap to flip back</div>
          </div>
        </div>`;
      card.addEventListener('click', () => { card.classList.toggle('flipped'); beep(card.classList.contains('flipped') ? 660 : 420, 0.06, 'triangle', 0.035); });
      grid.appendChild(card);
    });
    w.appendChild(grid);
    return w;
  }

  function togetherBlock(b) {
    const w = h('div');
    w.appendChild(h('h2', 'h2', esc(b.heading)));
    const row = h('div', 'together');
    b.items.forEach((it) => {
      const node = h('div', 'together__node');
      node.innerHTML = `<div class="together__bubble">${esc(it.v)}</div><div class="together__k">${esc(it.k)}</div>`;
      row.appendChild(node);
    });
    w.appendChild(row);
    return sheet(w);
  }

  function pillarsBlock(b) {
    const w = h('div');
    w.appendChild(h('h2', 'h2', esc(b.heading)));
    const grid = h('div', 'pillars');
    b.items.forEach((p) => {
      const el = h('div', 'pillar');
      el.innerHTML = `<h4>${esc(p.k)}</h4>${p.v.map((x) => `<p>${esc(x)}</p>`).join('')}`;
      grid.appendChild(el);
    });
    w.appendChild(grid);
    return sheet(w);
  }

  function formulaBlock(b) {
    const w = h('div', 'golden');
    w.appendChild(h('h2', 'h2', esc(b.heading)));
    w.appendChild(h('div', 'golden__f', esc(b.formula)));
    w.appendChild(h('div', 'golden__ex', '<b>Example:</b> ' + esc(b.example)));
    return sheet(w);
  }

  function checklistBlock(c, b) {
    const w = h('div');
    w.appendChild(h('h2', 'h2', esc(b.heading)));
    if (b.sub) w.appendChild(h('p', 'accent-line', esc(b.sub)));

    const makeList = (items, offset) => {
      const ul = h('ul', 'checks');
      items.forEach((it, i) => {
        const rich = typeof it === 'object';
        const label = rich ? `<b>${esc(it.b)}</b> ${esc(it.t)}` : esc(it);
        const key = (c.id + ':' + b.heading + ':' + (offset + i)).replace(/\s+/g, '_');
        const li = h('li', 'check' + (store.checks[key] ? ' done' : ''));
        li.innerHTML = `<span class="check__box"><svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg></span><span class="check__t">${label}</span>`;
        li.addEventListener('click', () => {
          const on = li.classList.toggle('done');
          store.checks[key] = on; save();
          beep(on ? 720 : 360, 0.06, 'sine', 0.035);
        });
        ul.appendChild(li);
      });
      return ul;
    };

    if (b.rich) w.appendChild(makeList(b.rich, 0));
    else if (b.items) w.appendChild(makeList(b.items, 0));

    if (b.section2) {
      w.appendChild(h('p', 'accent-line', esc(b.section2.sub)));
      w.appendChild(makeList(b.section2.items, 100));
    }
    if (b.art) { const a = h('div', 'art-wrap art-float'); a.innerHTML = `<img src="${b.art}" style="max-height:200px" alt="">`; w.appendChild(a); }
    if (b.closing) w.appendChild(h('p', 'closing-quote', esc(b.closing)));
    return sheet(w);
  }

  /* -------- Reflect (journal prompts) -------- */
  function reflectBlock(b) {
    const w = h('div');
    w.appendChild(h('h2', 'h2', esc(b.heading)));
    b.prompts.forEach((q, i) => {
      const key = b.key + ':' + i;
      const wrap = h('div', 'reflect-q');
      wrap.innerHTML = `<div class="reflect-q__q"><span class="n">${i + 1}</span>${esc(q)}</div>`;
      const ta = h('textarea');
      ta.value = store.journal[key] || '';
      ta.placeholder = 'Write freely — this saves privately on your device…';
      const flag = h('div', 'saved-flag', '✓ Saved');
      let t;
      ta.addEventListener('input', () => {
        store.journal[key] = ta.value; clearTimeout(t);
        t = setTimeout(() => { save(); flag.classList.add('show'); setTimeout(() => flag.classList.remove('show'), 1400); }, 500);
      });
      wrap.appendChild(ta); wrap.appendChild(flag);
      w.appendChild(wrap);
    });
    return sheet(w);
  }

  /* ============================================================
     JOURNAL (aggregated reflections)
     ============================================================ */
  routes.journal = function () {
    const v = h('div', 'view');
    v.appendChild(headerBlock('My Journal', 'Every reflection, in one calm place'));
    const map = {};
    D.chapters.forEach((c) => c.blocks.forEach((b) => { if (b.type === 'reflect') map[b.key] = { chapter: c, block: b }; }));
    let any = false;
    Object.entries(map).forEach(([key, { chapter, block }]) => {
      const entries = block.prompts.map((q, i) => ({ q, a: store.journal[key + ':' + i] })).filter((e) => e.a && e.a.trim());
      if (!entries.length) return;
      any = true;
      const s = h('section', 'sheet reveal');
      s.innerHTML = `<h2 class="h2">${esc(chapter.title.replace(/\n/g, ' '))}</h2>`;
      entries.forEach((e) => {
        s.innerHTML += `<div class="reflect-q"><div class="reflect-q__q">${esc(e.q)}</div>
          <p class="body" style="background:var(--paper-2);padding:14px 16px;border-radius:12px;border-left:4px solid var(--accent);white-space:pre-wrap">${esc(e.a)}</p></div>`;
      });
      const open = h('button', 'btn btn--ghost', 'Open chapter →');
      open.style.color = 'var(--accent)'; open.style.border = '1px solid var(--accent)';
      open.addEventListener('click', () => go('#/chapter/' + chapter.id));
      s.appendChild(open);
      v.appendChild(s);
    });
    if (!any) {
      const s = h('section', 'sheet reveal center');
      s.innerHTML = `<img src="${D.introCards.creed.art}" style="max-height:160px;margin:0 auto 12px" alt="Learn Reflect Apply">
        <p class="lede">Your journal is empty — for now.</p>
        <p class="body">Open any chapter and answer a “Let’s Reflect” prompt. Everything you write appears here, saved privately on your device.</p>`;
      const b = h('button', 'btn btn--primary', 'Start with Chapter One →');
      b.addEventListener('click', () => go('#/chapter/prioritisation'));
      s.appendChild(b);
      v.appendChild(s);
    }
    return v;
  };

  /* ============================================================
     COMMITMENT / closing
     ============================================================ */
  routes.commit = function () {
    const v = h('div', 'view');
    const cl = D.closing;

    // congrats hero
    const hero = h('section', 'daily'); hero.style.gridTemplateColumns = '1fr';
    hero.innerHTML = `<div class="daily__body congrats">
      <img class="congrats__art" src="${cl.congratsArt}" alt="Congratulations" style="max-height:280px">
      <div class="congrats__punch">${esc(cl.congrats.punch)}</div>
      <p class="congrats__body">${esc(cl.congrats.body)}</p></div>`;
    v.appendChild(hero);

    cl.commitments.forEach((c) => {
      const s = h('section', 'commit reveal');
      const st = store.commits[c.key] || {};
      s.innerHTML = `
        <h2 class="h2">${esc(c.title)}</h2>
        <div class="commit__lede">${esc(c.lede)}</div>
        <p class="body">${esc(c.body)}</p>
        <p class="accent-line">${esc(c.promptLabel)}</p>
        <p class="reflect-q__q">${esc(c.prompt)}</p>`;
      const ta = h('textarea'); ta.value = st.text || '';
      ta.placeholder = 'Name the one specific shift…';
      const flag = h('div', 'saved-flag', '✓ Saved');
      let t;
      ta.addEventListener('input', () => {
        store.commits[c.key] = Object.assign({}, store.commits[c.key], { text: ta.value });
        clearTimeout(t); t = setTimeout(() => { save(); flag.classList.add('show'); setTimeout(() => flag.classList.remove('show'), 1400); }, 500);
      });
      s.appendChild(ta); s.appendChild(flag);
      const done = st.done;
      const btn = h('button', 'btn ' + (done ? 'btn--done' : 'btn--primary') + ' commit__done',
        done ? '✓ I’m committed' : 'Lock in this commitment');
      btn.addEventListener('click', () => {
        store.commits[c.key] = Object.assign({}, store.commits[c.key], { done: !done });
        save(); if (!done) { sReward(); toast('Commitment locked in. Now live it. 💙', '🤝'); }
        render();
      });
      s.appendChild(btn);
      v.appendChild(s);
    });

    // finally
    const fin = h('section', 'sheet reveal center');
    fin.innerHTML = `<img src="${cl.finallyArt}" style="max-height:200px;margin:0 auto" alt="And finally">
      <p class="lede" style="margin-top:10px">Small, consistent shifts compound. Come back tomorrow for your next Edge.</p>`;
    const back = h('button', 'btn btn--primary', 'Back to home →');
    back.addEventListener('click', () => go('#/home'));
    fin.appendChild(back);
    v.appendChild(fin);
    return v;
  };

  function headerBlock(title, tag) {
    const hero = h('header', 'chap__hero'); hero.style.minHeight = '150px';
    hero.innerHTML = `<div class="chap__hero-txt"><div class="chap__kicker">The Edge</div>
      <h1 class="chap__h1" style="font-size:clamp(30px,5vw,48px)">${esc(title)}</h1>
      <div class="chap__tag">${esc(tag)}</div></div>`;
    return hero;
  }

  /* ---------------- quick tools (from daily nudge) ---------------- */
  function openTool(kind) {
    if (kind === 'pomodoro') { go('#/chapter/prioritisation'); setTimeout(() => scrollToTech('Pomodoro'), 700); }
    if (kind === 'breathe') { go('#/chapter/emotional-intelligence'); setTimeout(() => scrollToTech('STOP'), 700); }
  }
  function scrollToTech(name) {
    const el = $$('.tech-badge', app).find((x) => x.textContent.includes(name) || x.textContent.includes(name.slice(0, 4)));
    if (el) el.closest('.sheet').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------- global controls ---------------- */
  $('#homeBtn').addEventListener('click', () => { sBack(); go('#/home'); });
  $('#soundBtn').addEventListener('click', () => {
    store.sound = !store.sound; save(); paintTopbar();
    if (store.sound) { sSelect(); toast('Sound on — soft cues enabled.', '🔊', 2200); }
  });
  $('#streakChip').addEventListener('click', () => {
    toast(store.streak > 1 ? `${store.streak} days in a row. Keep the edge sharp. 🔥` : 'Log your Daily Edge to build a streak!', '🔥');
  });

  /* keyboard navigation (gamepad-like) */
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA') return;
    const tiles = $$('.tile', app);
    if (!tiles.length) { if (e.key === 'Escape' || e.key === 'Backspace') go('#/home'); return; }
    let idx = tiles.findIndex((t) => t === document.activeElement);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { idx = Math.min(tiles.length - 1, idx + 1); tiles[idx].focus(); sMove(); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { idx = Math.max(0, idx - 1); tiles[idx].focus(); sMove(); e.preventDefault(); }
  });

  /* ---------------- boot ---------------- */
  function start() {
    computeStreak();
    topbar.hidden = false; app.hidden = false;
    if (!location.hash) location.hash = '#/home';
    render();
    // daily nudge toast
    setTimeout(() => {
      const t = todayStr();
      if (store.dailyDone[t]) toast(`Day ${store.streak} — already practised today. 🔥`, '🔥', 4000);
      else toast(`Your Daily Edge is ready: ${daily().tag}.`, '✨', 5000);
    }, 900);
  }

  const boot = $('#boot');
  function leaveBoot() {
    boot.classList.add('is-gone');
    setTimeout(start, 350);
    if (store.sound) sSelect();
  }
  $('#bootEnter').addEventListener('click', leaveBoot);
  // auto-advance after a beat so it feels alive but never traps the user
  setTimeout(() => { if (!boot.classList.contains('is-gone')) leaveBoot(); }, 3200);

  /* ---------------- optional daily reminder ---------------- */
  window.EdgeRemind = async function () {
    if (!('Notification' in window)) return toast('Notifications aren’t supported here.', 'ℹ️');
    const p = await Notification.requestPermission();
    if (p === 'granted') { new Notification('The Edge', { body: `Today’s edge: ${daily().tag}. Take 2 minutes.` }); toast('Daily reminder enabled 🔔', '🔔'); }
  };
})();
