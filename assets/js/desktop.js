(() => {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const desktop = $('#desktop');
    const isSmall = () => window.matchMedia('(max-width: 768px)').matches;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

    /* ---------- data ---------- */

    const GITHUB = 'swimmingbrain';

    const FS = {
        name: '~', type: 'dir', children: [
            { name: 'projects', type: 'dir', desc: 'Things I built or help build', children: [
                { name: 'braincut', type: 'link', lang: 'TypeScript', href: 'https://github.com/swimmingbrain/braincut',
                  desc: 'Browser-based video editor with a multi-track timeline, transitions, effects and export. No accounts, no uploads, no installs.' },
                { name: 'fmtless', type: 'link', lang: 'C, Python', href: 'https://github.com/swimmingbrain/fmtless',
                  desc: 'Logging for C that leaves the words at home: format strings live in the ELF, never in flash, and the host puts the line back together.' },
                { name: 'arctos-arm', type: 'link', lang: 'Python', href: 'https://github.com/swimmingbrain/arctos-arm',
                  desc: 'Library and CLI for the Arctos robot arm over CAN bus, with kinematics, simulation and ROS 2 / MoveIt 2 integration.' },
                { name: 'chingumat-e', type: 'link', lang: 'JavaScript', href: 'https://github.com/swimmingbrain/chingumat-e',
                  desc: 'Open-source foot-controlled rhythm game: step, stomp and groove.' },
                { name: 'vimaya', type: 'link', lang: 'web app', href: 'https://home.vimaya.app',
                  desc: 'Digital wellness app for healthier screen habits. I am the lead developer.' },
                { name: 'wo-gsi', type: 'link', lang: 'JavaScript', href: 'wogsi-game.html',
                  desc: 'Street View guessing game about Vorarlberg, in German.' },
                { name: 'github', type: 'dir', github: true, children: null,
                  desc: 'Public repositories, fetched live from api.github.com' },
            ] },
            { name: 'about.txt', type: 'text', desc: 'Who I am and what I do', text:
`Braian Plaku, online as swimmingbrain.

I work on robotics and machine vision at Julius Blum GmbH in
Vorarlberg, Austria: Python-based inspection software for
production lines, line scan cameras on embedded Linux, deep
learning models and the dashboards around them.

Next to that I study for an MSc in Artificial Intelligence at
JKU Linz and finish a BSc in Computer Science at FH Vorarlberg,
after a BSc in Electrical Engineering. I went to school in
Shkodër, Albania, and have lived in Vorarlberg since 2022.` },
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
2024         exchange semester, Seoul National University of
             Science and Technology (GKS scholarship)
2023 - 2026  BSc Computer Science & Digital Innovation, FH Vorarlberg
             thesis: PLON3R, model-based 6D pose estimation in manufacturing
2022 - 2025  BSc Electrical Engineering (dual), FH Vorarlberg
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
        if (!str || str === '~' || str === '~/') return [];
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
            const w = win.offsetWidth, h = win.offsetHeight;
            const left = clamp(parseFloat(win.style.left) || 0, -(w - 80), Math.max(0, dw - 80));
            const top = clamp(parseFloat(win.style.top) || 0, 0, Math.max(0, dh - 38));
            win.style.left = `${left}px`;
            win.style.top = `${top}px`;
            void h;
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

        const icon = n => ({ dir: 'i-files', link: 'i-folder-link', text: 'i-txt', pdf: 'i-pdf', repo: 'i-github' })[n.type];

        function describe(n) {
            const bits = [n.desc];
            if (n.lang) bits.push(n.lang);
            if (n.type === 'repo') bits.push(`★ ${n.stars}`, `pushed ${n.pushed}`);
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
            el.innerHTML = `<svg><use href="#${icon(n)}"/></svg><span></span>`;
            $('span', el).textContent = n.name;
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
            if (node.github && !node.children) {
                view.replaceChildren();
                setStatus('Loading repositories from api.github.com…');
                try {
                    node.children = await loadRepos();
                } catch (e) {
                    view.innerHTML = '<p class="files-empty">Could not reach api.github.com. <a href="https://github.com/swimmingbrain" target="_blank" rel="noopener">Open GitHub instead.</a></p>';
                    setStatus(e.message);
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

    (function initTerminal() {
        const terminalEl = $('#terminal');
        const outputEl = $('#terminal-output');
        const inputEl = $('#terminal-input');
        if (!terminalEl || !outputEl || !inputEl) return;

        const user = 'braian';
        const host = 'swimmingbrain';
        let cwd = '~';
        const history = [];
        let historyIndex = -1;

        function prompt() {
            return `${user}@${host}:${cwd}$`;
        }

        function scrollToBottom() {
            terminalEl.scrollTop = terminalEl.scrollHeight;
        }

        function write(text = '') {
            outputEl.textContent += (outputEl.textContent ? '\n' : '') + text;
            scrollToBottom();
        }

        function handleCommand(line) {
            const trimmed = line.trim();
            if (!trimmed) return;
            write(`${prompt()} ${line}`);
            const [cmd, ...args] = trimmed.split(' ');
            switch (cmd) {
                case 'help':
                    write('Available commands: help, clear, neofetch, ls, cat, echo, date, whoami, linkedin');
                    break;
                case 'clear':
                    outputEl.textContent = '';
                    break;
                case 'linkedin':
                    write('Opening LinkedIn profile...');
                    WM.open('linkedin');
                    break;
                case 'neofetch':
                    write(`       _,met$$$$$gg.           ${user}@${host}
    ,g$$$$$$$$$$$$$$$P.        --------------------
  ,g$$P"     """Y$$.".         OS: Ubuntu 24.04 LTS x86_64
 ,$$P'              \`$$$.      Shell: bash 5.1.16
',$$P       ,ggs.     \`$$b:    Uptime: ∞ (always learning)
\`d$$'     ,$P"'   .    $$$     Packages: npm, pip, cargo
 $$P      d$'     ,    $$P     Resolution: 4K (seeing clearly)
 $$:      $$.   -    ,d$$'     DE: GNOME 45
 $$;      Y$b._   _,d$P'       Terminal: gnome-terminal
 Y$$.    \`.\`"Y$$$$P"'          CPU: Neural Network @ 100%
 \`$$b      "-.__               Memory: Unlimited potential
  \`Y$$
   \`Y$$.                       Languages: Python, JS, C++, Rust
     \`$$b.                     Frameworks: TensorFlow, React, ROS
       \`Y$$b.                  Tools: Docker, K8s, Git
          \`"Y$b._              Status: Caffeinated
              \`"""             LinkedIn: Connected ✓`);
                    break;
                case 'ls':
                    if (args.join(' ') === '-la skills/' || args.join(' ') === '-la skills') {
                        write(`drwxr-xr-x  8 ${user} ${user} 4096 Oct 19 14:22 .
drwxr-xr-x 12 ${user} ${user} 4096 Oct 19 14:22 ..
drwxr-xr-x  3 ${user} ${user} 4096 Oct 19 14:22 automation/
drwxr-xr-x  5 ${user} ${user} 4096 Oct 19 14:22 ai-ml/
drwxr-xr-x  4 ${user} ${user} 4096 Oct 19 14:22 electrical-engineering/
drwxr-xr-x  6 ${user} ${user} 4096 Oct 19 14:22 app-development/
drwxr-xr-x  2 ${user} ${user} 4096 Oct 19 14:22 embedded-systems/
drwxr-xr-x  3 ${user} ${user} 4096 Oct 19 14:22 robotics/`);
                    } else {
                        write('about  projects  linkedin  skills  docs');
                    }
                    break;
                case 'cat':
                    if (args[0] === '/etc/motd') {
                        write(`╔══════════════════════════════════════════════════╗
║  Welcome to SwimmingBrain Development Environment     ║
║  "Where neurons meet silicon"                         ║
║                                                       ║
║  Current Focus: Industrial AI & Automation            ║
║  Coffee Level: ████████░░ 80%                        ║
║  Cat Status: Purring                                  ║
║  LinkedIn: https://linkedin.com/in/braian-plaku       ║
╚══════════════════════════════════════════════════╝`);
                    } else {
                        write(`cat: ${args[0] || ''}: No such file or directory`);
                    }
                    break;
                case 'echo':
                    write(args.join(' '));
                    break;
                case 'date':
                    write(new Date().toString());
                    break;
                case 'whoami':
                    write(user);
                    break;
                default:
                    write(`${cmd}: command not found`);
            }
        }

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = inputEl.value;
                if (value.trim()) history.push(value);
                historyIndex = history.length;
                handleCommand(value);
                inputEl.value = '';
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                if (history.length && historyIndex > 0) {
                    historyIndex--;
                    inputEl.value = history[historyIndex];
                    setTimeout(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length), 0);
                }
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                if (history.length && historyIndex < history.length - 1) {
                    historyIndex++;
                    inputEl.value = history[historyIndex];
                } else {
                    historyIndex = history.length;
                    inputEl.value = '';
                }
                e.preventDefault();
            } else if (e.key === 'Escape') {
                inputEl.value = '';
            }
        });

        terminalEl.addEventListener('mouseup', () => {
            if (!getSelection().toString()) inputEl.focus();
        });
        WM.get('terminal').addEventListener('window:open', () => inputEl.focus());

        write(`${prompt()} neofetch`);
        handleCommand('neofetch');
        write(`${prompt()} ls -la skills/`);
        handleCommand('ls -la skills/');
        write(`${prompt()} cat /etc/motd`);
        handleCommand('cat /etc/motd');
    })();

    /* ---------- boot layout ---------- */

    function layout() {
        const dw = desktop.clientWidth, dh = desktop.clientHeight;
        if (isSmall()) {
            WM.open('about');
            return;
        }
        if (dw < 1000) {
            WM.set(WM.open('about'), 24, 24, 420, Math.min(560, dh - 60));
            WM.set(WM.open('terminal'), 200, Math.max(60, dh - 400), Math.min(640, dw - 230), 360);
            return;
        }
        WM.set(WM.open('about'), 48, 32, 440, Math.min(580, dh - 70));
        WM.set(WM.open('files'), 520, 32, Math.min(640, dw - 560), 420);
        WM.set(WM.open('terminal'), 380, Math.max(150, dh - 440), Math.min(680, dw - 420), 400);
        $('#terminal-input').focus();
    }

    layout();
})();
