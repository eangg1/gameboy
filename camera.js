
(function () {
    const SHOTS = 4, W = 440, H = 330, P = 30, G = 20, FOOT = 130;
    const FRAMES = [
        { bg: '#ffffff', fg: '#333333' },
        { bg: '#ffc1d9', fg: '#7a1f45' },
        { bg: '#111111', fg: '#9bbc0f' },
        { bg: '#9bbc0f', fg: '#1a2a05' },
        { bg: '#ffe066', fg: '#5a4500' },
        { bg: '#8ecbff', fg: '#0d3b66' }
    ];
    const FILTERS = [['none', 'NORMAL'], ['bw', 'B&W'], ['sepia', 'SEPIA'], ['warm', 'WARM']];
    const $ = id => document.getElementById(id);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    let stream = null, photos = [], imgs = [], runId = 0, busy = false, saved = false;
    let opts = { frame: 0, filter: 'none', text: 'Happy Birthday 🎂', date: true };
    let strips = [];
    let stickers = [], selIdx = -1, editorOpen = false;
    try { strips = JSON.parse(localStorage.getItem('bd_strips') || '[]'); } catch (e) {}

    function persist() {
        try { localStorage.setItem('bd_strips', JSON.stringify(strips)); return true; }
        catch (e) { return false; }
    }

   
    function setButtons() {
        const ready = !!stream && !busy && photos.length < SHOTS;
        $('cam-auto').disabled = !ready;
        $('cam-shot').disabled = !stream || busy || photos.length >= SHOTS;
    }

    function updateThumbs() {
        document.querySelectorAll('.cam-thumb').forEach((t, i) => {
            t.style.backgroundImage = photos[i] ? `url(${photos[i]})` : '';
        });
    }

    function resetShots() {
        runId++; busy = false; photos = [];
        $('cam-count').textContent = '';
        updateThumbs(); setButtons();
    }

    async function initCamera() {
        resetShots();
        const st = $('cam-status');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            st.textContent = 'Kamera butuh HTTPS / localhost 😢';
            return;
        }
        st.textContent = 'Menyalakan kamera...';
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                audio: false
            });
            if (currentScreen !== 'camera') { s.getTracks().forEach(t => t.stop()); return; }
            stream = s;
            $('cam-video').srcObject = s;
            st.textContent = 'Siap! Pilih AUTO atau AMBIL FOTO';
            setButtons();
        } catch (e) {
            st.textContent = 'Izin kamera ditolak 😢 Aktifkan lalu coba lagi.';
        }
    }

    function stopCamera() {
        runId++; busy = false;
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        const v = $('cam-video');
        if (v) v.srcObject = null;
    }

    function capture() {
        const v = $('cam-video');
        if (!v.videoWidth) return null;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d');
        const vr = v.videoWidth / v.videoHeight, tr = W / H;
        let sw = v.videoWidth, sh = v.videoHeight, sx = 0, sy = 0;
        if (vr > tr) { sw = sh * tr; sx = (v.videoWidth - sw) / 2; }
        else { sh = sw / tr; sy = (v.videoHeight - sh) / 2; }
        x.translate(W, 0); x.scale(-1, 1); 
        x.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
        return c.toDataURL('image/jpeg', 0.92);
    }

    function flash() {
        const f = $('cam-flash');
        f.style.transition = 'none'; f.style.opacity = 1;
        requestAnimationFrame(() => { f.style.transition = 'opacity .4s'; f.style.opacity = 0; });
    }

    function addPhoto(d) {
        if (!d || photos.length >= SHOTS) return;
        photos.push(d);
        flash(); updateThumbs();
        $('cam-status').textContent = `Foto ${photos.length}/${SHOTS}`;
        if (photos.length === SHOTS) {
            runId++; busy = false;
            $('cam-status').textContent = 'Selesai! Membuka editor...';
            setTimeout(() => showScreen('customize'), 900);
        }
        setButtons();
    }

    async function autoSequence() {
        if (busy || !stream) return;
        busy = true; setButtons();
        const id = ++runId;
        while (photos.length < SHOTS) {
            for (let c = 3; c > 0; c--) {
                $('cam-count').textContent = c;
                $('cam-status').textContent = `Foto ${photos.length + 1}/${SHOTS} — bersiap...`;
                await sleep(1000);
                if (id !== runId) return;
            }
            $('cam-count').textContent = '';
            addPhoto(capture());
            await sleep(1200);
            if (id !== runId) return;
        }
    }

    $('cam-auto').addEventListener('click', autoSequence);
    $('cam-shot').addEventListener('click', () => addPhoto(capture()));
    $('cam-reset').addEventListener('click', () => {
        resetShots();
        if (stream) $('cam-status').textContent = 'Siap! Pilih AUTO atau AMBIL FOTO';
    });

   
    function applyFilter(c, type) {
        if (type === 'none') return;
        const x = c.getContext('2d');
        const im = x.getImageData(0, 0, c.width, c.height), d = im.data;
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            if (type === 'bw') {
                const y = 0.3 * r + 0.59 * g + 0.11 * b;
                d[i] = d[i + 1] = d[i + 2] = y;
            } else if (type === 'sepia') {
                d[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
                d[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
                d[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
            } else if (type === 'warm') {
                d[i] = Math.min(255, r * 1.1 + 10);
                d[i + 1] = Math.min(255, g * 1.03);
                d[i + 2] = b * 0.9;
            }
        }
        x.putImageData(im, 0, 0);
    }

    function drawStrip(c, edit) {
        const y0 = P + SHOTS * H + (SHOTS - 1) * G;
        c.width = W + P * 2; c.height = y0 + FOOT;
        const x = c.getContext('2d'), f = FRAMES[opts.frame];
        x.fillStyle = f.bg; x.fillRect(0, 0, c.width, c.height);
        imgs.forEach((img, i) => {
            const t = document.createElement('canvas');
            t.width = W; t.height = H;
            t.getContext('2d').drawImage(img, 0, 0, W, H);
            applyFilter(t, opts.filter);
            x.drawImage(t, P, P + i * (H + G));
        });
        x.fillStyle = f.fg; x.textAlign = 'center';
        x.font = 'bold 34px "Courier New", monospace';
        x.fillText(opts.text, c.width / 2, y0 + 62);
        if (opts.date) {
            x.font = '24px "Courier New", monospace';
            x.fillText(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), c.width / 2, y0 + 102);
        }
        drawStickers(x, edit);
    }

    function render() {
        drawStrip($('cz-canvas'));
        saved = false;
        $('cz-save').textContent = 'SIMPAN';
    }

    async function enterCustomize() {
        if (photos.length < SHOTS) { showScreen('camera'); return; }
        $('cz-msg').textContent = '';
        stickers = []; selIdx = -1; editorOpen = false;
        $('st-editor').classList.remove('open');
        imgs = await Promise.all(photos.map(src => new Promise(res => {
            const im = new Image(); im.onload = () => res(im); im.src = src;
        })));
        render();
    }


    FRAMES.forEach((f, i) => {
        const b = document.createElement('button');
        b.className = 'cz-swatch' + (i === 0 ? ' active' : '');
        b.style.background = f.bg;
        b.addEventListener('click', () => {
            opts.frame = i;
            document.querySelectorAll('.cz-swatch').forEach((s, j) => s.classList.toggle('active', j === i));
            render();
        });
        $('cz-frames').appendChild(b);
    });
    FILTERS.forEach(([key, label], i) => {
        const b = document.createElement('button');
        b.className = 'cz-fbtn' + (i === 0 ? ' active' : '');
        b.textContent = label;
        b.addEventListener('click', () => {
            opts.filter = key;
            document.querySelectorAll('.cz-fbtn').forEach((s, j) => s.classList.toggle('active', j === i));
            render();
        });
        $('cz-filters').appendChild(b);
    });
    $('cz-text').value = opts.text;
    $('cz-text').addEventListener('input', e => { opts.text = e.target.value; render(); });
    $('cz-date').addEventListener('change', e => { opts.date = e.target.checked; render(); });

    function say(m) { $('cz-msg').textContent = m; }

    function download(href, name) {
        const a = document.createElement('a');
        a.href = href; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
    }

    function saveStrip() {
        if (saved) return true;
        const url = $('cz-canvas').toDataURL('image/jpeg', 0.85);
        strips.unshift({ id: Date.now(), data: url });
        saved = true;
        $('cz-save').textContent = 'TERSIMPAN ✓';
        if (!persist()) say('Tersimpan sementara (memori penuh, hilang jika halaman ditutup).');
        return true;
    }

    function storyCanvas() {
        const s = document.createElement('canvas'); drawStrip(s);
        const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
        const x = c.getContext('2d');
        const g = x.createLinearGradient(0, 0, 0, 1920);
        g.addColorStop(0, '#1a1a2e'); g.addColorStop(0.5, '#16213e'); g.addColorStop(1, '#0f3460');
        x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
        const h = 1640, w = h * s.width / s.height;
        x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 40;
        x.drawImage(s, (1080 - w) / 2, 190, w, h);
        x.shadowBlur = 0; x.fillStyle = '#9bbc0f'; x.textAlign = 'center';
        x.font = 'bold 44px "Courier New", monospace';
        x.fillText('HAPPY BIRTHDAY 💕', 540, 120);
        return c;
    }

    $('cz-download').addEventListener('click', () => {
        download($('cz-canvas').toDataURL('image/png'), 'photostrip-birthday.png');
        saveStrip(); say('Foto diunduh & disimpan ✓');
    });

    $('cz-story').addEventListener('click', async () => {
        const c = storyCanvas();
        const blob = await new Promise(r => c.toBlob(r, 'image/png'));
        const file = new File([blob], 'story-birthday.png', { type: 'image/png' });
        saveStrip();
        try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Birthday Photostrip' });
                say('Pilih Instagram → Story di menu share 💕');
                return;
            }
        } catch (e) {
            if (e && e.name === 'AbortError') return;
        }
        download(URL.createObjectURL(blob), 'story-birthday.png');
        say('Gambar story diunduh. Buka Instagram → Story → pilih gambar ini 💕');
    });

    $('cz-save').addEventListener('click', () => { saveStrip(); say('Tersimpan di menu HASIL FOTO ✓'); });
    $('cz-retake').addEventListener('click', () => showScreen('camera'));

   
    function renderResults() {
        const grid = $('res-grid');
        if (!strips.length) {
            grid.innerHTML = '<div class="res-empty">Belum ada foto 📸<br>Ambil dulu lewat menu CAMERA</div>';
            return;
        }
        grid.innerHTML = strips.map(s => `
            <div class="res-item">
                <img src="${s.data}" alt="photostrip">
                <div class="res-btns">
                    <button class="cz-btn" data-dl="${s.id}">DOWNLOAD</button>
                    <button class="cz-btn gray" data-del="${s.id}">HAPUS</button>
                </div>
            </div>`).join('');
    }

    $('res-grid').addEventListener('click', e => {
        const dl = e.target.dataset.dl, del = e.target.dataset.del;
        if (dl) {
            const s = strips.find(x => String(x.id) === dl);
            if (s) download(s.data, `photostrip-${s.id}.jpg`);
        } else if (del) {
            strips = strips.filter(x => String(x.id) !== del);
            persist(); renderResults();
        }
    });

 
    const originalShowScreen = showScreen;
    showScreen = function (name) {
        stopSong();
        if (name !== 'camera') stopCamera();
        if (name !== 'cake') stopCake();
        originalShowScreen(name);
        if (name === 'camera') setTimeout(initCamera, 100);
        else if (name === 'customize') enterCustomize();
        else if (name === 'results') renderResults();
        else if (name === 'cake') initCake();
    };

    handleContinueNavigation = function () {
        switch (currentScreen) {
            case 'message': showScreen('camera'); break;
            default: showScreen('main');
        }
    };

  
    initializeApp = function () {
        showScreen('main');
        addEventListeners();
        initializeTetris();
        const main = document.getElementById('main-screen');
        main.classList.add('screen-entering');
        initializeMainScreen();
        setTimeout(() => main.classList.remove('screen-entering'), 1200);
    };

    // Power button: turn the Game Boy screen on/off
    const powerBtn = document.querySelector('.power-btn');
    if (powerBtn) {
        powerBtn.addEventListener('click', () => {
            document.querySelector('#main-screen .gameboy-body').classList.toggle('off');
        });
    }

  
    const PAD = { up: '.dpad-up', down: '.dpad-down', left: '.dpad-left', right: '.dpad-right', a: '.a-btn', b: '.b-btn' };
    const gbBody = () => document.querySelector('#main-screen .gameboy-body');
    const isOn = () => !gbBody().classList.contains('off');
    const menuBtns = () => Array.from(document.querySelectorAll('.menu-btn'));
    let sel = 0, audioCtx = null;

    function renderSel() {
        menuBtns().forEach((b, i) => b.classList.toggle('selected', i === sel && isOn()));
    }

    function beep(k) {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.type = 'square';
            o.frequency.value = k === 'a' ? 880 : k === 'b' ? 330 : 600;
            g.gain.value = 0.04;
            o.connect(g); g.connect(audioCtx.destination);
            o.start(); o.stop(audioCtx.currentTime + 0.06);
        } catch (e) {}
    }

    const cycle = (i, d, n) => (i + d + n) % n;

    const handlers = {
        main(k) {
            const n = menuBtns().length;
            if (k === 'left') sel = cycle(sel, -1, n);
            else if (k === 'right') sel = cycle(sel, 1, n);
            else if (k === 'up' || k === 'down') sel = cycle(sel, 2, n);
            else if (k === 'a') showScreen(menuBtns()[sel].dataset.page);
            renderSel();
        },
        message(k) {
            if (k === 'a') { if (isTyping) skipTypewriter(); else showScreen('camera'); }
            else if (k === 'b') showScreen('main');
        },
        camera(k) {
            if (k === 'a') $('cam-shot').click();
            else if (k === 'b') { if (photos.length > 0) $('cam-reset').click(); else showScreen('main'); }
        },
        customize(k) {
            if (editorOpen) {
                if (k === 'up' || k === 'down') $('st-stage').scrollBy({ top: k === 'up' ? -120 : 120, behavior: 'smooth' });
                else if (k === 'a' || k === 'b') $('st-done').click();
                return;
            }
            if (k === 'left' || k === 'right') {
                const i = cycle(opts.frame, k === 'left' ? -1 : 1, FRAMES.length);
                document.querySelectorAll('.cz-swatch')[i].click();
            } else if (k === 'up' || k === 'down') {
                const cur = FILTERS.findIndex(f => f[0] === opts.filter);
                const i = cycle(cur, k === 'up' ? -1 : 1, FILTERS.length);
                document.querySelectorAll('.cz-fbtn')[i].click();
            } else if (k === 'a') $('cz-download').click();
            else if (k === 'b') showScreen('camera');
        },
        cake(k) {
            if (k === 'a') { if (cake.done) $('cake-relight').click(); else $('cake-blow').click(); }
            else if (k === 'b') showScreen('main');
        },
        results(k) {
            const g = $('res-grid');
            if (k === 'up') g.scrollBy({ top: -140, behavior: 'smooth' });
            else if (k === 'down') g.scrollBy({ top: 140, behavior: 'smooth' });
            else if (k === 'b') showScreen('main');
        }
    };

    function press(k) {
        if (!isOn()) return;
        beep(k);
        const el = document.querySelector(PAD[k]);
        if (el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 120); }
        const fn = handlers[currentScreen];
        if (fn) fn(k);
    }

    Object.keys(PAD).forEach(k => {
        document.querySelector(PAD[k]).addEventListener('click', () => press(k));
    });

    const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'a', Escape: 'b', Backspace: 'b' };
    document.addEventListener('keydown', e => {
        const k = KEYS[e.key];
        if (!k || !isOn()) return;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        e.preventDefault();
        press(k);
    });

    // Keep menu highlight in sync with power and navigation
    document.querySelector('.power-btn').addEventListener('click', renderSel);
    const prevShow = showScreen;
    showScreen = function (name) { prevShow(name); if (name === 'main') renderSel(); };
    renderSel();

   
    const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    const STICKERS = ['💖', '⭐', '👑', '🎂', '🎉', '🎈', '🌸', '😍', '🥳', '🎀', '✨', '🐱', '🌹', '🎁', '🦋', '🧸'];

    function drawStickers(x, edit) {
        x.textAlign = 'center'; x.textBaseline = 'middle';
        stickers.forEach((s, i) => {
            x.font = `${s.s}px ${EMOJI_FONT}`;
            x.fillText(s.e, s.x, s.y);
            if (edit && i === selIdx) {
                x.strokeStyle = '#ff2d75'; x.lineWidth = 4; x.setLineDash([10, 8]);
                x.strokeRect(s.x - s.s / 2, s.y - s.s / 2, s.s, s.s);
                x.setLineDash([]);
            }
        });
        x.textBaseline = 'alphabetic';
    }

    function redrawAll() {
        render();
        if (editorOpen) drawStrip($('st-canvas'), true);
    }

    STICKERS.forEach(e => {
        const b = document.createElement('button');
        b.textContent = e;
        b.addEventListener('click', () => {
            const cv = $('st-canvas'), stage = $('st-stage');
            const k = cv.height / cv.clientHeight;
            const y = Math.min(cv.height - 60, Math.max(60, (stage.scrollTop + stage.clientHeight / 2) * k));
            stickers.push({ e, x: cv.width / 2, y, s: 110 });
            selIdx = stickers.length - 1;
            redrawAll();
        });
        $('st-pal').appendChild(b);
    });

    $('cz-stickers').addEventListener('click', () => {
        editorOpen = true;
        $('st-editor').classList.add('open');
        drawStrip($('st-canvas'), true);
    });
    $('st-done').addEventListener('click', () => {
        editorOpen = false; selIdx = -1;
        $('st-editor').classList.remove('open');
        render();
    });
    $('st-big').addEventListener('click', () => { if (stickers[selIdx]) { stickers[selIdx].s = Math.min(400, stickers[selIdx].s * 1.2); redrawAll(); } });
    $('st-small').addEventListener('click', () => { if (stickers[selIdx]) { stickers[selIdx].s = Math.max(40, stickers[selIdx].s / 1.2); redrawAll(); } });
    $('st-del').addEventListener('click', () => { if (stickers[selIdx]) { stickers.splice(selIdx, 1); selIdx = -1; redrawAll(); } });
    $('st-clear').addEventListener('click', () => { stickers = []; selIdx = -1; redrawAll(); });
    $('st-canvas').addEventListener('click', e => {
        const cv = $('st-canvas'), r = cv.getBoundingClientRect(), k = cv.width / r.width;
        const px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k;
        let hit = -1;
        for (let i = stickers.length - 1; i >= 0; i--) {
            const s = stickers[i];
            if (Math.abs(px - s.x) <= s.s / 2 && Math.abs(py - s.y) <= s.s / 2) { hit = i; break; }
        }
        if (hit >= 0 && hit !== selIdx) selIdx = hit;
        else if (selIdx >= 0) { stickers[selIdx].x = px; stickers[selIdx].y = py; }
        redrawAll();
    });

   
    const CANDLES = [96, 123, 150, 177, 204];
    const cake = { stream: null, ctx: null, an: null, buf: null, raf: 0, acc: 0, th: 0.1, base: [], start: 0, last: 0, ready: false, out: [], done: false };

    function cakeStatus(t) { $('cake-status').textContent = t; }

    function buildCake() {
        const cols = ['#4aa3ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#c77dff'];
        let c = '';
        CANDLES.forEach((cx, i) => {
            c += `<rect x="${cx - 4}" y="84" width="8" height="34" rx="2" fill="${cols[i]}"/>
            <path id="sm-${i}" class="smoke" d="M${cx} 78 q6 -10 0 -18 q-6 -8 0 -16" stroke="#cfcfcf" stroke-width="3" fill="none" stroke-linecap="round"/>
            <g class="fl" id="fl-${i}"><g class="fl-in"><ellipse cx="${cx}" cy="72" rx="7" ry="12" fill="#ffc72c"/><ellipse cx="${cx}" cy="75" rx="3.5" ry="7" fill="#ff7a1a"/></g></g>`;
        });
        $('cake-stage').innerHTML = `<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="150" cy="230" rx="135" ry="14" fill="#cfd8dc"/>
            <rect x="40" y="165" width="220" height="62" rx="8" fill="#ff8fb8"/>
            <path d="M40 165 h220 v10 q-18 22 -36.6 0 q-18 22 -36.6 0 q-18 22 -36.6 0 q-18 22 -36.6 0 q-18 22 -36.6 0 q-18 22 -36.6 0 z" fill="#fff"/>
            <text x="150" y="212" text-anchor="middle" font-size="15" font-weight="bold" fill="#fff" font-family="Courier New, monospace">HAPPY BIRTHDAY</text>
            <rect x="75" y="115" width="150" height="52" rx="8" fill="#ffd6e7"/>
            <path d="M75 115 h150 v8 q-15 20 -30 0 q-15 20 -30 0 q-15 20 -30 0 q-15 20 -30 0 q-15 20 -30 0 z" fill="#fff"/>
            <circle cx="105" cy="150" r="5" fill="#ff5c8a"/><circle cx="150" cy="154" r="5" fill="#ff5c8a"/><circle cx="195" cy="150" r="5" fill="#ff5c8a"/>
            ${c}</svg>`;
    }

    function resetCake() {
        cake.out = CANDLES.map(() => false);
        cake.done = false; cake.acc = 0;
        document.querySelectorAll('.fl').forEach(f => { f.classList.remove('out'); f.style.transform = ''; });
        document.querySelectorAll('.smoke').forEach(s => s.classList.remove('on'));
        document.querySelectorAll('.confetti-wrap').forEach(w => w.remove());
        $('cake-blow').disabled = false;
        $('cake-meter-fill').style.width = '0%';
    }

    function tone(f, at, d) {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t0 = audioCtx.currentTime + at;
            o.type = 'square'; o.frequency.value = f; g.gain.value = 0.05;
            o.connect(g); g.connect(audioCtx.destination);
            o.start(t0); o.stop(t0 + d);
        } catch (e) {}
    }

    function snuff(i) {
        cake.out[i] = true;
        $('fl-' + i).classList.add('out');
        $('sm-' + i).classList.add('on');
    }

    function confetti() {
        const w = document.createElement('div');
        w.className = 'confetti-wrap';
        for (let i = 0; i < 70; i++) {
            const p = document.createElement('i');
            p.style.left = Math.random() * 100 + '%';
            p.style.background = `hsl(${Math.floor(Math.random() * 360)},90%,60%)`;
            p.style.animationDuration = 2.5 + Math.random() * 2 + 's';
            p.style.animationDelay = Math.random() * 1 + 's';
            w.appendChild(p);
        }
        document.querySelector('#cake-screen .page-screen').appendChild(w);
        setTimeout(() => w.remove(), 7000);
    }

    function checkCakeDone() {
        if (cake.done || !cake.out.every(Boolean)) return;
        cake.done = true;
        cancelAnimationFrame(cake.raf); cake.raf = 0;
        $('cake-blow').disabled = true;
        cakeStatus('🎉 Selamat ulang tahun! Make a wish ✨');
        confetti();
        playBirthdaySong();
    }

function cakeLoop(t) {
    cake.raf = requestAnimationFrame(cakeLoop);
    cake.an.getFloatTimeDomainData(cake.buf);
    cake.an.getByteFrequencyData(cake.freq);

    // volume total
    let s = 0;
    for (let i = 0; i < cake.buf.length; i++) s += cake.buf[i] * cake.buf[i];
    const rms = Math.sqrt(s / cake.buf.length);

    // energi frekuensi rendah (~40-700 Hz) = ciri khas tiupan
    let low = 0;
    for (let i = 1; i <= 16; i++) low += cake.freq[i];
    low = low / 16 / 255;

    const level = rms * 4 + low;
    const dt = Math.min(0.1, (t - (cake.last || t)) / 1000); cake.last = t;

    if (!cake.ready) { // kalibrasi suara sekitar
        cake.base.push(level);
        if (t - cake.start > 800) {
            cake.bl = cake.base.reduce((a, b) => a + b, 0) / cake.base.length;
            cake.ready = true;
            cakeStatus('Tiup ke mikrofon untuk memadamkan lilin! 🎂');
        }
        return;
    }

            const th = cake.bl * 1.4 + 0.10;       
            const blowing = level > th;
            cakeStatus(`level ${level.toFixed(3)} | batas ${th.toFixed(3)}`);

            if (!blowing) cake.bl += (level - cake.bl) * Math.min(1, dt * 1.2);

            const power = blowing ? 1 + Math.min(1.5, (level - th) / th) : 0;
            cake.acc = blowing ? cake.acc + dt * power : Math.max(0, cake.acc - dt * 0.8);

            $('cake-meter-fill').style.width = Math.min(100, (level / (th * 2)) * 100) + '%';

            const f = Math.min(1, level / (th * 1.5));
            CANDLES.forEach((_, i) => {
                if (!cake.out[i]) $('fl-' + i).style.transform = `scale(1,${1 - f * 0.35}) skewX(${(i % 2 ? 1 : -1) * f * 14}deg)`;
            });

            const n = Math.min(CANDLES.length, Math.floor(cake.acc / 0.3));
            for (let i = 0; i < n; i++) if (!cake.out[i]) snuff(i);
            checkCakeDone();
        }

    async function initCake() {
        buildCake(); resetCake();
        cake.ready = false; cake.base = []; cake.last = 0;
        cakeStatus('Meminta izin mikrofon...');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            cakeStatus('Mikrofon tidak tersedia — tekan TIUP (TAP) atau tombol A');
            return;
        }
        try {
            const st = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });
            if (currentScreen !== 'cake') { st.getTracks().forEach(t => t.stop()); return; }
            cake.stream = st;
            cake.ctx = new (window.AudioContext || window.webkitAudioContext)();
            const src = cake.ctx.createMediaStreamSource(st);
            cake.an = cake.ctx.createAnalyser(); cake.an.fftSize = 1024;
            cake.an.smoothingTimeConstant = 0.2;
            cake.buf = new Float32Array(cake.an.fftSize);
            cake.freq = new Uint8Array(cake.an.frequencyBinCount);
            src.connect(cake.an);
            cakeStatus('Menyesuaikan suara sekitar... (diam sebentar)');
            cake.start = performance.now();
            cake.raf = requestAnimationFrame(cakeLoop);
        } catch (e) {
            cakeStatus('Mikrofon ditolak — tekan TIUP (TAP) atau tombol A');
        }
    }

    function stopCake() {
        if (cake.raf) cancelAnimationFrame(cake.raf);
        cake.raf = 0;
        if (cake.stream) cake.stream.getTracks().forEach(t => t.stop());
        if (cake.ctx) cake.ctx.close().catch(() => {});
        stopSong();
        cake.stream = cake.ctx = cake.an = null;
        document.querySelectorAll('.confetti-wrap').forEach(w => w.remove());
    }

    $('cake-blow').addEventListener('click', () => {
        if (cake.done) return;
        CANDLES.forEach((_, i) => setTimeout(() => {
            if (currentScreen !== 'cake') return;
            if (!cake.out[i]) snuff(i);
            if (i === CANDLES.length - 1) checkCakeDone();
        }, i * 150));
    });
    $('cake-relight').addEventListener('click', () => {
        stopSong();
        resetCake();
        if (cake.an && !cake.raf) { cake.last = 0; cake.raf = requestAnimationFrame(cakeLoop); }
        cakeStatus(cake.an ? 'Tiup lagi! 🎂' : 'Lilin menyala lagi 🎂');
    });


    let songNodes = [], songTimer = 0, songLoop = false, songVol = 1;
    const NOTE = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
    const BEAT = 0.36;
    const MELODY = [
        ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
        ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
        ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1],
        ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]
    ];
    const BARS = ['C', 'G', 'G', 'C', 'C', 'F', 'F', 'C'];
    const BASS = { C: [130.81, 196], G: [98, 146.83], F: [87.31, 130.81] };

    function pulseWave(d) {
        const n = 32, re = new Float32Array(n), im = new Float32Array(n);
        for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * d);
        return audioCtx.createPeriodicWave(re, im);
    }

    function songTone(freq, t0, dur, type, gain, wave) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        if (wave) o.setPeriodicWave(wave); else o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(gain * songVol, t0 + 0.01);
        g.gain.setValueAtTime(gain * songVol, t0 + dur * 0.7);
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur * 0.95);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + dur);
        songNodes.push(o);
    }

    function stopSong() {
        clearTimeout(songTimer);
        songLoop = false;
        songNodes.forEach(o => { try { o.stop(); } catch (e) {} });
        songNodes = [];
        const b = $('cake-song');
        if (b) b.textContent = '🎵 LAGU';
    }

    function playBirthdaySong(loop, vol) {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (e) { return; }
        stopSong();
        songLoop = !!loop; songVol = vol || 1;
        const wave = pulseWave(0.25), t0 = audioCtx.currentTime + 0.15;
        let t = t0;
        MELODY.forEach(([n, b]) => { songTone(NOTE[n], t, b * BEAT * 0.92, null, 0.06, wave); t += b * BEAT; });
        BARS.forEach((c, i) => {
            const [root, fifth] = BASS[c], b = t0 + i * 3 * BEAT;
            songTone(root, b, BEAT, 'triangle', 0.1);
            songTone(fifth, b + BEAT, BEAT, 'triangle', 0.1);
            songTone(root, b + 2 * BEAT, BEAT, 'triangle', 0.1);
        });
        if (!loop) $('cake-song').textContent = '⏹ STOP';
        songTimer = setTimeout(() => {
            songNodes = [];
            $('cake-song').textContent = '🎵 LAGU';
            if (loop && currentScreen === 'message' && musicOn) setTimeout(() => {
                if (currentScreen === 'message' && musicOn) playBirthdaySong(true, vol);
            }, 1500);
        }, (24 * BEAT + 0.4) * 1000);
    }

    $('cake-song').addEventListener('click', () => { if (songNodes.length) stopSong(); else playBirthdaySong(); });

    // Classic Game Boy "ba-ding" when powering on
    document.querySelector('.power-btn').addEventListener('click', () => {
        if (isOn()) { tone(1976, 0, 0.1); tone(2637, 0.1, 0.5); }
    });

    let musicOn = true;
    function syncMusic() {
        const b = document.querySelector('.msg-music');
        if (b) b.textContent = musicOn ? '🔊' : '🔇';
        if (currentScreen !== 'message') return;
        if (musicOn) playBirthdaySong(true, 0.5); else stopSong();
    }
    const origInitMessage = initializeMessage;
    initializeMessage = function () {
        origInitMessage();
        const ps = document.querySelector('#message-screen .page-screen');
        if (ps && !ps.querySelector('.msg-music')) {
            const b = document.createElement('button');
            b.className = 'msg-music';
            b.title = 'Musik on/off';
            b.addEventListener('click', () => { musicOn = !musicOn; syncMusic(); });
            ps.appendChild(b);
        }
        syncMusic();
    };
})();