(() => {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const desktop = $('#desktop');
    const isSmall = () => window.matchMedia('(max-width: 768px)').matches;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

    /* ---------- data ---------- */

    const GITHUB = 'swimmingbrain';

    /* projects with a logo of their own, everything else shows the github mark */
    const LOGOS = {
        braincut: 'img/projects/braincut.svg',
        texbrain: 'img/projects/texbrain.svg',
        plakuplus: 'img/projects/plakuplus.png',
        'chingumat-e': 'img/projects/chingumat-e.png',
        vimaya: 'img/projects/vimaya.png',
        'thefoodhexagon-homepage': 'img/projects/thefoodhexagon.png',
        'wo-gsi': 'img/wogsi.svg',
        homepage: 'img/icon-64.png',
    };

    /* small badge in the corner of a project icon: where the link goes */
    function badgeOf(n) {
        const h = n.href || '';
        if (!h) return null;
        if (/github\.com/.test(h)) return { kind: 'github', label: 'github.com' };
        if (/youtube\.com|youtu\.be/.test(h)) return { kind: 'youtube', label: 'youtube.com' };
        if (!/^https?:/.test(h)) return { kind: 'page', label: 'swimmingbrain.dev' };
        return { kind: 'web', label: new URL(h).host.replace(/^www\./, '') };
    }

    const FS = {
        name: '~', type: 'dir', children: [
            { name: 'projects', type: 'dir', github: true, desc: 'Things I built or help build, the rest of my public repos get added from api.github.com', children: [
                { name: 'braincut', type: 'link', repo: 'braincut', lang: 'TypeScript', href: 'https://github.com/swimmingbrain/braincut',
                  desc: 'Browser-based video editor with a multi-track timeline, transitions, effects and export. No accounts, no uploads, no installs.' },
                { name: 'texbrain', type: 'link', repo: 'texbrain', lang: 'Svelte', href: 'https://tex.swimmingbrain.dev',
                  desc: 'LaTeX editor that compiles to PDF in the browser, with live preview, packages on demand and git built in. No accounts, no installs, no servers.' },
                { name: 'plakuplus', type: 'link', lang: 'YouTube', href: 'https://www.youtube.com/@PlakuPlus',
                  desc: 'My YouTube channel: animated explainer videos in Albanian, maths for the Matura and AI from zero.' },
                { name: 'fmtless', type: 'link', repo: 'fmtless', lang: 'C, Python', href: 'https://github.com/swimmingbrain/fmtless',
                  desc: 'Logging for C that leaves the words at home: format strings live in the ELF, never in flash, and the host puts the line back together.' },
                { name: 'arctos-arm', type: 'link', repo: 'arctos-arm', lang: 'Python', href: 'https://github.com/swimmingbrain/arctos-arm',
                  desc: 'Library and CLI for the Arctos robot arm over CAN bus, with kinematics, simulation and ROS 2 / MoveIt 2 integration.' },
                { name: 'chingumat-e', type: 'link', repo: 'chingumat-e', lang: 'JavaScript', href: 'https://github.com/swimmingbrain/chingumat-e',
                  desc: 'Open-source foot-controlled rhythm game: step, stomp and groove.' },
                { name: 'vimaya', type: 'link', lang: 'web app', href: 'https://home.vimaya.app',
                  desc: 'Digital wellness app for healthier screen habits. I am the lead developer.' },
                { name: 'wo-gsi', type: 'link', lang: 'JavaScript', href: 'wogsi-game.html',
                  desc: 'Street View guessing game about Vorarlberg, in German.' },
                { name: 'homepage', type: 'link', repo: 'homepage', lang: 'JavaScript', href: 'https://github.com/swimmingbrain/homepage',
                  desc: 'This site. A small Ubuntu desktop in plain HTML, CSS and JavaScript.' },
            ] },
            { name: 'about.txt', type: 'text', desc: 'Who I am and what I do', text:
`Braian Plaku, online as swimmingbrain.

I work on robotics and machine vision at Julius Blum GmbH in
Vorarlberg, Austria: Python-based inspection software for
production lines, line scan cameras on embedded Linux, deep
learning models and the dashboards around them.

Next to that I study for an MSc in Artificial Intelligence at
JKU Linz and an MSc in Sustainable Energy Systems, and finish a
BSc in Computer Science at FH Vorarlberg, after a BSc in
Electrical Engineering in 2025. I went to school in Shkodër,
Albania, and have lived in Vorarlberg since 2022.` },
            { name: 'skills.txt', type: 'text', desc: 'Languages and tools', text:
`languages    Python, C/C++, Java, Bash, SQL, TypeScript
ml / vision  PyTorch, OpenCV, CNNs, LSTMs, 6D pose estimation,
             camera calibration, industrial image processing
data         data pipelines, Grafana dashboards, KPI monitoring
infra        Linux administration, embedded Linux, Docker, Git, CI/CD
hardware     ESP32, Raspberry Pi, industrial cameras, 3D printing
spoken       Albanian, German, English, some Italian and Korean` },
            { name: 'education.txt', type: 'text', desc: 'Degrees and schools', text:
`2025 -       MSc Artificial Intelligence, JKU Linz
2025 -       MSc Sustainable Energy Systems
2024         exchange semester, Seoul National University of
             Science and Technology (GKS scholarship)
2023 - 2026  BSc Computer Science & Digital Innovation, FH Vorarlberg
             thesis: PLON3R, model-based 6D pose estimation in manufacturing
2022 - 2025  BSc Electrical Engineering (dual), FH Vorarlberg, degree 2025
             thesis: integrating a line scan camera on embedded Linux
2016 - 2022  HTL Peter Mahringer, Shkodër` },
            { name: 'contact.txt', type: 'text', desc: 'Where to find me', text:
`email     braian.plaku@gmail.com
github    github.com/swimmingbrain
linkedin  linkedin.com/in/braian-plaku
location  Dornbirn, Vorarlberg, Austria` },
            { name: 'resume.pdf', type: 'pdf', desc: 'Resume, in German (PDF)' },
        ],
    };

    /* path helpers: paths are arrays of segments below ~ */
    function resolvePath(cwd, str) {
        if (!str) return cwd.slice();
        if (str === '~' || str === '~/') return [];
        const segs = (str.startsWith('~/') || str.startsWith('/')) ? [] : cwd.slice();
        for (const part of str.replace(/^~\//, '').replace(/^\//, '').split('/')) {
            if (!part || part === '.') continue;
            if (part === '..') segs.pop();
            else segs.push(part);
        }
        return segs;
    }

    function getNode(segs) {
        let node = FS;
        for (const seg of segs) {
            if (node.type !== 'dir' || !node.children) return null;
            node = node.children.find(c => c.name === seg);
            if (!node) return null;
        }
        return node;
    }

    const pathString = segs => '~' + (segs.length ? '/' + segs.join('/') : '');

    let repoCache = null;
    async function loadRepos() {
        if (repoCache) return repoCache;
        try {
            const cached = sessionStorage.getItem('sb_repos');
            if (cached) return (repoCache = JSON.parse(cached));
        } catch (e) { /* storage blocked */ }
        const res = await fetch(`https://api.github.com/users/${GITHUB}/repos?type=owner&sort=pushed&per_page=100`);
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const repos = (await res.json()).filter(r => !r.fork).map(r => ({
            name: r.name, type: 'repo', href: r.html_url, lang: r.language,
            desc: r.description || 'No description', stars: r.stargazers_count,
            pushed: r.pushed_at.slice(0, 10),
        }));
        repoCache = repos;
        try { sessionStorage.setItem('sb_repos', JSON.stringify(repos)); } catch (e) { /* ignore */ }
        return repos;
    }

    /* adds the public repos that are not in the hand written list yet */
    async function mergeRepos(node) {
        if (node.merged) return;
        const repos = await loadRepos();
        const have = new Set(node.children.map(c => c.repo || c.name));
        repos.forEach(r => {
            if (!have.has(r.name) && r.name !== GITHUB) node.children.push(r);
        });
        node.merged = true;
    }

    const logoOf = n => n.logo || LOGOS[n.repo] || LOGOS[n.name] || '';

    function openNode(node, segs) {
        if (!node) return false;
        if (node.type === 'pdf') WM.open('resume');
        else if (node.type === 'text') {
            WM.open('terminal');
            document.dispatchEvent(new CustomEvent('terminal:run', { detail: `cat ${pathString(segs)}` }));
        } else if (node.type === 'dir') {
            WM.open('files');
            Files.go(segs);
        } else if (node.href) window.open(node.href, '_blank', 'noopener');
        return true;
    }

    /* ---------- window manager ---------- */

    const WM = (() => {
        let z = 10;
        let placed = 0;
        let focused = null;
        const wins = new Map();
        $$('.window').forEach(w => wins.set(w.dataset.app, w));

        const get = app => (typeof app === 'string' ? wins.get(app) : app);
        const isOpen = win => win.classList.contains('open');

        function sync() {
            $$('.dock-item[data-app]').forEach(item => {
                const win = wins.get(item.dataset.app);
                item.classList.toggle('running', !!win && (isOpen(win) || win.classList.contains('minimized')));
                item.classList.toggle('focused', !!win && win === focused);
            });
            $('#panel-app').textContent = focused ? focused.dataset.name : '';
        }

        function keepOnScreen(win) {
            if (isSmall() || win.classList.contains('maximized')) return;
            const dw = desktop.clientWidth, dh = desktop.clientHeight;
            const w = win.offsetWidth;
            const left = clamp(parseFloat(win.style.left) || 0, -(w - 80), Math.max(0, dw - 80));
            const top = clamp(parseFloat(win.style.top) || 0, 0, Math.max(0, dh - 38));
            win.style.left = `${left}px`;
            win.style.top = `${top}px`;
        }

        function set(win, left, top, width, height) {
            if (width) win.style.width = `${width}px`;
            if (height) win.style.height = `${height}px`;
            win.style.left = `${left}px`;
            win.style.top = `${top}px`;
            win.dataset.placed = '1';
            keepOnScreen(win);
        }

        function place(win) {
            const dw = desktop.clientWidth, dh = desktop.clientHeight;
            const w = Math.min(win.offsetWidth, dw - 24), h = Math.min(win.offsetHeight, dh - 24);
            const n = placed++ % 6;
            set(win, (dw - w) / 2 + n * 24, Math.max(12, (dh - h) / 2 - 20 + n * 24), w, h);
        }

        function focus(app) {
            const win = get(app);
            if (!win || !isOpen(win)) return;
            if (focused && focused !== win) focused.classList.remove('focused');
            win.classList.add('focused');
            win.style.zIndex = ++z;
            focused = win;
            sync();
        }

        function focusTop() {
            const open = $$('.window.open').sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0));
            focused = null;
            if (open[0]) focus(open[0]);
            else sync();
        }

        function open(app) {
            const win = get(app);
            if (!win) return null;
            if (!isOpen(win)) {
                win.classList.remove('minimized');
                win.classList.add('open');
                if (!win.dataset.placed) place(win);
                win.dispatchEvent(new CustomEvent('window:open'));
            }
            focus(win);
            return win;
        }

        function hide(win, minimized) {
            win.classList.remove('open', 'focused');
            win.classList.toggle('minimized', !!minimized);
            if (focused === win) focusTop();
            else sync();
        }

        function close(app) {
            const win = get(app);
            if (win) hide(win, false);
        }

        function minimize(app) {
            const win = get(app);
            if (win) hide(win, true);
        }

        function toggle(app) {
            const win = get(app);
            if (!win) return;
            if (!isOpen(win)) open(win);
            else if (win === focused) minimize(win);
            else focus(win);
        }

        function maximize(app) {
            const win = get(app);
            if (!win || isSmall()) return;
            if (win.classList.contains('maximized')) {
                win.classList.remove('maximized');
                const r = JSON.parse(win.dataset.restore || '{}');
                Object.assign(win.style, r);
            } else {
                const { left, top, width, height } = win.style;
                win.dataset.restore = JSON.stringify({ left, top, width, height });
                win.classList.add('maximized');
            }
            focus(win);
        }

        function setTitle(app, text) {
            const win = get(app);
            if (win) $('.title', win).textContent = text;
        }

        /* titlebar: drag, double click, buttons */
        wins.forEach(win => {
            const bar = $('.titlebar', win);
            let drag = null;

            bar.addEventListener('pointerdown', e => {
                if (e.button !== 0 || e.target.closest('.wbtn')) return;
                focus(win);
                if (isSmall() || win.classList.contains('maximized')) return;
                drag = { x: e.clientX, y: e.clientY, left: parseFloat(win.style.left) || 0, top: parseFloat(win.style.top) || 0 };
                bar.setPointerCapture(e.pointerId);
            });

            bar.addEventListener('pointermove', e => {
                if (!drag) return;
                win.style.left = `${drag.left + e.clientX - drag.x}px`;
                win.style.top = `${drag.top + e.clientY - drag.y}px`;
            });

            const stop = () => {
                if (!drag) return;
                drag = null;
                keepOnScreen(win);
            };
            bar.addEventListener('pointerup', stop);
            bar.addEventListener('pointercancel', stop);

            bar.addEventListener('dblclick', e => {
                if (!e.target.closest('.wbtn')) maximize(win);
            });

            bar.addEventListener('click', e => {
                const btn = e.target.closest('.wbtn');
                if (!btn) return;
                ({ minimize, maximize, close })[btn.dataset.action](win);
            });

            win.addEventListener('pointerdown', () => focus(win), true);
        });

        window.addEventListener('resize', () => wins.forEach(keepOnScreen));

        return { open, close, minimize, toggle, maximize, focus, set, setTitle, get, get focused() { return focused; } };
    })();

    /* ---------- top panel ---------- */

    const clockEl = $('#panel-clock');
    function tick() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}  ${hh}:${mm}`;
        clockEl.title = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    tick();
    setInterval(tick, 15000);

    const menu = $('#system-menu');
    const tray = $('#tray');
    const overview = $('#overview');
    const search = $('#overview-search');

    function setMenu(show) {
        menu.hidden = !show;
        tray.classList.toggle('on', show);
        tray.setAttribute('aria-expanded', String(show));
    }

    function setOverview(show) {
        overview.hidden = !show;
        $('#activities').classList.toggle('on', show);
        $('#activities').setAttribute('aria-expanded', String(show));
        $('#show-apps').classList.toggle('on', show);
        $('#show-apps').setAttribute('aria-expanded', String(show));
        if (show) {
            search.value = '';
            filterApps('');
            search.focus();
        }
    }

    function filterApps(q) {
        q = q.trim().toLowerCase();
        let n = 0;
        $$('.app', overview).forEach(app => {
            const hit = !q || app.textContent.toLowerCase().includes(q);
            app.hidden = !hit;
            n += hit;
        });
        $('#overview-empty').hidden = n > 0;
    }

    tray.addEventListener('click', () => { setOverview(false); setMenu(menu.hidden); });
    $('#activities').addEventListener('click', () => { setMenu(false); setOverview(overview.hidden); });
    $('#show-apps').addEventListener('click', () => { setMenu(false); setOverview(overview.hidden); });
    $('#menu-restart').addEventListener('click', () => location.reload());
    $('#menu-poweroff').addEventListener('click', () => powerOff());

    search.addEventListener('input', () => filterApps(search.value));
    search.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const first = $$('.app', overview).find(a => !a.hidden);
            if (first) first.click();
        }
    });

    overview.addEventListener('click', e => {
        if (e.target === overview) setOverview(false);
    });

    document.addEventListener('pointerdown', e => {
        if (!menu.hidden && !e.target.closest('#system-menu, #tray')) setMenu(false);
    });

    /* any button/link with data-app opens that window */
    document.addEventListener('click', e => {
        const el = e.target.closest('button[data-app], a[data-app]');
        if (!el) return;
        e.preventDefault();
        if (el.classList.contains('dock-item')) WM.toggle(el.dataset.app);
        else WM.open(el.dataset.app);
        setMenu(false);
        setOverview(false);
    });

    $$('.overview a.app').forEach(a => a.addEventListener('click', () => setOverview(false)));

    /* ---------- power off ---------- */

    const poweroff = $('#poweroff');
    const log = $('#poweroff-log');
    let off = false;

    function powerOff() {
        if (off) return;
        off = true;
        setMenu(false);
        setOverview(false);
        poweroff.hidden = false;
        log.textContent = '';
        const lines = [
            'Stopped target Graphical Interface.',
            'Stopped Session 1 of User braian.',
            'Unmounted /home.',
            'Reached target System Power Off.',
        ];
        const step = i => {
            if (i < lines.length) {
                const ok = document.createElement('span');
                ok.className = 'ok';
                ok.textContent = '[  OK  ]';
                log.append(ok, ` ${lines[i]}\n`);
                setTimeout(() => step(i + 1), 140);
            } else {
                log.append('         Powering off.\n');
                setTimeout(() => {
                    log.textContent = '';
                    $('#poweroff-boot').hidden = false;
                }, 900);
            }
        };
        step(0);
    }

    poweroff.addEventListener('click', () => location.reload());

    /* ---------- files ---------- */

    const Files = (() => {
        const view = $('#files-view');
        const crumbs = $('#files-crumbs');
        const status = $('#files-status');
        const back = $('.fbtn[data-nav="back"]');
        const forward = $('.fbtn[data-nav="forward"]');
        let cwd = ['projects'];
        const hist = [];
        const fwd = [];
        let count = 0;

        const icon = n => ({ dir: 'i-files', link: 'i-github', text: 'i-txt', pdf: 'i-pdf', repo: 'i-github' })[n.type];

        function describe(n) {
            const bits = [n.desc];
            if (n.lang) bits.push(n.lang);
            if (n.type === 'repo') bits.push(`★ ${n.stars}`, `pushed ${n.pushed}`);
            const b = badgeOf(n);
            if (b) bits.push(b.label);
            return bits.filter(Boolean).join('  ·  ');
        }

        function setStatus(text) {
            status.textContent = text;
        }

        function idle() {
            setStatus(`${count} item${count === 1 ? '' : 's'}`);
        }

        function renderCrumbs() {
            crumbs.replaceChildren();
            const all = [[], ...cwd.map((_, i) => cwd.slice(0, i + 1))];
            all.forEach(segs => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'crumb' + (segs.length === cwd.length ? ' on' : '');
                b.textContent = segs.length ? segs[segs.length - 1] : 'Home';
                b.addEventListener('click', () => go(segs));
                crumbs.append(b);
            });
        }

        function item(n) {
            const external = n.type === 'link' || n.type === 'repo';
            const el = document.createElement(external ? 'a' : 'button');
            el.className = `file ${n.type}`;
            if (external) {
                el.href = n.href;
                el.target = '_blank';
                el.rel = 'noopener';
            } else {
                el.type = 'button';
                el.addEventListener('click', () => openNode(n, [...cwd, n.name]));
            }
            const logo = logoOf(n);
            let b = badgeOf(n);
            if (b && b.kind === 'github' && !logo) b = null; /* the icon is the github mark already */
            el.innerHTML = '<span class="file-icon">'
                + (logo ? `<img class="logo" src="${logo}" alt="" width="56" height="56">` : `<svg><use href="#${icon(n)}"/></svg>`)
                + (b ? `<span class="badge" title="${b.label}"><svg><use href="#b-${b.kind}"/></svg></span>` : '')
                + '</span><span class="file-name"></span>';
            $('.file-name', el).textContent = n.name;
            el.addEventListener('mouseenter', () => setStatus(describe(n)));
            el.addEventListener('focus', () => setStatus(describe(n)));
            el.addEventListener('mouseleave', idle);
            el.addEventListener('blur', idle);
            return el;
        }

        function render(node) {
            view.replaceChildren(...node.children.map(item));
            count = node.children.length;
            idle();
        }

        async function show() {
            const node = getNode(cwd);
            renderCrumbs();
            WM.setTitle('files', cwd.length ? cwd[cwd.length - 1] : 'Home');
            back.disabled = !hist.length;
            forward.disabled = !fwd.length;
            if (node.github && !node.merged) {
                render(node);
                setStatus('adding the rest from api.github.com');
                try {
                    await mergeRepos(node);
                } catch (e) {
                    setStatus('api.github.com not reachable, this is the fixed list');
                    return;
                }
                if (getNode(cwd) !== node) return;
            }
            render(node);
        }

        function go(segs, nav) {
            const node = getNode(segs);
            if (!node || node.type !== 'dir') return;
            if (!nav) {
                if (segs.join('/') === cwd.join('/')) return show();
                hist.push(cwd);
                fwd.length = 0;
            }
            cwd = segs;
            show();
        }

        back.addEventListener('click', () => { if (hist.length) { fwd.push(cwd); go(hist.pop(), true); } });
        forward.addEventListener('click', () => { if (fwd.length) { hist.push(cwd); go(fwd.pop(), true); } });

        show();
        return { go };
    })();

    /* ---------- document viewer: load the pdf on first open ---------- */

    WM.get('resume').addEventListener('window:open', () => {
        const frame = $('#resume-frame');
        if (!frame.src) frame.src = frame.dataset.src;
    });

    /* ---------- linkedin feed (third party, loads on request) ---------- */

    (() => {
        const box = $('#li-feed');
        const KEY = 'sb_linkedin_feed';
        let loaded = false;

        function load() {
            if (loaded) return;
            loaded = true;
            box.innerHTML = '<div class="elfsight-app-bf7bde62-d1ed-4505-897a-68a34c844df5" data-elfsight-app-lazy></div>';
            const script = document.createElement('script');
            script.src = 'https://elfsightcdn.com/platform.js';
            script.async = true;
            document.head.append(script);
            try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
        }

        $('#li-load').addEventListener('click', load);
        WM.get('linkedin').addEventListener('window:open', () => {
            try { if (localStorage.getItem(KEY)) load(); } catch (e) { /* ignore */ }
        });
    })();

    /* ---------- keyboard ---------- */

    document.addEventListener('keydown', e => {
        if (off) { location.reload(); return; }
        if (e.key === 'Escape') {
            setMenu(false);
            setOverview(false);
        } else if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            WM.open('terminal');
            $('#terminal-input').focus();
        }
    });

    /* ---------- terminal ---------- */

    const Terminal = (() => {
        const el = $('#terminal');
        const out = $('#terminal-output');
        const input = $('#terminal-input');
        const pathEl = $('.terminal-path', el);
        const USER = 'braian';
        const HOST = 'swimmingbrain';
        const SITE_BIRTH = new Date('2024-05-20T01:34:51+02:00');
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let cwd = [];
        const history = [];
        let hi = 0;
        let booted = false;

        const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;
        const promptHtml = () => `${span('t-green b', `${USER}@${HOST}`)}:${span('t-blue b', pathString(cwd))}$ `;

        function print(html = '') {
            const line = document.createElement('div');
            line.className = 'tline';
            line.innerHTML = html;
            out.append(line);
        }
        const printText = text => print(esc(text));
        const scroll = () => { el.scrollTop = el.scrollHeight; };

        function setCwd(segs) {
            cwd = segs;
            pathEl.textContent = pathString(cwd);
            WM.setTitle('terminal', `${USER}@${HOST}: ${pathString(cwd)}`);
        }

        function fmtName(n, suffix = true) {
            if (n.type === 'dir') return span('t-blue b', n.name + (suffix ? '/' : ''));
            if (n.type === 'link' || n.type === 'repo') return span('t-cyan b', n.name);
            return esc(n.name);
        }

        function findByName(name) {
            const walk = (node, segs) => {
                for (const c of node.children || []) {
                    const here = [...segs, c.name];
                    if (c.name === name || c.name === name.replace(/\/$/, '')) return { node: c, segs: here };
                    if (c.type === 'dir') { const hit = walk(c, here); if (hit) return hit; }
                }
                return null;
            };
            return walk(FS, []);
        }

        function browser() {
            const ua = navigator.userAgent;
            const m = ua.match(/(Edg|Firefox|OPR|Chrome|Safari)\/(\d+)/);
            const names = { Edg: 'Edge', OPR: 'Opera' };
            return m ? `${names[m[1]] || m[1]} ${m[2]}` : 'a browser';
        }

        const LOGO = [
            '            .-/+oossssoo+/-.',
            '        `:+ssssssssssssssssss+:`',
            '      -+ssssssssssssssssssyyssss+-',
            '    .ossssssssssssssssssdMMMNysssso.',
            '   /ssssssssssshdmmNNmmyNMMMMhssssss/',
            '  +ssssssssshmydMMMMMMMNddddyssssssss+',
            ' /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/',
            '.ssssssssdMMMNhsssssssssshNMMMdssssssss.',
            '+sssshhhyNMMNyssssssssssssyNMMMysssssss+',
            'ossyNMMMNyMMhsssssssssssssshmmmhssssssso',
            'ossyNMMMNyMMhsssssssssssssshmmmhssssssso',
            '+sssshhhyNMMNyssssssssssssyNMMMysssssss+',
            '.ssssssssdMMMNhsssssssssshNMMMdssssssss.',
            ' /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/',
            '  +sssssssssdmydMMMMMMMMddddyssssssss+',
            '   /ssssssssssshdmNNNNmyNMMMMhssssss/',
            '    .ossssssssssssssssssdMMMNysssso.',
            '      -+sssssssssssssssssyyyssss+-',
            '        `:+ssssssssssssssssss+:`',
            '            .-/+oossssoo+/-.',
        ];

        function neofetch() {
            const days = Math.floor((Date.now() - SITE_BIRTH) / 864e5);
            const title = `${USER}@${HOST}`;
            const rows = [
                ['OS', 'Ubuntu 24.04 LTS x86_64'],
                ['Host', 'Dornbirn, Vorarlberg, AT'],
                ['Uptime', `${days} days`],
                ['Shell', 'bash 5.2'],
                ['Resolution', `${screen.width}x${screen.height}`],
                ['DE', 'GNOME 46'],
                ['Terminal', browser()],
                ['CPU', `${navigator.hardwareConcurrency || '?'} cores`],
                navigator.deviceMemory ? ['Memory', `${navigator.deviceMemory} GiB`] : null,
                ['Work', 'Robotics & Machine Vision, Julius Blum'],
                ['Study', 'MSc AI, JKU Linz + MSc Sustainable Energy Systems'],
                ['Languages', 'Python, C/C++, TypeScript, Bash'],
                ['Tools', 'PyTorch, OpenCV, Docker, Linux'],
            ].filter(Boolean);
            const dark = ['#2e3436', '#cc0000', '#4e9a06', '#c4a000', '#3465a4', '#75507b', '#06989a', '#d3d7cf'];
            const bright = ['#555753', '#ef2929', '#8ae234', '#fce94f', '#729fcf', '#ad7fa8', '#34e2e2', '#eeeeec'];
            const blocks = cols => cols.map(c => `<span class="t-block" style="background:${c}"></span>`).join('');
            const info = [
                span('t-green b', title),
                esc('-'.repeat(title.length)),
                ...rows.map(([k, v]) => `${span('t-key', k)}: ${esc(v)}`),
                '',
                blocks(dark),
                blocks(bright),
            ];
            const wide = el.clientWidth >= 640;
            const lines = wide ? LOGO.length : info.length;
            for (let i = 0; i < lines; i++) {
                const logo = wide ? span('t-orange', LOGO[i].padEnd(41)) : '';
                print(logo + (wide && info[i] !== undefined ? '  ' : '') + (info[i] || ''));
            }
        }

        function ls(args) {
            const long = args.some(a => /^-\w*l/.test(a));
            const target = args.find(a => !a.startsWith('-'));
            const node = getNode(resolvePath(cwd, target || ''));
            if (!node) return printText(`ls: cannot access '${target}': No such file or directory`);
            if (node.type !== 'dir') return print(fmtName(node));
            if (node.github && !node.merged) {
                return mergeRepos(node).then(() => { ls(args); scroll(); }, () => { node.merged = true; ls(args); scroll(); });
            }
            if (!node.children.length) return;
            if (long) node.children.forEach(n => print(`${fmtName(n)}${' '.repeat(Math.max(1, 18 - n.name.length))}${esc(n.desc || '')}`));
            else print(node.children.map(n => fmtName(n)).join('  '));
        }

        function cd(args) {
            const segs = args[0] === undefined ? [] : resolvePath(cwd, args[0]);
            const node = getNode(segs);
            if (!node) return printText(`bash: cd: ${args[0]}: No such file or directory`);
            if (node.type !== 'dir') return printText(`bash: cd: ${args[0]}: Not a directory`);
            setCwd(segs);
            if (node.github && !node.merged) mergeRepos(node).catch(() => {});
        }

        function cat(args) {
            if (!args.length) return printText('cat: missing file operand');
            for (const a of args) {
                const segs = resolvePath(cwd, a);
                const node = getNode(segs);
                if (!node) printText(`cat: ${a}: No such file or directory`);
                else if (node.type === 'dir') printText(`cat: ${a}: Is a directory`);
                else if (node.type === 'text') printText(node.text);
                else if (node.type === 'pdf') { printText(`${a}: PDF document, opening in Document Viewer`); WM.open('resume'); }
                else printText(`${a}: symbolic link to ${node.href}`);
            }
        }

        const APPS = { about: 'about', files: 'files', linkedin: 'linkedin', resume: 'resume', terminal: 'terminal', cookies: 'cookies', privacy: 'privacy', terms: 'terms' };

        function open(args) {
            const name = args[0];
            if (!name) return printText('open: what? try: open braincut, open about, open resume.pdf');
            if (APPS[name]) return WM.open(APPS[name]);
            if (name === '.') return openNode(getNode(cwd), cwd);
            const segs = resolvePath(cwd, name);
            let node = getNode(segs);
            let where = segs;
            if (!node) { const hit = findByName(name); if (hit) { node = hit.node; where = hit.segs; } }
            if (!node) return printText(`open: ${name}: not found`);
            if (node.href) printText(`opening ${node.href}`);
            openNode(node, where);
        }

        function history_() {
            history.forEach((h, i) => printText(`${String(i + 1).padStart(5)}  ${h}`));
        }

        function uptime() {
            const days = Math.floor((Date.now() - SITE_BIRTH) / 864e5);
            const t = new Date().toTimeString().slice(0, 8);
            printText(` ${t} up ${days} days,  1 user`);
        }

        function echo(args) {
            const vars = { USER, HOME: '/home/braian', SHELL: '/bin/bash', HOSTNAME: HOST, PWD: pathString(cwd).replace('~', '/home/braian') };
            printText(args.join(' ').replace(/\$(\w+)/g, (m, k) => (k in vars ? vars[k] : '')).replace(/^"(.*)"$/, '$1'));
        }

        function rm(args) {
            if (args.includes('/') || args.includes('/*')) {
                printText("rm: it is dangerous to operate recursively on '/'");
                printText('rm: use --no-preserve-root to override this failsafe');
            } else if (args.length) printText(`rm: cannot remove '${args.filter(a => !a.startsWith('-'))[0] || ''}': Read-only file system`);
            else printText('rm: missing operand');
        }

        function apt() {
            printText('E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)');
            printText('E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?');
        }

        const HELP = [
            ['ls [-l] [path]', 'list a directory'],
            ['cd <dir>', 'change directory'],
            ['cat <file>', 'print a file'],
            ['open <name>', 'open a project, file or app'],
            ['neofetch', 'system summary'],
            ['github, linkedin, resume, email', 'shortcuts'],
            ['pwd, echo, date, uptime, whoami, uname', 'the usual'],
            ['history, clear, exit', ''],
        ];

        const COMMANDS = {
            help: () => HELP.forEach(([c, d]) => print(`  ${span('t-green', c.padEnd(40))}${esc(d)}`)),
            ls, dir: ls, cd, cat, open, 'xdg-open': open, neofetch,
            pwd: () => printText(pathString(cwd).replace('~', '/home/braian')),
            clear: () => { out.replaceChildren(); },
            history: history_,
            date: () => printText(new Date().toString()),
            uptime,
            whoami: () => printText(USER),
            hostname: () => printText(HOST),
            uname: args => printText(args.includes('-a') ? `Linux ${HOST} 6.8.0 #1 SMP x86_64 GNU/Linux` : 'Linux'),
            echo,
            exit: () => WM.close('terminal'),
            github: () => window.open('https://github.com/swimmingbrain', '_blank', 'noopener'),
            linkedin: () => WM.open('linkedin'),
            resume: () => WM.open('resume'),
            email: () => { location.href = 'mailto:braian.plaku@gmail.com'; },
            about: () => cat(['~/about.txt']),
            skills: () => cat(['~/skills.txt']),
            contact: () => cat(['~/contact.txt']),
            projects: () => ls(['-l', '~/projects']),
            sudo: () => printText(`${USER} is not in the sudoers file.  This incident will be reported.`),
            su: () => printText('su: Authentication failure'),
            rm, apt, 'apt-get': apt, snap: apt,
            vim: () => printText('vim: no tty here. cat <file> works.'),
            vi: () => printText('vi: no tty here. cat <file> works.'),
            nano: () => printText('nano: no tty here. cat <file> works.'),
            emacs: () => printText('emacs: no tty here, and no time either.'),
            poweroff: powerOff, shutdown: powerOff, halt: powerOff,
            reboot: () => location.reload(),
        };

        function run(raw) {
            print(promptHtml() + esc(raw));
            const line = raw.trim();
            if (line) {
                history.push(line);
                hi = history.length;
                const [cmd, ...args] = line.split(/\s+/);
                if (COMMANDS[cmd]) COMMANDS[cmd](args, line);
                else printText(`${cmd}: command not found`);
            }
            scroll();
        }

        function complete() {
            const val = input.value;
            const parts = val.split(/\s+/);
            const last = parts[parts.length - 1];
            let cands;
            if (parts.length === 1) {
                cands = Object.keys(COMMANDS).filter(c => c.startsWith(last));
            } else {
                const slash = last.lastIndexOf('/');
                const dirStr = slash >= 0 ? last.slice(0, slash + 1) : '';
                const base = slash >= 0 ? last.slice(slash + 1) : last;
                const node = getNode(resolvePath(cwd, dirStr));
                if (!node || !node.children) return;
                cands = node.children.filter(c => c.name.startsWith(base)).map(c => dirStr + c.name + (c.type === 'dir' ? '/' : ''));
            }
            if (cands.length === 1) {
                parts[parts.length - 1] = cands[0];
                input.value = parts.join(' ') + (cands[0].endsWith('/') ? '' : ' ');
            } else if (cands.length > 1) {
                print(promptHtml() + esc(val));
                printText(cands.join('  '));
                scroll();
            }
        }

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const v = input.value;
                input.value = '';
                run(v);
            } else if (e.key === 'ArrowUp') {
                if (hi > 0) input.value = history[--hi];
                setTimeout(() => input.setSelectionRange(input.value.length, input.value.length));
            } else if (e.key === 'ArrowDown') {
                input.value = hi < history.length - 1 ? history[++hi] : (hi = history.length, '');
            } else if (e.key === 'Tab') {
                complete();
            } else if (e.ctrlKey && e.key === 'l') {
                out.replaceChildren();
            } else if (e.ctrlKey && e.key === 'c') {
                print(promptHtml() + esc(input.value) + '^C');
                input.value = '';
                scroll();
            } else if (e.ctrlKey && e.key === 'u') {
                input.value = '';
            } else return;
            e.preventDefault();
        });

        el.addEventListener('mouseup', () => {
            if (!getSelection().toString()) input.focus();
        });

        function typeAndRun(cmd) {
            if (reduced) return run(cmd);
            let i = 0;
            input.value = '';
            const t = setInterval(() => {
                input.value = cmd.slice(0, ++i);
                if (i >= cmd.length) {
                    clearInterval(t);
                    setTimeout(() => { input.value = ''; run(cmd); }, 220);
                }
            }, 55);
        }

        function boot() {
            if (booted) return;
            booted = true;
            typeAndRun('ls');
        }

        WM.get('terminal').addEventListener('window:open', () => { input.focus(); boot(); });
        document.addEventListener('terminal:run', e => { run(e.detail); input.focus(); });

        return { run, boot };
    })();

    /* ---------- boot layout ---------- */

    function layout() {
        const dw = desktop.clientWidth, dh = desktop.clientHeight;
        if (isSmall()) {
            WM.open('about');
            return;
        }
        const m = 16, gap = 16;
        const about = WM.open('about');
        const aboutW = dw < 1000 ? 400 : 460;
        const aboutH = Math.min(dh - 2 * m, $('.content', about).scrollHeight + 40);
        WM.set(about, m, m, aboutW, aboutH);
        const colX = m + aboutW + gap;
        const colW = Math.min(860, dw - colX - m);
        if (dw < 1000) {
            WM.set(WM.open('terminal'), colX, m, colW, Math.min(360, aboutH));
        } else {
            const filesH = Math.round(aboutH * 0.55);
            WM.set(WM.open('files'), colX, m, colW, filesH);
            WM.set(WM.open('terminal'), colX, m + filesH + gap, colW, aboutH - filesH - gap);
        }
        $('#terminal-input').focus();
    }

    layout();
    /* the about window is sized from its text, so measure again once the fonts are in */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!isSmall()) layout(); });
})();
