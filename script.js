document.addEventListener('DOMContentLoaded', async () => {

    // ── INDEXEDDB SETUP ──────────────────────────────────────────
    const DB_NAME = 'SproutDB';
    const DB_VERSION = 2;
    let db;

    function initDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (e.oldVersion < 2) {
                    if (db.objectStoreNames.contains('growth'))   db.deleteObjectStore('growth');
                    if (db.objectStoreNames.contains('timeline')) db.deleteObjectStore('timeline');
                    if (db.objectStoreNames.contains('memories')) db.deleteObjectStore('memories');
                    if (db.objectStoreNames.contains('state'))    db.deleteObjectStore('state');
                }
                if (!db.objectStoreNames.contains('growth'))   db.createObjectStore('growth', { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains('timeline')) db.createObjectStore('timeline', { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains('memories')) db.createObjectStore('memories', { keyPath: 'id', autoIncrement: true });
                if (!db.objectStoreNames.contains('state'))    db.createObjectStore('state', { keyPath: 'key' });
            };
            req.onsuccess = e => resolve(e.target.result);
            req.onerror = e => reject(e.target.error);
        });
    }

    async function getStoreData(db, storeName) {
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve([]);
        });
    }

    async function putData(db, storeName, data) {
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).put(data);
            tx.oncomplete = () => resolve();
        });
    }

    async function addData(db, storeName, data) {
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).add(data);
            req.onsuccess = () => resolve(req.result);
        });
    }

    async function deleteData(db, storeName, id) {
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).delete(id);
            tx.oncomplete = () => resolve();
        });
    }

    async function clearStore(db, storeName) {
        return new Promise((resolve) => {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).clear();
            tx.oncomplete = () => resolve();
        });
    }

    try {
        db = await initDB();
    } catch (e) {
        console.error("Failed to load IndexedDB", e);
    }

    // ── WHO BENCHMARKS ─────────────────────────────────────────
    // Feature 1: hc arrays added (boys, cm, P25/P50/P75)
    const WHO = {
        1:  { w:[3.6,4.2,4.9],  h:[1.60,1.67,1.74],  hc:[35.8,37.3,38.8], food:['Breast milk / formula only — 8–12 feeds/day','No water or solids needed','Watch for hunger cues: rooting, sucking hands'], milestone:['Lifts head briefly during tummy time','Follows moving objects with eyes','Responds to familiar voices','Strong grasp reflex'], memory:['First bath photo','First smile capture','Close-up of tiny hands & feet','Date night as new parents'] },
        2:  { w:[4.3,5.1,5.8],  h:[1.77,1.84,1.91],  hc:[37.4,38.9,40.4], food:['Continue breast milk/formula exclusively','~600–900 ml/day','Watch for feeding cues, not clock'], milestone:['Smiles socially first time','Coos and gurgles','Holds head 45° on tummy time','Tracks faces with eyes'], memory:['First smile portrait','2-month milestone sign','Black & white toy interaction','Family cuddle session'] },
        3:  { w:[5.0,6.0,7.0],  h:[1.92,2.00,2.08],  hc:[38.7,40.2,41.7], food:['Breast milk / formula only','~700–950 ml/day','Growth spurt — feed on demand'], milestone:['Becomes more vocal','Brings hands to mouth','Mini push-ups on tummy time','Laughs out loud first time'], memory:['First laugh video','3-month mini photoshoot','Bath time bubbles','First outdoor trip'] },
        4:  { w:[5.6,6.7,7.8],  h:[2.03,2.11,2.20],  hc:[39.7,41.2,42.7], food:['Still breast milk / formula only','~750–1000 ml/day','Watch for solids readiness signs'], milestone:['Rolls tummy to back','Reaches for objects intentionally','Bears weight on legs when held','Recognizes own name'], memory:['First roll video','Reading time together','Park/garden stroll','Meeting relatives'] },
        5:  { w:[6.1,7.3,8.4],  h:[2.11,2.19,2.28],  hc:[40.6,42.1,43.6], food:['Breast milk / formula primary','Some babies show interest in solids','Offer spoon / training cup exposure'], milestone:['Sits with support','Transfers objects hand-to-hand','Blows raspberries!','Stranger anxiety may begin'], memory:['Sitting with support photo','First high-chair try','Bubbles play session','5-month milestone board'] },
        6:  { w:[6.6,7.9,9.0],  h:[2.18,2.26,2.36],  hc:[41.3,42.9,44.5], food:['Introduce single-grain iron-fortified cereals','Try purées: sweet potato, pea, pear, banana','Continue breast milk/formula as main','Avoid honey, salt, sugar'], milestone:['Sits independently','Starts babbling (ba-ba, da-da)','Passes objects between hands','First tooth may appear'], memory:['First bite of solid food!','6-month professional photoshoot','First swing ride','Babbling video'] },
        7:  { w:[6.9,8.3,9.6],  h:[2.23,2.31,2.42],  hc:[42.0,43.6,45.2], food:['2–3 small solid meals/day','Mashed fruits & veggies','Avoid choking hazards, honey','Offer water in sippy cup with meals'], milestone:['Beginning to crawl / creep','Responds to "no"','Waves bye-bye','Object permanence developing'], memory:['First crawl attempt','Peek-a-boo video','Beach/pool visit','Daddy/mommy playtime'] },
        8:  { w:[7.2,8.6,10.0], h:[2.27,2.35,2.46],  hc:[42.6,44.2,45.8], food:['3 solid meals + 2 snacks','Soft finger foods: banana, steamed carrot, soft bread','Continue breast milk/formula','Introduce avocado, egg yolk, lentils, yoghurt'], milestone:['Crawls confidently','Pulls to stand','Pincer grasp developing','Says "mama" or "dada" specifically'], memory:['Crawling race video','First playground visit','8-month sign photo','Baby\'s first foodie spread'] },
        9:  { w:[7.5,9.0,10.4], h:[2.30,2.39,2.49],  hc:[43.1,44.7,46.3], food:['3 meals + 2 snacks/day','Small soft lumps OK','Introduce pasta, soft meat, tofu, cheese','Avoid large chunks, uncut grapes'], milestone:['Stands holding furniture','Cruises along furniture','Claps hands','Searches for hidden objects'], memory:['Pulling to stand photo','Bath time splash','9-month milestone collage','First clapping video'] },
        10: { w:[7.7,9.2,10.7], h:[2.34,2.42,2.52],  hc:[43.6,45.2,46.8], food:['Expanding texture variety','Share adapted family meals','Dairy: yoghurt, soft cheese OK','Iron-rich foods important'], milestone:['Says 1–2 meaningful words','Points at objects of interest','Waves goodbye consistently','Copies simple actions'], memory:['Pointing & discovering video','First word recording','10-month outdoor shoot','Baby bookshelf exploration'] },
        11: { w:[7.9,9.4,11.0], h:[2.37,2.45,2.55],  hc:[44.0,45.6,47.2], food:['Varied balanced meals','Soft fish, well-cooked beans, lentils','Mashed family food','Limit fruit juice ≤120 ml/day'], milestone:['Walks with support','Understands simple commands','Shakes head "no"','Stacks 2 blocks'], memory:['First steps with support video','Block stacking photo','Music & dancing session','11-month measurement photo'] },
        12: { w:[8.1,9.6,11.3], h:[2.39,2.48,2.57],  hc:[44.4,46.1,47.8], food:['Transition to whole cow milk (350–500 ml/day)','3 balanced meals + 2 snacks','Introduce most foods except honey','Birthday cake — small slice!'], milestone:['First independent steps 🎉','Says 3–5 words','Points to pictures in books','Feeds self with fingers'], memory:['1st Birthday photoshoot','First solo steps video','Cake smash session 🎂','Year-in-review collage'] }
    };

    // ── STATE VARIABLES ──────────────────────────────────────
    let weightData = [3.4];
    let heightData = [1.64];
    let hcData     = [34.5];   // Feature 1: head circumference array
    let labels     = ['Mo 1'];

    const checkState = {};
    const vaccState  = {};

    // Feature 2: date of birth
    let dob = null;

    // Feature 10: height unit (always store ft in DB, toggle display)
    let heightUnit = 'ft';

    // ── INITIAL DATA LOAD ────────────────────────────────────
    if (db) {
        const growthDb = await getStoreData(db, 'growth');
        growthDb.forEach(g => {
            weightData.push(g.w);
            heightData.push(g.h);
            hcData.push(g.hc != null ? g.hc : null);
            labels.push(g.label);
        });

        const stateDb = await getStoreData(db, 'state');
        stateDb.forEach(s => {
            if (s.key === 'dob') {
                dob = s.val;
            } else if (s.key === 'heightUnit') {
                heightUnit = s.val;
            } else if (s.key.startsWith('v_')) {
                vaccState[s.key] = s.val;
            } else {
                checkState[s.key] = s.val;
            }
        });

        // Restore DOB input
        if (dob) {
            const dobInputEl = document.getElementById('dobInput');
            if (dobInputEl) dobInputEl.value = dob;
        }

        // Restore height unit button state
        document.querySelectorAll('.btn-unit').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === heightUnit);
        });

        // Update height input label to match loaded unit
        updateHeightInputLabel();

        // Feature 8: load timeline photos from DB (convert file blobs to object URLs)
        const timelineDb = await getStoreData(db, 'timeline');
        timelineDb.forEach(item => {
            let imgUrl = null;
            if (item.file) imgUrl = URL.createObjectURL(item.file);
            prependTimeline({ ...item, imgUrl });
        });

        // Feature 8: load memory photos from DB
        const memoriesDb = await getStoreData(db, 'memories');
        memoriesDb.forEach(item => {
            let fileUrl = '';
            if (item.file) fileUrl = URL.createObjectURL(item.file);
            addMemoryCard({ ...item, fileUrl });
        });
    }

    // ── CHART ──────────────────────────────────────────────────
    const ctx = document.getElementById('growthChart').getContext('2d');
    let activeMetric = 'weight';
    let growthChart;

    // Feature 10: get height values converted for display
    function getDisplayHeightData() {
        if (heightUnit === 'cm') {
            return heightData.map(v => v != null ? parseFloat((v * 30.48).toFixed(1)) : null);
        }
        return heightData;
    }

    function getWhoHeightBench(monthIdx, pctileIdx) {
        if (!WHO[monthIdx + 1]) return null;
        const val = WHO[monthIdx + 1].h[pctileIdx];
        return heightUnit === 'cm' ? parseFloat((val * 30.48).toFixed(1)) : val;
    }

    const buildChart = () => {
        let data, unit, color;

        if (activeMetric === 'weight') {
            data  = weightData;
            unit  = 'kg';
            color = '#7c5cfa';
        } else if (activeMetric === 'height') {
            data  = getDisplayHeightData();
            unit  = heightUnit;
            color = '#ff7597';
        } else {
            // Feature 1: HC metric
            data  = hcData;
            unit  = 'cm';
            color = '#33b5e5';
        }

        const n = labels.length;
        let benchP25, benchP75, benchP50;

        if (activeMetric === 'weight') {
            benchP25 = Array.from({length: n}, (_, i) => WHO[i+1] ? WHO[i+1].w[0] : null);
            benchP75 = Array.from({length: n}, (_, i) => WHO[i+1] ? WHO[i+1].w[2] : null);
            benchP50 = Array.from({length: n}, (_, i) => WHO[i+1] ? WHO[i+1].w[1] : null);
        } else if (activeMetric === 'height') {
            benchP25 = Array.from({length: n}, (_, i) => WHO[i+1] ? getWhoHeightBench(i, 0) : null);
            benchP75 = Array.from({length: n}, (_, i) => WHO[i+1] ? getWhoHeightBench(i, 2) : null);
            benchP50 = Array.from({length: n}, (_, i) => WHO[i+1] ? getWhoHeightBench(i, 1) : null);
        } else {
            // Feature 1: HC WHO benchmarks
            benchP25 = Array.from({length: n}, (_, i) => WHO[i+1] ? WHO[i+1].hc[0] : null);
            benchP75 = Array.from({length: n}, (_, i) => WHO[i+1] ? WHO[i+1].hc[2] : null);
            benchP50 = Array.from({length: n}, (_, i) => WHO[i+1] ? WHO[i+1].hc[1] : null);
        }

        const babyGrad = ctx.createLinearGradient(0, 0, 0, 260);
        if (activeMetric === 'weight') {
            babyGrad.addColorStop(0, 'rgba(124,92,250,0.40)');
        } else if (activeMetric === 'height') {
            babyGrad.addColorStop(0, 'rgba(255,117,151,0.40)');
        } else {
            babyGrad.addColorStop(0, 'rgba(51,181,229,0.40)');
        }
        babyGrad.addColorStop(1, 'rgba(0,0,0,0.02)');

        return {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'WHO P25', data: benchP25, borderColor: 'rgba(0,230,118,0.35)', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0.4, order: 4 },
                    { label: 'WHO P75 band', data: benchP75, borderColor: 'rgba(0,230,118,0.35)', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, backgroundColor: 'rgba(0,230,118,0.08)', fill: { target: 0, above: 'rgba(0,230,118,0.08)', below: 'rgba(0,0,0,0)' }, tension: 0.4, order: 4 },
                    { label: 'WHO Median', data: benchP50, borderColor: 'rgba(0,230,118,0.75)', borderWidth: 2, borderDash: [7, 3], pointRadius: 0, fill: false, tension: 0.4, order: 3 },
                    { label: `Rudhir (${unit})`, data: [...data], borderColor: color, backgroundColor: babyGrad, borderWidth: 3, pointBackgroundColor: '#0a0a0f', pointBorderColor: color, pointBorderWidth: 2.5, pointRadius: 5, pointHoverRadius: 8, fill: true, tension: 0.4, order: 1 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top', labels: { color: '#7b7b9e', font: { family: 'Outfit', size: 11 }, boxWidth: 14, padding: 16, filter: item => !item.text.includes('P25') && !item.text.includes('P75 band') } },
                    tooltip: { backgroundColor: 'rgba(18,18,26,0.97)', titleColor: '#f0f0ff', bodyColor: '#7b7b9e', borderColor: 'rgba(124,92,250,0.3)', borderWidth: 1, padding: 14, callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y} ${unit}` } }
                },
                scales: {
                    y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { font: { family: 'Outfit' }, color: '#7b7b9e' } },
                    x: { grid: { display: false, drawBorder: false }, ticks: { font: { family: 'Outfit' }, color: '#7b7b9e' } }
                },
                interaction: { intersect: false, mode: 'index' }, animation: { duration: 700, easing: 'easeOutQuart' }
            }
        };
    };

    function initChart() {
        if (growthChart) growthChart.destroy();
        growthChart = new Chart(ctx, buildChart());
        updateDeviationInfo();
        updateStatCards();
        renderGrowthHistory();
    }
    initChart();

    function refreshChart() {
        if (growthChart) growthChart.destroy();
        growthChart = new Chart(ctx, buildChart());
        updateDeviationInfo();
    }

    function updateDeviationInfo() {
        const n = labels.length;
        const lastIdx  = n - 1;
        const monthNum = lastIdx + 1;
        if (!WHO[monthNum]) return;

        const rudhirW  = weightData[lastIdx];
        const rudhirH  = heightData[lastIdx];
        const rudhirHC = hcData[lastIdx];
        const whoW_p50  = WHO[monthNum].w[1];
        const whoH_p50  = WHO[monthNum].h[1];
        const whoHC_p50 = WHO[monthNum].hc[1];

        const wDev = ((rudhirW - whoW_p50) / whoW_p50 * 100).toFixed(1);
        const hDev = ((rudhirH - whoH_p50) / whoH_p50 * 100).toFixed(1);

        const wClass = wDev > 0 ? 'dev-above' : wDev < 0 ? 'dev-below' : 'dev-normal';
        const hClass = hDev > 0 ? 'dev-above' : hDev < 0 ? 'dev-below' : 'dev-normal';
        const wArrow = wDev > 0 ? '▲' : wDev < 0 ? '▼' : '●';
        const hArrow = hDev > 0 ? '▲' : hDev < 0 ? '▼' : '●';

        // Feature 1: HC deviation row
        let hcDevHtml = '';
        if (rudhirHC != null) {
            const hcDev   = ((rudhirHC - whoHC_p50) / whoHC_p50 * 100).toFixed(1);
            const hcClass = hcDev > 0 ? 'dev-above' : hcDev < 0 ? 'dev-below' : 'dev-normal';
            const hcArrow = hcDev > 0 ? '▲' : hcDev < 0 ? '▼' : '●';
            hcDevHtml = `<div class="dev-tag"><div class="dev-dot" style="background:#33b5e5"></div><span>Rudhir Head Circ.:</span><strong class="${hcClass}">${hcArrow} ${Math.abs(hcDev)}% ${hcDev > 0 ? 'above' : hcDev < 0 ? 'below' : 'at'} WHO median</strong></div>`;
        }

        document.getElementById('deviationInfo').innerHTML = `
            <div class="dev-tag"><div class="dev-dot" style="background:#7c5cfa"></div><span>Rudhir Weight:</span><strong class="${wClass}">${wArrow} ${Math.abs(wDev)}% ${wDev > 0 ? 'above' : wDev < 0 ? 'below' : 'at'} WHO median</strong></div>
            <div class="dev-tag"><div class="dev-dot" style="background:#ff7597"></div><span>Rudhir Height:</span><strong class="${hClass}">${hArrow} ${Math.abs(hDev)}% ${hDev > 0 ? 'above' : hDev < 0 ? 'below' : 'at'} WHO median</strong></div>
            ${hcDevHtml}
            <div class="dev-tag"><div class="dev-dot" style="background:rgba(0,230,118,0.7)"></div><span style="color:#7b7b9e">Green band = WHO 25th–75th percentile range</span></div>`;
    }

    // Feature 4 & 5: growth history with date and notes; Feature 1: show HC; Feature 10: respect unit
    async function renderGrowthHistory() {
        const list = document.getElementById('growthHistoryList');
        if (!list) return;
        list.innerHTML = '';
        if (!db) return;
        const growthDb = await getStoreData(db, 'growth');
        growthDb.forEach(item => {
            const div = document.createElement('div');
            div.className = 'growth-history-item';

            // Feature 10: display height in selected unit
            const heightDisplay = heightUnit === 'cm'
                ? (item.h * 30.48).toFixed(1) + ' cm'
                : item.h + ' ft';

            // Feature 1: HC display
            const hcDisplay = item.hc != null ? `<span>HC: ${item.hc} cm</span>` : '';

            // Feature 4: entry date
            const dateDisplay = item.date ? `<span class="history-date" style="font-size:.75em;color:#7b7b9e;margin-left:.4rem;">${formatDate(item.date)}</span>` : '';

            // Feature 5: notes
            const notesHtml = item.notes ? `<div class="history-notes" style="font-size:.8em;color:#7b7b9e;margin-top:.25rem;font-style:italic;">${item.notes}</div>` : '';

            div.innerHTML = `
                <div class="growth-history-info">
                    <span><strong>${item.label}</strong>${dateDisplay}</span>
                    <span>W: ${item.w} kg</span>
                    <span>H: ${heightDisplay}</span>
                    ${hcDisplay}
                    ${notesHtml}
                </div>
                <div class="action-buttons" style="position:relative; opacity:1; top:0; right:0;">
                    <button class="btn-action delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            div.querySelector('.delete').addEventListener('click', async () => {
                if (confirm(`Delete ${item.label} growth record?`)) {
                    await deleteData(db, 'growth', item.id);
                    await rebuildGrowthArrays();
                    initChart();
                }
            });
            list.appendChild(div);
        });
    }

    // Feature 1: rebuild hcData alongside weight/height
    async function rebuildGrowthArrays() {
        weightData = [3.4];
        heightData = [1.64];
        hcData     = [34.5];
        labels     = ['Mo 1'];
        if (!db) return;
        const newData = await getStoreData(db, 'growth');
        newData.forEach(g => {
            weightData.push(g.w);
            heightData.push(g.h);
            hcData.push(g.hc != null ? g.hc : null);
            labels.push(g.label);
        });
    }

    // Chart metric toggle (weight / height / hc) — uses data-metric, class btn-toggle
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeMetric = e.target.dataset.metric;
            refreshChart();
        });
    });

    // ── FEATURE 10: HEIGHT UNIT TOGGLE ───────────────────────
    // Uses data-unit, class btn-unit — separate from chart metric toggles
    function updateHeightInputLabel() {
        const label = document.getElementById('heightInputLabel');
        if (label) label.textContent = `Height (${heightUnit})`;
    }

    document.querySelectorAll('.btn-unit').forEach(btn => {
        btn.addEventListener('click', async e => {
            document.querySelectorAll('.btn-unit').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            heightUnit = e.target.dataset.unit;
            updateHeightInputLabel();
            if (db) await putData(db, 'state', { key: 'heightUnit', val: heightUnit });
            refreshChart();
            updateStatCards();
            renderGrowthHistory();
            renderSuggestions(parseInt(document.getElementById('babyAgeSelect').value));
        });
    });

    // ── FEATURE 2: DATE OF BIRTH ────────────────────────────
    function calcAgeMonths(dobStr) {
        if (!dobStr) return 1;
        const birth = new Date(dobStr + 'T00:00:00');
        const now   = new Date();
        let months  = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        return Math.max(1, Math.min(12, months));
    }

    function calcCurrentBabyWeeks() {
        if (!dob) return 4;
        const birth     = new Date(dob + 'T00:00:00');
        const now       = new Date();
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        return Math.floor((now - birth) / msPerWeek);
    }

    const dobInput = document.getElementById('dobInput');
    if (dobInput) {
        dobInput.addEventListener('change', async e => {
            dob = e.target.value || null;
            if (db) {
                if (dob) {
                    await putData(db, 'state', { key: 'dob', val: dob });
                } else {
                    await deleteData(db, 'state', 'dob');
                }
            }
            // Auto-select suggestions age from DOB
            if (dob) {
                const ageMonths = calcAgeMonths(dob);
                const sel = document.getElementById('babyAgeSelect');
                if (sel) {
                    sel.value = ageMonths;
                    renderSuggestions(ageMonths);
                }
            }
            // Feature 6: re-render vaccines with updated DOB
            renderVaccines();
        });
    }

    // ── CHECKBOX SUGGESTION ENGINE ────────────────────────────
    function getKey(age, cat, idx) { return `${age}-${cat}-${idx}`; }

    // Feature 7: confetti burst on milestone check
    function burstConfetti(anchorEl) {
        const colors = ['#7c5cfa', '#ff7597', '#00e676', '#ffab00', '#33b5e5'];
        const rect   = anchorEl.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top  + rect.height / 2;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            const size     = 6 + Math.random() * 6;
            particle.style.cssText = [
                'position:fixed',
                `width:${size}px`,
                `height:${size}px`,
                `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
                `background:${colors[Math.floor(Math.random() * colors.length)]}`,
                `left:${originX}px`,
                `top:${originY}px`,
                'pointer-events:none',
                'z-index:99999'
            ].join(';');
            document.body.appendChild(particle);

            const angle    = Math.random() * 2 * Math.PI;
            const distance = 60 + Math.random() * 120;
            const dx       = Math.cos(angle) * distance;
            const dy       = Math.sin(angle) * distance - 40;
            const rotation = Math.random() * 360;

            const anim = particle.animate([
                { transform: 'translate(0, 0) scale(1) rotate(0deg)',                    opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: 600 + Math.random() * 400,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });
            anim.onfinish = () => particle.remove();
        }
    }

    function buildCheckboxList(ulId, items, cat, age) {
        const ul = document.getElementById(ulId);
        ul.innerHTML = '';
        items.forEach((item, i) => {
            const key     = getKey(age, cat, i);
            const checked = checkState[key] || false;
            const li      = document.createElement('li');
            if (checked) li.classList.add('done');
            li.innerHTML = `<input type="checkbox" id="${key}" ${checked ? 'checked' : ''}><span>${item}</span>`;
            li.querySelector('input').addEventListener('change', async e => {
                checkState[key] = e.target.checked;
                li.classList.toggle('done', e.target.checked);
                updatePercentages(age);
                if (db) await putData(db, 'state', { key: key, val: e.target.checked });
                // Feature 7: fire confetti when a milestone is checked
                if (e.target.checked && cat === 'milestone') {
                    burstConfetti(e.target);
                }
            });
            ul.appendChild(li);
        });
        updatePercentages(age);
    }

    function updatePercentages(age) {
        const cats = ['food', 'milestone', 'memory'];
        const bm   = WHO[age];
        if (!bm) return;
        const lengths    = { food: bm.food.length, milestone: bm.milestone.length, memory: bm.memory.length };
        let totalTicked  = 0, totalAll = 0;

        cats.forEach(cat => {
            const len  = lengths[cat];
            let ticked = 0;
            for (let i = 0; i < len; i++) {
                if (checkState[getKey(age, cat, i)]) ticked++;
            }
            const pct = len ? Math.round(ticked / len * 100) : 0;
            document.getElementById(`${cat}Pct`).textContent  = pct + '%';
            document.getElementById(`${cat}Fill`).style.width = pct + '%';
            totalTicked += ticked;
            totalAll    += len;
        });

        const overall = totalAll ? Math.round(totalTicked / totalAll * 100) : 0;
        document.getElementById('suggestProgressPct').textContent = overall + '%';
        document.getElementById('suggestMasterFill').style.width   = overall + '%';
        document.getElementById('overallProgressVal').textContent  = overall + '%';
        document.getElementById('overallProgressBar').style.width  = overall + '%';
    }

    function renderSuggestions(age) {
        const m  = parseInt(age);
        const bm = WHO[m];
        if (!bm) return;
        document.getElementById('suggestionMonth').textContent = m;
        const ageValEl = document.getElementById('statAgeValue');
        if (ageValEl) ageValEl.textContent = m === 1 ? '1 Month' : m + ' Months';

        // Feature 10: show height in selected unit in benchmark section
        const hP25  = heightUnit === 'cm' ? (bm.h[0] * 30.48).toFixed(1) : bm.h[0];
        const hP75  = heightUnit === 'cm' ? (bm.h[2] * 30.48).toFixed(1) : bm.h[2];
        const hP50  = heightUnit === 'cm' ? (bm.h[1] * 30.48).toFixed(1) : bm.h[1];
        const hUnit = heightUnit;

        document.getElementById('growthBenchmark').innerHTML = `
            <div class="bench-row"><span class="bench-label">Weight (kg)</span><span class="bench-range">${bm.w[0]}–${bm.w[2]}</span><span class="bench-avg">Avg: <strong>${bm.w[1]} kg</strong></span></div>
            <div class="bench-row"><span class="bench-label">Height (${hUnit})</span><span class="bench-range">${hP25}–${hP75}</span><span class="bench-avg">Avg: <strong>${hP50} ${hUnit}</strong></span></div>
            <div class="bench-row"><span class="bench-label">Head Circ. (cm)</span><span class="bench-range">${bm.hc[0]}–${bm.hc[2]}</span><span class="bench-avg">Avg: <strong>${bm.hc[1]} cm</strong></span></div>`;

        buildCheckboxList('foodSuggestions',     bm.food,      'food',      m);
        buildCheckboxList('milestoneSuggestions', bm.milestone, 'milestone', m);
        buildCheckboxList('memorySuggestions',    bm.memory,    'memory',    m);
    }

    renderSuggestions(1);
    document.getElementById('babyAgeSelect').addEventListener('change', e => renderSuggestions(e.target.value));

    // ── VACCINATION ──────────────────────────────────────────
    const IAP_SCHEDULE = [
        { age: 'Birth',     weeks: 0,  doses: [{ id: 'v_bcg',   name: 'BCG',         desc: 'Tuberculosis' },                   { id: 'v_hepb1', name: 'Hep B 1',   desc: 'Hepatitis B' },            { id: 'v_opv0',  name: 'OPV 0',      desc: 'Polio (Oral)' }]},
        { age: '6 Weeks',   weeks: 6,  doses: [{ id: 'v_dtwp1', name: 'DTwP 1',       desc: 'Diphtheria/Tetanus/Pertussis' },    { id: 'v_ipv1',  name: 'IPV 1',     desc: 'Inactivated Polio' },      { id: 'v_hepb2', name: 'Hep B 2',   desc: 'Hepatitis B' }, { id: 'v_hib1', name: 'Hib 1', desc: 'Haemophilus influenzae B' }, { id: 'v_rv1', name: 'Rotavirus 1', desc: 'Rotavirus diarrhea' }, { id: 'v_pcv1', name: 'PCV 1', desc: 'Pneumococcal' }]},
        { age: '10 Weeks',  weeks: 10, doses: [{ id: 'v_dtwp2', name: 'DTwP 2',       desc: 'Diphtheria/Tetanus/Pertussis' },    { id: 'v_ipv2',  name: 'IPV 2',     desc: 'Inactivated Polio' },      { id: 'v_hib2', name: 'Hib 2', desc: 'Haemophilus influenzae B' }, { id: 'v_rv2', name: 'Rotavirus 2', desc: 'Rotavirus diarrhea' }, { id: 'v_pcv2', name: 'PCV 2', desc: 'Pneumococcal' }]},
        { age: '14 Weeks',  weeks: 14, doses: [{ id: 'v_dtwp3', name: 'DTwP 3',       desc: 'Diphtheria/Tetanus/Pertussis' },    { id: 'v_ipv3',  name: 'IPV 3',     desc: 'Inactivated Polio' },      { id: 'v_hib3', name: 'Hib 3', desc: 'Haemophilus influenzae B' }, { id: 'v_rv3', name: 'Rotavirus 3', desc: 'Rotavirus diarrhea' }, { id: 'v_pcv3', name: 'PCV 3', desc: 'Pneumococcal' }]},
        { age: '6 Months',  weeks: 26, doses: [{ id: 'v_opv1',  name: 'OPV 1',        desc: 'Polio (Oral)' },                   { id: 'v_hepb3', name: 'Hep B 3',   desc: 'Hepatitis B' }]},
        { age: '9 Months',  weeks: 39, doses: [{ id: 'v_opv2',  name: 'OPV 2',        desc: 'Polio (Oral)' },                   { id: 'v_mmr1',  name: 'MMR 1',     desc: 'Measles, Mumps, Rubella' }]},
        { age: '12 Months', weeks: 52, doses: [{ id: 'v_hepa1', name: 'Hep A 1',      desc: 'Hepatitis A' }]}
    ];

    let totalDoses = 0;
    IAP_SCHEDULE.forEach(g => {
        totalDoses += g.doses.length;
        g.doses.forEach(d => { if (vaccState[d.id] === undefined) vaccState[d.id] = false; });
    });
    document.getElementById('vaccTotalLabel').textContent = `of ${totalDoses} doses`;

    // Feature 6: compute exact due date from DOB + weeks offset
    function getDueDate(weeksOffset) {
        if (!dob) return null;
        const birth = new Date(dob + 'T00:00:00');
        birth.setDate(birth.getDate() + weeksOffset * 7);
        return birth;
    }

    function renderVaccines() {
        // Feature 6: use real weeks if DOB is known
        const currentBabyWeeks = calcCurrentBabyWeeks();
        const now = new Date();
        const vaccContainer = document.getElementById('vaccTimeline');
        if (!vaccContainer) return;
        vaccContainer.innerHTML = '';
        let completedDoses = 0;

        IAP_SCHEDULE.forEach(group => {
            let groupDosesStr = '';
            let groupGiven    = 0;
            const dueDate     = getDueDate(group.weeks);

            group.doses.forEach(dose => {
                const isGiven = vaccState[dose.id];
                if (isGiven) groupGiven++;

                let statusClass = 'status-upcoming';
                let chipClass   = 'chip-upcoming';
                let chipText    = 'Upcoming';

                if (isGiven) {
                    statusClass = 'status-given';
                    chipClass   = 'chip-given';
                    chipText    = 'Given';
                    completedDoses++;
                } else if (currentBabyWeeks >= group.weeks) {
                    statusClass = 'status-due';
                    chipClass   = 'chip-due';
                    chipText    = 'Due';
                } else if (dueDate) {
                    // Feature 6: show "Due in Xd" or actual date
                    const msUntilDue   = dueDate - now;
                    const daysUntilDue = Math.ceil(msUntilDue / (1000 * 60 * 60 * 24));
                    if (daysUntilDue <= 14) {
                        statusClass = 'status-due';
                        chipClass   = 'chip-due-soon';
                        chipText    = daysUntilDue <= 0 ? 'Due' : `Due in ${daysUntilDue}d`;
                    } else {
                        // Show actual due date
                        chipText = `Due ${formatDate(dueDate.toISOString().split('T')[0])}`;
                    }
                }

                groupDosesStr += `
                    <label class="vacc-dose-row ${statusClass}">
                        <input type="checkbox" data-id="${dose.id}" ${isGiven ? 'checked' : ''}>
                        <div class="vacc-dose-info">
                            <div class="vacc-dose-name">${dose.name} <span class="vacc-chip ${chipClass}">${chipText}</span></div>
                            <div class="vacc-dose-desc">${dose.desc}</div>
                        </div>
                    </label>
                `;
            });

            const groupPct = Math.round((groupGiven / group.doses.length) * 100);
            const groupEl  = document.createElement('div');
            groupEl.className = 'vacc-group';
            groupEl.innerHTML = `
                <div class="vacc-group-header">
                    <div class="vacc-group-age">${group.age}</div>
                    <div class="vacc-group-bar"><div class="vacc-group-fill" style="width: ${groupPct}%"></div></div>
                    <div class="vacc-group-pct">${groupPct}%</div>
                </div>
                <div class="vacc-doses">
                    ${groupDosesStr}
                </div>
            `;
            vaccContainer.appendChild(groupEl);
        });

        // Attach change listeners after DOM insertion
        vaccContainer.querySelectorAll('.vacc-dose-row input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', async e => {
                const id = e.target.dataset.id;
                vaccState[id] = e.target.checked;
                renderVaccines();
                if (db) await putData(db, 'state', { key: id, val: e.target.checked });
            });
        });

        updateVaccineProgress(completedDoses);
    }

    function updateVaccineProgress(done) {
        document.getElementById('vaccDoneCount').textContent = done;
        const pct    = Math.round((done / totalDoses) * 100);
        document.getElementById('vaccProgressPct').textContent = pct + '%';
        const ringFill = document.getElementById('vaccRingFill');
        if (ringFill) ringFill.setAttribute('stroke-dasharray', `${pct}, 100`);
    }

    renderVaccines();

    // ── MODAL & TABS ─────────────────────────────────────────
    const modal    = document.getElementById('addEntryModal');
    const openBtn  = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');

    openBtn.addEventListener('click',  () => { modal.classList.add('active'); switchTab('growth'); });
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    function switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.entry-form').forEach(f => f.classList.toggle('active', f.id === tab + 'Form'));
    }

    // ── FORMS ────────────────────────────────────────────────
    document.getElementById('growthForm').addEventListener('submit', async e => {
        e.preventDefault();
        const wt     = parseFloat(document.getElementById('weight').value);
        // Feature 10: input is in heightUnit; always store in ft
        const htRaw  = parseFloat(document.getElementById('height').value);
        const ht     = heightUnit === 'cm' ? parseFloat((htRaw / 30.48).toFixed(4)) : htRaw;

        // Feature 1: head circumference (optional)
        const hcInput = document.getElementById('headCirc');
        const hcVal   = hcInput && hcInput.value ? parseFloat(hcInput.value) : null;

        // Feature 4: entry date
        const dateInput = document.getElementById('growthDate');
        const dateVal   = dateInput ? dateInput.value : '';

        // Feature 5: notes
        const notesInput = document.getElementById('growthNotes');
        const notesVal   = notesInput ? notesInput.value.trim() : '';

        const newLabel = `Mo ${labels.length + 1}`;
        labels.push(newLabel);
        weightData.push(wt);
        heightData.push(ht);
        hcData.push(hcVal);

        initChart();

        if (db) {
            const record = { w: wt, h: ht, hc: hcVal, label: newLabel, date: dateVal, notes: notesVal };
            await addData(db, 'growth', record);
            renderGrowthHistory();
        }
        e.target.reset();
        showToast('Growth data saved!');
        modal.classList.remove('active');
    });

    function updateStatCards() {
        if (!weightData.length) return;
        const currentWt = weightData[weightData.length - 1];
        const currentHt = heightData[heightData.length - 1];
        const currentHC = hcData[hcData.length - 1];

        document.getElementById('weightValue').textContent = currentWt.toFixed(2) + ' kg';

        // Feature 10: display in selected unit
        if (heightUnit === 'cm') {
            document.getElementById('heightValue').textContent = (currentHt * 30.48).toFixed(1) + ' cm';
        } else {
            document.getElementById('heightValue').textContent = currentHt.toFixed(2) + ' ft';
        }

        // Feature 1: HC stat card
        const hcEl = document.getElementById('hcValue');
        if (hcEl) {
            hcEl.textContent = currentHC != null ? currentHC.toFixed(1) + ' cm' : '— cm';
        }

        if (weightData.length > 1) {
            const diffW = (currentWt - weightData[weightData.length - 2]).toFixed(2);
            document.getElementById('weightTrend').innerHTML = diffW > 0
                ? `<i class="fa-solid fa-arrow-trend-up"></i> +${diffW} kg since last entry`
                : `<i class="fa-solid fa-arrow-trend-down"></i> ${diffW} kg since last entry`;
            document.getElementById('weightTrend').className = diffW >= 0 ? 'stat-subtext trend-up' : 'stat-subtext dev-below';
        }

        if (heightData.length > 1) {
            const prevHt = heightData[heightData.length - 2];
            const rawDiff = currentHt - prevHt;
            let diffH, diffUnit;
            if (heightUnit === 'cm') {
                diffH    = (rawDiff * 30.48).toFixed(1);
                diffUnit = 'cm';
            } else {
                diffH    = rawDiff.toFixed(2);
                diffUnit = 'ft';
            }
            document.getElementById('heightTrend').innerHTML = rawDiff > 0
                ? `<i class="fa-solid fa-arrow-trend-up"></i> +${diffH} ${diffUnit} since last entry`
                : `<i class="fa-solid fa-arrow-trend-down"></i> ${diffH} ${diffUnit} since last entry`;
            document.getElementById('heightTrend').className = rawDiff >= 0 ? 'stat-subtext trend-up' : 'stat-subtext dev-below';
        }

        // Feature 1: HC trend
        const hcTrendEl = document.getElementById('hcTrend');
        if (hcTrendEl) {
            if (currentHC != null && hcData.length > 1) {
                const prevHC = hcData.slice(0, -1).filter(v => v != null).pop();
                if (prevHC != null) {
                    const diffHC = (currentHC - prevHC).toFixed(1);
                    hcTrendEl.innerHTML = diffHC > 0
                        ? `<i class="fa-solid fa-arrow-trend-up"></i> +${diffHC} cm since last entry`
                        : `<i class="fa-solid fa-arrow-trend-down"></i> ${diffHC} cm since last entry`;
                    hcTrendEl.className = parseFloat(diffHC) >= 0 ? 'stat-subtext trend-up' : 'stat-subtext dev-below';
                }
            }
        }
    }

    const msPhotoInput  = document.getElementById('milestonePhoto');
    const msPreview     = document.getElementById('imagePreviewMilestone');
    const msPlaceholder = document.getElementById('placeholderMilestone');

    if (msPhotoInput) {
        msPhotoInput.addEventListener('change', () => {
            const file = msPhotoInput.files[0];
            if (!file) {
                msPreview.src = ''; msPreview.style.display = 'none'; msPlaceholder.style.display = 'flex';
                return;
            }
            msPreview.src = URL.createObjectURL(file);
            msPreview.style.display = 'block'; msPlaceholder.style.display = 'none';
        });
    }

    document.getElementById('milestoneForm').addEventListener('submit', async e => {
        e.preventDefault();
        const file   = msPhotoInput ? msPhotoInput.files[0] : null;
        let imgUrl   = null;
        if (file) imgUrl = URL.createObjectURL(file);

        let record = {
            icon: 'fa-solid fa-star',
            title: document.getElementById('milestoneTitle').value,
            desc: document.getElementById('milestoneDesc').value,
            date: formatDate(document.getElementById('milestoneDate').value),
            file: file
        };

        if (db) {
            const newId = await addData(db, 'timeline', record);
            record.id = newId;
        }

        prependTimeline({ ...record, imgUrl });
        e.target.reset();
        if (msPreview && msPlaceholder) { msPreview.src = ''; msPreview.style.display = 'none'; msPlaceholder.style.display = 'flex'; }
        showToast('Milestone added!');
        modal.classList.remove('active');
    });

    const healthIcons = { vaccine: 'fa-solid fa-syringe', medication: 'fa-solid fa-pills', vitamin: 'fa-solid fa-capsules', checkup: 'fa-solid fa-stethoscope' };

    document.getElementById('healthForm').addEventListener('submit', async e => {
        e.preventDefault();
        const type  = document.getElementById('healthType').value;
        const icon  = healthIcons[type] || 'fa-solid fa-heart-pulse';
        const title = document.getElementById('healthDesc').value;
        const desc  = capitalize(type);
        const date  = formatDate(document.getElementById('healthDate').value);

        let record = { icon, title, desc, date };
        if (db) {
            const newId = await addData(db, 'timeline', record);
            record.id = newId;
        }

        prependTimeline(record);
        e.target.reset();
        showToast('Health record saved!');
        modal.classList.remove('active');
    });

    const memPhotoInput  = document.getElementById('memoryPhoto');
    const memPreview     = document.getElementById('imagePreviewMemory');
    const memPlaceholder = document.getElementById('placeholderMemory');

    memPhotoInput.addEventListener('change', () => {
        const file = memPhotoInput.files[0];
        if (!file) {
            memPreview.src = ''; memPreview.style.display = 'none'; memPlaceholder.style.display = 'flex';
            return;
        }
        memPreview.src = URL.createObjectURL(file);
        memPreview.style.display = 'block'; memPlaceholder.style.display = 'none';
    });

    document.getElementById('memoryForm').addEventListener('submit', async e => {
        e.preventDefault();
        const caption = document.getElementById('memoryCaption').value;
        const date    = formatDate(document.getElementById('memoryDate').value);
        const file    = memPhotoInput.files[0];

        let record = { caption, date, file };
        if (db) {
            const newId = await addData(db, 'memories', record);
            record.id = newId;
        }

        let fileUrl = '';
        if (file) fileUrl = URL.createObjectURL(file);

        addMemoryCard({ ...record, fileUrl });
        e.target.reset();
        memPreview.src = ''; memPreview.style.display = 'none'; memPlaceholder.style.display = 'flex';
        showToast('Memory saved!');
        modal.classList.remove('active');
    });

    // ── FEATURE 3: EXPORT JSON ──────────────────────────────
    async function exportData() {
        if (!db) { showToast('No database available.'); return; }

        const growthRaw   = await getStoreData(db, 'growth');
        const timelineRaw = await getStoreData(db, 'timeline');
        const memoriesRaw = await getStoreData(db, 'memories');
        const stateRaw    = await getStoreData(db, 'state');

        // Strip non-serializable File objects
        const stripFile = arr => arr.map(item => {
            const copy = { ...item };
            delete copy.file;
            return copy;
        });

        const exportObj = {
            exportedAt: new Date().toISOString(),
            growth:     stripFile(growthRaw),
            timeline:   stripFile(timelineRaw),
            memories:   stripFile(memoriesRaw),
            state:      stateRaw
        };

        const json = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `sprout-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data exported!');
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);

    // ── FEATURE 9: IMPORT JSON ──────────────────────────────
    async function importData(jsonStr) {
        if (!db) { showToast('No database available.'); return; }
        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch (err) {
            showToast('Invalid JSON file.');
            return;
        }

        try {
            await clearStore(db, 'growth');
            await clearStore(db, 'timeline');
            await clearStore(db, 'memories');
            await clearStore(db, 'state');

            const stores = ['growth', 'timeline', 'memories', 'state'];
            for (const storeName of stores) {
                const records = parsed[storeName] || [];
                for (const record of records) {
                    const copy = { ...record };
                    delete copy.file;
                    // Let autoIncrement assign new ids for non-state stores
                    if (storeName !== 'state') delete copy.id;
                    await new Promise((resolve) => {
                        const tx  = db.transaction(storeName, 'readwrite');
                        tx.objectStore(storeName).add(copy);
                        tx.oncomplete = resolve;
                        tx.onerror    = resolve;
                    });
                }
            }

            showToast('Import successful! Reloading...');
            setTimeout(() => location.reload(), 1200);
        } catch (err) {
            console.error('Import error', err);
            showToast('Import failed: ' + err.message);
        }
    }

    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader    = new FileReader();
            reader.onload   = ev => importData(ev.target.result);
            reader.onerror  = () => showToast('Failed to read file.');
            reader.readAsText(file);
            e.target.value  = ''; // allow re-import of same file
        });
    }

    // ── HELPERS ──────────────────────────────────────────────
    function prependTimeline(item) {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.style.animation = 'fadeIn 0.4s ease';
        div.dataset.id = item.id;

        // Feature 8: photo thumbnail from blob URL
        const imgHtml = item.imgUrl
            ? `<img src="${item.imgUrl}" alt="${item.title || ''} photo" class="timeline-image">`
            : '';

        div.innerHTML = `
            <div class="timeline-icon"><i class="${item.icon}"></i></div>
            <div class="timeline-content"><h4>${item.title}</h4><p>${item.desc}</p>${imgHtml}<span class="date">${item.date}</span></div>
            <div class="action-buttons">
                <button class="btn-action delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>`;

        div.querySelector('.delete').addEventListener('click', async () => {
            if (confirm('Delete this timeline entry?')) {
                if (db && item.id) await deleteData(db, 'timeline', item.id);
                div.remove();
                showToast('Entry deleted!');
            }
        });
        document.querySelector('.timeline').insertBefore(div, document.querySelector('.timeline').firstChild);
    }

    function addMemoryCard(item) {
        const grid  = document.getElementById('memoryGrid');
        const empty = grid.querySelector('.empty-state');
        if (empty) empty.remove();
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.style.animation = 'fadeIn 0.5s ease';
        div.dataset.id = item.id;

        // Feature 8: ensure photo loads from blob URL on refresh
        if (item.fileUrl) {
            div.innerHTML = `<img src="${item.fileUrl}" alt="${item.caption}"><div class="memory-caption-overlay"><p>${item.caption}</p><span>${item.date}</span></div>`;
        } else {
            div.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--primary-light); color:var(--primary); font-size:2.5rem;"><i class="fa-solid fa-camera-retro"></i></div><div class="memory-caption-overlay"><p>${item.caption}</p><span>${item.date}</span></div>`;
        }

        div.innerHTML += `
            <div class="action-buttons">
                <button class="btn-action delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        div.querySelector('.delete').addEventListener('click', async () => {
            if (confirm('Delete this memory?')) {
                if (db && item.id) await deleteData(db, 'memories', item.id);
                div.remove();
                if (grid.children.length === 0) {
                    grid.innerHTML = `<div class="memory-item empty-state"><i class="fa-solid fa-camera"></i><p>No memories yet — capture Rudhir's first moments!</p></div>`;
                }
                showToast('Memory deleted!');
            }
        });

        grid.insertBefore(div, grid.firstChild);
    }

    function showToast(msg) {
        let t = document.getElementById('toastMsg');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toastMsg';
            t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(60px);
                background:linear-gradient(135deg,#1a1a28,#12121a);color:#f0f0ff;padding:.875rem 1.5rem;
                border-radius:14px;font-family:'Outfit',sans-serif;font-size:.9rem;font-weight:600;
                box-shadow:0 8px 30px rgba(0,0,0,.5),0 0 0 1px rgba(124,92,250,0.3);
                transition:transform .35s cubic-bezier(.4,0,.2,1),opacity .35s;
                opacity:0;z-index:9999;white-space:nowrap;border:1px solid rgba(124,92,250,0.25)`;
            document.body.appendChild(t);
        }
        t.textContent = msg;
        requestAnimationFrame(() => { t.style.transform = 'translateX(-50%) translateY(0)'; t.style.opacity = '1'; });
        setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(60px)'; t.style.opacity = '0'; }, 2600);
    }

    function formatDate(s) {
        if (!s) return 'Today';
        const d = new Date(s + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    // ── Mobile hamburger menu ─────────────────────────────────
    const sidebar      = document.getElementById('sidebar');
    const overlay      = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarClose = document.getElementById('sidebarClose');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (overlay)      overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
});
