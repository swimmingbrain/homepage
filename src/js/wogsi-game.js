(() => {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const KEY = 'AIzaSyDyiDpg_8VvRn7QgjY48tKL470fAPvYees';
    const API = 'https://wogsi.swimmingbrain.dev';
    const ROUNDS = 5;
    const MAX_POINTS = 5000;
    const LIMIT = 120;      /* seconds per round */
    const FREE = 30;        /* seconds without any deduction */

    /* rough outline of Vorarlberg, lat/lng, clockwise from the Old Rhine mouth */
    const VBG = [
        [47.470, 9.575], [47.500, 9.655], [47.490, 9.690], [47.500, 9.740], [47.540, 9.750], [47.562, 9.745],
        [47.578, 9.770], [47.556, 9.822], [47.537, 9.885], [47.495, 9.935], [47.468, 9.985], [47.437, 10.020],
        [47.410, 10.070], [47.375, 10.105], [47.375, 10.170], [47.365, 10.215], [47.320, 10.215], [47.290, 10.180],
        [47.280, 10.130], [47.255, 10.200], [47.220, 10.220], [47.190, 10.200], [47.135, 10.220], [47.100, 10.190],
        [47.060, 10.170], [47.020, 10.130], [46.950, 10.120], [46.880, 10.080], [46.850, 10.060], [46.870, 9.980],
        [46.920, 9.920], [46.960, 9.870], [47.000, 9.820], [47.040, 9.750], [47.060, 9.680], [47.080, 9.620],
        [47.120, 9.570], [47.160, 9.550], [47.210, 9.560], [47.250, 9.530], [47.300, 9.560], [47.350, 9.580],
        [47.400, 9.620], [47.450, 9.630],
    ];
    const BBOX = { minLat: 46.85, maxLat: 47.58, minLng: 9.53, maxLng: 10.22 };

    /* town centres, used when the random search finds nothing */
    const SEEDS = [
        [47.503, 9.747], [47.412, 9.734], [47.238, 9.599], [47.155, 9.822], [47.080, 9.920], [47.431, 9.660],
        [47.366, 9.686], [47.333, 9.635], [47.270, 9.648], [47.487, 9.689], [47.384, 9.901], [47.432, 9.896],
        [47.208, 10.142], [47.328, 10.160], [46.984, 10.034], [47.183, 9.699], [47.354, 10.185], [47.310, 10.020],
        [47.100, 9.740], [47.463, 9.747], [47.255, 9.622], [47.302, 9.603], [47.129, 9.812], [47.404, 9.977],
    ];

    const fmtNum = n => Math.round(n).toLocaleString('de-AT');
    const fmtKm = d => d < 1
        ? `${Math.round(d * 1000)} m`
        : `${d.toLocaleString('de-AT', { maximumFractionDigits: 1 })} km`;
    const fmtTime = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function dist(a, b) {
        const R = 6371;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }

    function inside(lat, lng) {
        let ok = false;
        for (let i = 0, j = VBG.length - 1; i < VBG.length; j = i++) {
            const [yi, xi] = VBG[i], [yj, xj] = VBG[j];
            if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) ok = !ok;
        }
        return ok;
    }

    function randomPoint() {
        for (let i = 0; i < 200; i++) {
            const lat = BBOX.minLat + Math.random() * (BBOX.maxLat - BBOX.minLat);
            const lng = BBOX.minLng + Math.random() * (BBOX.maxLng - BBOX.minLng);
            if (inside(lat, lng)) return [lat, lng];
        }
        return seedPoint();
    }

    function seedPoint() {
        const s = SEEDS[Math.floor(Math.random() * SEEDS.length)];
        return [s[0] + (Math.random() - 0.5) * 0.02, s[1] + (Math.random() - 0.5) * 0.03];
    }

    /* full points inside the first 30 seconds, then down to half at the limit */
    function timeFactor(t) {
        if (t <= FREE) return 1;
        return Math.max(0.5, 1 - 0.5 * (t - FREE) / (LIMIT - FREE));
    }

    function pointsFor(d, t) {
        if (d === null) return 0;
        const base = d < 0.15 ? MAX_POINTS : MAX_POINTS * Math.exp(-d / 10);
        return Math.round(base * timeFactor(t));
    }

    /* ---------- street view lookup ---------- */

    async function lookup(lat, lng, radius) {
        const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=${radius}&source=outdoor&key=${KEY}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const d = await res.json();
        if (d.status !== 'OK' || !/Google/.test(d.copyright || '')) return null;
        if (!inside(d.location.lat, d.location.lng)) return null;
        return { lat: d.location.lat, lng: d.location.lng, pano: d.pano_id, date: d.date };
    }

    async function findPlace(used) {
        for (let i = 0; i < 16; i++) {
            const wide = i < 11;
            const [lat, lng] = wide ? randomPoint() : seedPoint();
            let p = null;
            try { p = await lookup(lat, lng, wide ? 2500 : 1200); } catch (e) { p = null; }
            if (p && used.every(u => dist(u, p) > 2)) return p;
        }
        return null;
    }

    /* ---------- place names from osm, shown after the guess ---------- */

    async function placeName(p) {
        if (p.name !== undefined) return p.name;
        p.name = '';
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${p.lat}&lon=${p.lng}&format=json&zoom=10&accept-language=de`;
            const d = await (await fetch(url)).json();
            const a = d.address || {};
            p.name = a.village || a.town || a.city || a.municipality || d.name || '';
        } catch (e) { /* no name then */ }
        return p.name;
    }

    /* ---------- google maps js (labels off) with embed fallback ---------- */

    let mapsOk = null;
    let panorama = null;
    let mapsPromise = null;

    function loadMaps() {
        if (mapsPromise) return mapsPromise;
        mapsPromise = new Promise(resolve => {
            window.__wogsiMaps = () => { mapsOk = mapsOk !== false; resolve(mapsOk); };
            window.gm_authFailure = () => { mapsOk = false; resolve(false); showEmbed(state.place); };
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=__wogsiMaps&loading=async&v=weekly`;
            s.async = true;
            s.onerror = () => { mapsOk = false; resolve(false); };
            document.head.append(s);
            setTimeout(() => { if (mapsOk === null) { mapsOk = false; resolve(false); } }, 9000);
        });
        return mapsPromise;
    }

    function showEmbed(place) {
        if (!place) return;
        const el = $('#pano');
        el.replaceChildren();
        panorama = null;
        const f = document.createElement('iframe');
        f.src = `https://www.google.com/maps/embed/v1/streetview?key=${KEY}&pano=${place.pano}&heading=${state.heading}&pitch=0&fov=90`;
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.allowFullscreen = true;
        f.title = 'Street View';
        el.append(f);
    }

    async function showPano(place) {
        state.heading = Math.floor(Math.random() * 360);
        const ok = await loadMaps();
        if (!ok) return showEmbed(place);
        const el = $('#pano');
        const pov = { heading: state.heading, pitch: 0 };
        if (!panorama) {
            el.replaceChildren();
            panorama = new google.maps.StreetViewPanorama(el, {
                pano: place.pano,
                pov,
                zoom: 0,
                addressControl: false,
                showRoadLabels: false,
                fullscreenControl: false,
                zoomControl: false,
                panControl: false,
                motionTracking: false,
                motionTrackingControl: false,
                enableCloseButton: false,
                clickToGo: true,
                linksControl: true,
            });
        } else {
            panorama.setPano(place.pano);
            panorama.setPov(pov);
            panorama.setZoom(0);
        }
    }

    function resetPano() {
        if (!state.place) return;
        if (panorama) {
            panorama.setPano(state.place.pano);
            panorama.setPov({ heading: state.heading, pitch: 0 });
            panorama.setZoom(0);
        } else {
            showEmbed(state.place);
        }
    }

    /* ---------- leaflet maps ---------- */

    /* plain osm tiles, darkened in css. carto basemaps want an api key now */
    const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    const pin = cls => L.divIcon({ className: `pin ${cls || ''}`, iconSize: [14, 14], iconAnchor: [7, 7] });
    let guessMap = null;
    let guessMarker = null;
    let resultMap = null;

    function initGuessMap() {
        guessMap = L.map('map', { zoomControl: true, attributionControl: true, minZoom: 8, maxZoom: 17 });
        L.tileLayer(TILES, { attribution: TILE_ATTR, maxZoom: 19, className: 'dark-tiles' }).addTo(guessMap);
        L.polygon(VBG, { color: '#d19a66', weight: 1.2, opacity: 0.55, fill: false, interactive: false }).addTo(guessMap);
        guessMap.fitBounds(VBG, { padding: [10, 10] });
        guessMap.setMaxBounds(L.latLngBounds([46.6, 9.1], [47.85, 10.6]));
        guessMap.on('click', e => {
            if (!state.playing || state.locked) return;
            placeGuess(e.latlng);
        });
    }

    function placeGuess(latlng) {
        state.guess = { lat: latlng.lat, lng: latlng.lng };
        if (guessMarker) guessMarker.setLatLng(latlng);
        else guessMarker = L.marker(latlng, { icon: pin() }).addTo(guessMap);
        $('#guess').disabled = false;
        $('#map-hint').textContent = 'Schätzung gesetzt, Enter zum Bestätigen';
    }

    function clearGuess() {
        state.guess = null;
        if (guessMarker) { guessMarker.remove(); guessMarker = null; }
        $('#guess').disabled = true;
        $('#map-hint').textContent = 'Tipp auf die Karte, wo du bist';
    }

    function showResultMap(place, guess) {
        if (!resultMap) {
            resultMap = L.map('result-map', { zoomControl: false, attributionControl: false, minZoom: 7, maxZoom: 17 });
            L.tileLayer(TILES, { maxZoom: 19, className: 'dark-tiles' }).addTo(resultMap);
        }
        resultMap.eachLayer(l => { if (!(l instanceof L.TileLayer)) resultMap.removeLayer(l); });
        const actual = L.marker([place.lat, place.lng], { icon: pin('actual') }).addTo(resultMap);
        actual.bindPopup('Hier warst du');
        if (guess) {
            L.marker([guess.lat, guess.lng], { icon: pin() }).addTo(resultMap).bindPopup('Deine Schätzung');
            L.polyline([[guess.lat, guess.lng], [place.lat, place.lng]], { color: '#d19a66', weight: 2, dashArray: '6 6', opacity: 0.8 }).addTo(resultMap);
        }
        setTimeout(() => {
            resultMap.invalidateSize();
            if (guess) resultMap.fitBounds([[guess.lat, guess.lng], [place.lat, place.lng]], { padding: [40, 40], maxZoom: 13 });
            else resultMap.setView([place.lat, place.lng], 11);
        }, 60);
    }

    /* ---------- what the browser remembers ---------- */

    const store = {
        get(k, fallback) {
            try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
        },
        set(k, v) {
            try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode, fine */ }
        },
    };

    function rememberName(name) {
        store.set('wogsi_name', name);
        const chip = $('#name-chip');
        chip.hidden = !name;
        chip.textContent = name;
        $('#start-note').textContent = name ? 'Name bleibt im Browser gespeichert' : '';
    }

    function rememberGame(score, best) {
        const games = store.get('wogsi_games', []);
        games.unshift({ date: new Date().toISOString(), score, best });
        store.set('wogsi_games', games.slice(0, 20));
        renderHistory();
    }

    function renderHistory() {
        const games = store.get('wogsi_games', []);
        const box = $('#history');
        box.hidden = !games.length;
        if (!games.length) return;
        const top = Math.max(...games.map(g => g.score));
        const items = games.slice(0, 6).map(g => {
            const when = new Date(g.date).toLocaleDateString('de-AT', { day: 'numeric', month: 'numeric' });
            return `<li class="${g.score === top ? 'best' : ''}">${when} · ${fmtNum(g.score)}</li>`;
        }).join('');
        box.innerHTML = `<h3>Deine letzten Spiele, ${games.length} gespielt, Rekord ${fmtNum(top)}</h3><ul>${items}</ul>`;
    }

    /* ---------- game state ---------- */

    const state = {
        playing: false,
        locked: false,
        round: 0,
        total: 0,
        best: null,
        place: null,
        heading: 0,
        guess: null,
        used: [],
        next: null,
        rounds: [],
        name: '',
        t0: 0,
        tick: null,
        elapsed: 0,
        done: false,
    };

    /* ---------- round timer ---------- */

    const timerEl = $('#timer');
    const barEl = $('#timebar');

    function drawTimer(left) {
        timerEl.textContent = fmtTime(Math.max(0, Math.ceil(left)));
        barEl.style.width = `${Math.max(0, left / LIMIT * 100)}%`;
        const low = left <= 15;
        timerEl.classList.toggle('low', low);
        barEl.classList.toggle('low', low);
    }

    function startTimer() {
        stopTimer();
        state.t0 = Date.now();
        state.elapsed = 0;
        drawTimer(LIMIT);
        state.tick = setInterval(() => {
            const left = LIMIT - (Date.now() - state.t0) / 1000;
            drawTimer(left);
            if (left <= 0) {
                stopTimer();
                finishRound();
            }
        }, 250);
    }

    function stopTimer() {
        if (state.tick) clearInterval(state.tick);
        state.tick = null;
        if (state.t0) state.elapsed = Math.min(LIMIT, (Date.now() - state.t0) / 1000);
    }

    const ov = { start: $('#ov-start'), result: $('#ov-result'), end: $('#ov-end') };
    const show = which => Object.entries(ov).forEach(([k, el]) => { el.hidden = k !== which; });
    const note = text => { const n = $('#pano-note'); n.hidden = !text; n.textContent = text || ''; };

    function status() {
        $('#st-round').textContent = state.playing ? `Runde ${state.round}/${ROUNDS}` : 'bereit';
        $('#st-points').textContent = `${fmtNum(state.total)} Punkte`;
        $('#st-best').textContent = state.best === null ? '' : `beste ${fmtKm(state.best)}`;
        $('#st-name').textContent = state.name;
    }

    function start() {
        const name = $('#name').value.trim();
        state.name = name;
        rememberName(name);
        state.playing = true;
        state.round = 0;
        state.total = 0;
        state.best = null;
        state.used = [];
        state.rounds = [];
        state.next = findPlace([]);
        show(null);
        status();
        nextRound();
    }

    async function nextRound() {
        state.round += 1;
        state.locked = true;
        state.done = false;
        clearGuess();
        note('Ort wird gesucht');
        let place = await state.next;
        if (!place) place = await findPlace(state.used);
        if (!place) {
            note('Kein Ort gefunden. Nochmal versuchen.');
            state.round -= 1;
            state.next = findPlace(state.used);
            setTimeout(nextRound, 1500);
            return;
        }
        state.place = place;
        state.used.push(place);
        state.next = findPlace(state.used);
        note('');
        status();
        await showPano(place);
        state.locked = false;
        startTimer();
    }

    function guess() {
        if (!state.playing || state.locked || !state.guess) return;
        finishRound();
    }

    function finishRound() {
        if (!state.playing || state.done) return;
        state.done = true;
        state.locked = true;
        stopTimer();
        const t = state.elapsed;
        const d = state.guess ? dist(state.guess, state.place) : null;
        const points = pointsFor(d, t);
        state.total += points;
        if (d !== null && (state.best === null || d < state.best)) state.best = d;
        const rec = { round: state.round, place: state.place, guess: state.guess, dist: d, time: t, points };
        state.rounds.push(rec);
        status();

        $('#result-tab').textContent = `runde ${state.round}`;
        $('#result-title').textContent = d === null ? 'Zeit um, keine Schätzung' : d < 0.15 ? 'Volltreffer' : `${fmtKm(d)} daneben`;
        $('#result-place').textContent = '';
        $('#result-dist').textContent = d === null ? '' : `Entfernung ${fmtKm(d)}`;
        const f = timeFactor(t);
        $('#result-time').textContent = `Zeit ${fmtTime(t)}` + (f < 1 ? `, ${Math.round(f * 100)}% der Punkte` : '');
        $('#result-points').textContent = `${fmtNum(points)} Punkte`;
        $('#next').textContent = state.round >= ROUNDS ? 'Ergebnis' : 'Weiter';
        show('result');
        showResultMap(state.place, state.guess);
        const p = state.place;
        placeName(p).then(name => {
            if (state.place === p && name) $('#result-place').textContent = `Das war in ${name}.`;
        });
    }

    function next() {
        if (state.round >= ROUNDS) return endGame();
        show(null);
        nextRound();
    }

    function endGame() {
        state.playing = false;
        show('end');
        $('#end-points').textContent = `${fmtNum(state.total)} Punkte`;
        const total = state.rounds.reduce((a, r) => a + r.time, 0);
        $('#end-sub').textContent = state.best === null
            ? `${ROUNDS} Runden in ${fmtTime(total)}, keine Schätzung getroffen`
            : `${ROUNDS} Runden in ${fmtTime(total)}, beste Schätzung ${fmtKm(state.best)}`;
        const rows = state.rounds.map(r => `<tr><td>${r.round}</td><td class="place">${esc(r.place.name || '')}</td><td class="num">${r.dist === null ? '' : fmtKm(r.dist)}</td><td class="num">${fmtTime(r.time)}</td><td class="num">${fmtNum(r.points)}</td></tr>`).join('');
        $('#end-rounds').innerHTML = `<tr><th>Runde</th><th>Ort</th><th class="num">Entfernung</th><th class="num">Zeit</th><th class="num">Punkte</th></tr>${rows}`;
        rememberGame(state.total, state.best);
        $('#save').hidden = false;
        $('#save-name').value = state.name;
        $('#save-btn').disabled = false;
        $('#save-btn').textContent = 'Eintragen';
        $('#save-note').className = 'muted';
        $('#save-note').textContent = '';
        status();
        /* a known name goes straight into the list, nobody should miss it over a button */
        const known = !!state.name;
        $('#save-field').hidden = known;
        $('#save-btn').hidden = known;
        if (known) saveScore(true);
    }

    function again() {
        show('start');
        $('#st-round').textContent = 'bereit';
        clearGuess();
        drawTimer(LIMIT);
    }

    /* ---------- result as text, for chats ---------- */

    async function share() {
        const lines = state.rounds.map(r => `${r.round}. ${r.place.name ? r.place.name + ', ' : ''}${r.dist === null ? 'keine Schätzung' : fmtKm(r.dist)}, ${fmtNum(r.points)} Punkte`);
        const text = [`Wo gsi? ${fmtNum(state.total)} Punkte in ${ROUNDS} Runden`, ...lines, 'https://swimmingbrain.dev/wogsi-game.html'].join('\n');
        const noteEl = $('#share-note');
        try {
            await navigator.clipboard.writeText(text);
            noteEl.textContent = 'kopiert';
        } catch (e) {
            noteEl.textContent = 'kopieren ging nicht';
        }
        setTimeout(() => { noteEl.textContent = ''; }, 2500);
    }

    /* ---------- leaderboard, served by api/server.py on the jetson ---------- */

    async function fetchBoard() {
        const res = await fetch(`${API}/scores`);
        if (!res.ok) throw new Error(`Bestenliste ${res.status}`);
        const data = await res.json();
        return Array.isArray(data.scores) ? data.scores : [];
    }

    function renderBoard(list) {
        const ol = $('#lb');
        list.sort((a, b) => b.score - a.score);
        $('#lb-count').textContent = list.length ? `${list.length} Spieler` : '';
        if (!list.length) {
            ol.innerHTML = '<li class="lb-note">noch niemand drin</li>';
            return;
        }
        ol.replaceChildren(...list.map((e, i) => {
            const li = document.createElement('li');
            if (state.name && e.name.toLowerCase() === state.name.toLowerCase()) li.className = 'me';
            const when = e.date ? new Date(e.date).toLocaleDateString('de-AT', { day: 'numeric', month: 'numeric', year: '2-digit' }) : '';
            const best = typeof e.bestGuess === 'number' ? `beste ${fmtKm(e.bestGuess)}` : '';
            const took = typeof e.time === 'number' ? fmtTime(e.time) : '';
            li.innerHTML = `<span class="rank">${i + 1}</span><span class="who"><span class="nm"></span><span class="meta"></span></span><span class="pts">${fmtNum(e.score)}</span>`;
            $('.nm', li).textContent = e.name;
            $('.meta', li).textContent = [best, took, when].filter(Boolean).join(' · ');
            return li;
        }));
    }

    async function loadBoard() {
        $('#lb').innerHTML = '<li class="lb-note">lädt</li>';
        try {
            renderBoard(await fetchBoard());
        } catch (e) {
            $('#lb').innerHTML = '<li class="lb-note">Bestenliste nicht erreichbar</li>';
        }
    }

    async function saveScore(auto) {
        const input = $('#save-name');
        const name = input.value.trim();
        const noteEl = $('#save-note');
        if (!name) {
            input.classList.add('bad');
            input.focus();
            setTimeout(() => input.classList.remove('bad'), 1200);
            return;
        }
        state.name = name;
        rememberName(name);
        $('#save-btn').disabled = true;
        noteEl.className = 'muted';
        noteEl.textContent = auto ? `${name} wird eingetragen` : 'speichert';
        try {
            const res = await fetch(`${API}/scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    score: state.total,
                    bestGuess: state.best,
                    time: Math.round(state.rounds.reduce((a, r) => a + r.time, 0)),
                    rounds: ROUNDS,
                }),
            });
            if (res.status === 429) {
                noteEl.textContent = 'zu viele Läufe auf einmal, kurz warten';
                $('#save-btn').disabled = false;
                $('#save-btn').hidden = false;
                $('#save-btn').textContent = 'Nochmal eintragen';
                return;
            }
            if (!res.ok) throw new Error(`Bestenliste ${res.status}`);
            const data = await res.json();
            renderBoard(data.scores || []);
            if (!data.saved) {
                const old = (data.scores || []).find(e => e.name.toLowerCase() === name.toLowerCase());
                noteEl.textContent = `dein bester Lauf bleibt bei ${fmtNum(old ? old.score : 0)}`;
                $('#save-btn').disabled = false;
                return;
            }
            noteEl.className = 'ok';
            noteEl.textContent = `gespeichert, Platz ${data.rank}`;
            status();
        } catch (e) {
            noteEl.className = 'bad-text';
            noteEl.textContent = 'hat nicht geklappt, Bestenliste nicht erreichbar';
            $('#save-btn').disabled = false;
            $('#save-btn').hidden = false;
            $('#save-btn').textContent = 'Nochmal eintragen';
        }
    }

    /* ---------- wiring ---------- */

    $('#start').addEventListener('click', start);
    $('#name').addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
    $('#guess').addEventListener('click', guess);
    $('#next').addEventListener('click', next);
    $('#again').addEventListener('click', again);
    $('#share').addEventListener('click', share);
    $('#save-btn').addEventListener('click', saveScore);
    $('#save-name').addEventListener('keydown', e => { if (e.key === 'Enter') saveScore(); });
    $('#lb-refresh').addEventListener('click', loadBoard);
    $('#pano-reset').addEventListener('click', resetPano);
    $('#name-chip').addEventListener('click', () => {
        if (state.playing) return;
        show('start');
        $('#name').focus();
        $('#name').select();
    });

    $('#map-size').addEventListener('click', () => {
        const big = $('#main').classList.toggle('map-big');
        $('#map-size').textContent = big ? 'kleiner' : 'größer';
        setTimeout(() => guessMap.invalidateSize(), 50);
    });

    $('#side-toggle').addEventListener('click', () => {
        const open = $('#sidebar').classList.toggle('open');
        $('#side-toggle').setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('pointerdown', e => {
        if (!e.target.closest('#sidebar, #side-toggle')) $('#sidebar').classList.remove('open');
    });

    document.addEventListener('keydown', e => {
        if (e.key !== 'Enter' || e.target.tagName === 'INPUT') return;
        if (!ov.result.hidden) next();
        else if (state.playing && state.guess) guess();
    });

    window.addEventListener('resize', () => { if (guessMap) guessMap.invalidateSize(); });

    initGuessMap();
    state.name = store.get('wogsi_name', '') || '';
    $('#name').value = state.name;
    rememberName(state.name);
    renderHistory();
    loadBoard();
    status();
    show('start');
    $('#name').focus();
})();
