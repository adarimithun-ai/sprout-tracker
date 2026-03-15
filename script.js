document.addEventListener('DOMContentLoaded', () => {

    // ── WHO BENCHMARKS (weight kg, height ft) ─────────────────
    // weight / height: [p25, p50, p75]
    const WHO = {
        1:  { w:[3.6,4.2,4.9],  h:[1.60,1.67,1.74],  food:['Breast milk / formula only — 8–12 feeds/day','No water or solids needed','Watch for hunger cues: rooting, sucking hands'], milestone:['Lifts head briefly during tummy time','Follows moving objects with eyes','Responds to familiar voices','Strong grasp reflex'], memory:['First bath photo','First smile capture','Close-up of tiny hands & feet','Date night as new parents'] },
        2:  { w:[4.3,5.1,5.8],  h:[1.77,1.84,1.91],  food:['Continue breast milk/formula exclusively','~600–900 ml/day','Watch for feeding cues, not clock'], milestone:['Smiles socially first time','Coos and gurgles','Holds head 45° on tummy time','Tracks faces with eyes'], memory:['First smile portrait','2-month milestone sign','Black & white toy interaction','Family cuddle session'] },
        3:  { w:[5.0,6.0,7.0],  h:[1.92,2.00,2.08],  food:['Breast milk / formula only','~700–950 ml/day','Growth spurt — feed on demand'], milestone:['Becomes more vocal','Brings hands to mouth','Mini push-ups on tummy time','Laughs out loud first time'], memory:['First laugh video','3-month mini photoshoot','Bath time bubbles','First outdoor trip'] },
        4:  { w:[5.6,6.7,7.8],  h:[2.03,2.11,2.20],  food:['Still breast milk / formula only','~750–1000 ml/day','Watch for solids readiness signs'], milestone:['Rolls tummy to back','Reaches for objects intentionally','Bears weight on legs when held','Recognizes own name'], memory:['First roll video','Reading time together','Park/garden stroll','Meeting relatives'] },
        5:  { w:[6.1,7.3,8.4],  h:[2.11,2.19,2.28],  food:['Breast milk / formula primary','Some babies show interest in solids','Offer spoon / training cup exposure'], milestone:['Sits with support','Transfers objects hand-to-hand','Blows raspberries!','Stranger anxiety may begin'], memory:['Sitting with support photo','First high-chair try','Bubbles play session','5-month milestone board'] },
        6:  { w:[6.6,7.9,9.0],  h:[2.18,2.26,2.36],  food:['Introduce single-grain iron-fortified cereals','Try purées: sweet potato, pea, pear, banana','Continue breast milk/formula as main','Avoid honey, salt, sugar'], milestone:['Sits independently','Starts babbling (ba-ba, da-da)','Passes objects between hands','First tooth may appear'], memory:['First bite of solid food!','6-month professional photoshoot','First swing ride','Babbling video'] },
        7:  { w:[6.9,8.3,9.6],  h:[2.23,2.31,2.42],  food:['2–3 small solid meals/day','Mashed fruits & veggies','Avoid choking hazards, honey','Offer water in sippy cup with meals'], milestone:['Beginning to crawl / creep','Responds to "no"','Waves bye-bye','Object permanence developing'], memory:['First crawl attempt','Peek-a-boo video','Beach/pool visit','Daddy/mommy playtime'] },
        8:  { w:[7.2,8.6,10.0], h:[2.27,2.35,2.46],  food:['3 solid meals + 2 snacks','Soft finger foods: banana, steamed carrot, soft bread','Continue breast milk/formula','Introduce avocado, egg yolk, lentils, yoghurt'], milestone:['Crawls confidently','Pulls to stand','Pincer grasp developing','Says "mama" or "dada" specifically'], memory:['Crawling race video','First playground visit','8-month sign photo','Baby\'s first foodie spread'] },
        9:  { w:[7.5,9.0,10.4], h:[2.30,2.39,2.49],  food:['3 meals + 2 snacks/day','Small soft lumps OK','Introduce pasta, soft meat, tofu, cheese','Avoid large chunks, uncut grapes'], milestone:['Stands holding furniture','Cruises along furniture','Claps hands','Searches for hidden objects'], memory:['Pulling to stand photo','Bath time splash','9-month milestone collage','First clapping video'] },
        10: { w:[7.7,9.2,10.7], h:[2.34,2.42,2.52],  food:['Expanding texture variety','Share adapted family meals','Dairy: yoghurt, soft cheese OK','Iron-rich foods important'], milestone:['Says 1–2 meaningful words','Points at objects of interest','Waves goodbye consistently','Copies simple actions'], memory:['Pointing & discovering video','First word recording','10-month outdoor shoot','Baby bookshelf exploration'] },
        11: { w:[7.9,9.4,11.0], h:[2.37,2.45,2.55],  food:['Varied balanced meals','Soft fish, well-cooked beans, lentils','Mashed family food','Limit fruit juice ≤120 ml/day'], milestone:['Walks with support','Understands simple commands','Shakes head "no"','Stacks 2 blocks'], memory:['First steps with support video','Block stacking photo','Music & dancing session','11-month measurement photo'] },
        12: { w:[8.1,9.6,11.3], h:[2.39,2.48,2.57],  food:['Transition to whole cow milk (350–500 ml/day)','3 balanced meals + 2 snacks','Introduce most foods except honey','Birthday cake — small slice!'], milestone:['First independent steps 🎉','Says 3–5 words','Points to pictures in books','Feeds self with fingers'], memory:['1st Birthday photoshoot','First solo steps video','Cake smash session 🎂','Year-in-review collage'] }
    };

    // ── GROWTH DATA STORE ────────────────────────────────────
    const weightData = [3.4];
    const heightData = [1.64];
    const labels     = ['Mo 1'];

    // ── CHART ────────────────────────────────────────────────
    const ctx = document.getElementById('growthChart').getContext('2d');
    let activeMetric = 'weight';

    const buildChart = () => {
        const data    = activeMetric === 'weight' ? weightData : heightData;
        const unit    = activeMetric === 'weight' ? 'kg' : 'ft';
        const color   = activeMetric === 'weight' ? '#7c5cfa' : '#ff7597';
        const n       = labels.length;

        // Build WHO benchmark arrays to match current labels length
        const benchP25 = Array.from({length: n}, (_, i) => WHO[i+1] ? (activeMetric === 'weight' ? WHO[i+1].w[0] : WHO[i+1].h[0]) : null);
        const benchP75 = Array.from({length: n}, (_, i) => WHO[i+1] ? (activeMetric === 'weight' ? WHO[i+1].w[2] : WHO[i+1].h[2]) : null);
        const benchP50 = Array.from({length: n}, (_, i) => WHO[i+1] ? (activeMetric === 'weight' ? WHO[i+1].w[1] : WHO[i+1].h[1]) : null);

        const babyGrad = ctx.createLinearGradient(0, 0, 0, 260);
        babyGrad.addColorStop(0, activeMetric === 'weight' ? 'rgba(124,92,250,0.40)' : 'rgba(255,117,151,0.40)');
        babyGrad.addColorStop(1, 'rgba(0,0,0,0.02)');

        return {
            type: 'line',
            data: {
                labels,
                datasets: [
                    // dataset index 0: P25 lower bound (hidden label, no fill)
                    {
                        label: 'WHO P25',
                        data: benchP25,
                        borderColor: 'rgba(0,230,118,0.35)',
                        borderWidth: 1.5,
                        borderDash: [5, 4],
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                        order: 4
                    },
                    // dataset index 1: P75 upper bound — fill DOWN to dataset index 0 (P25)
                    {
                        label: 'WHO P75 band',
                        data: benchP75,
                        borderColor: 'rgba(0,230,118,0.35)',
                        borderWidth: 1.5,
                        borderDash: [5, 4],
                        pointRadius: 0,
                        backgroundColor: 'rgba(0,230,118,0.08)',
                        fill: { target: 0, above: 'rgba(0,230,118,0.08)', below: 'rgba(0,0,0,0)' },
                        tension: 0.4,
                        order: 4
                    },
                    // dataset index 2: WHO median
                    {
                        label: `WHO Median`,
                        data: benchP50,
                        borderColor: 'rgba(0,230,118,0.75)',
                        borderWidth: 2,
                        borderDash: [7, 3],
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                        order: 3
                    },
                    // dataset index 3: Rudhir's growth line
                    {
                        label: `Rudhir (${unit})`,
                        data: [...data],
                        borderColor: color,
                        backgroundColor: babyGrad,
                        borderWidth: 3,
                        pointBackgroundColor: '#0a0a0f',
                        pointBorderColor: color,
                        pointBorderWidth: 2.5,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        fill: true,
                        tension: 0.4,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#7b7b9e',
                            font: { family: 'Outfit', size: 11 },
                            boxWidth: 14,
                            padding: 16,
                            filter: item => !item.text.includes('P25') && !item.text.includes('P75 band')
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(18,18,26,0.97)',
                        titleColor: '#f0f0ff',
                        bodyColor: '#7b7b9e',
                        borderColor: 'rgba(124,92,250,0.3)',
                        borderWidth: 1,
                        padding: 14,
                        callbacks: {
                            label: c => ` ${c.dataset.label}: ${c.parsed.y} ${unit}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { font: { family: 'Outfit' }, color: '#7b7b9e' }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { family: 'Outfit' }, color: '#7b7b9e' }
                    }
                },
                interaction: { intersect: false, mode: 'index' },
                animation: { duration: 700, easing: 'easeOutQuart' }
            }
        };
    };

    let growthChart = new Chart(ctx, buildChart());

    function refreshChart() {
        growthChart.destroy();
        growthChart = new Chart(ctx, buildChart());
        updateDeviationInfo();
    }

    function updateDeviationInfo() {
        const n = labels.length;
        const lastIdx = n - 1;
        const monthNum = lastIdx + 1;
        if (!WHO[monthNum]) return;

        const rudhirW = weightData[lastIdx];
        const rudhirH = heightData[lastIdx];
        const whoW_p50 = WHO[monthNum].w[1];
        const whoH_p50 = WHO[monthNum].h[1];
        const wDev = ((rudhirW - whoW_p50) / whoW_p50 * 100).toFixed(1);
        const hDev = ((rudhirH - whoH_p50) / whoH_p50 * 100).toFixed(1);

        const wClass = wDev > 0 ? 'dev-above' : wDev < 0 ? 'dev-below' : 'dev-normal';
        const hClass = hDev > 0 ? 'dev-above' : hDev < 0 ? 'dev-below' : 'dev-normal';
        const wArrow = wDev > 0 ? '▲' : wDev < 0 ? '▼' : '●';
        const hArrow = hDev > 0 ? '▲' : hDev < 0 ? '▼' : '●';

        document.getElementById('deviationInfo').innerHTML = `
            <div class="dev-tag"><div class="dev-dot" style="background:#7c5cfa"></div>
                <span>Rudhir Weight:</span>
                <strong class="${wClass}">${wArrow} ${Math.abs(wDev)}% ${wDev > 0 ? 'above' : wDev < 0 ? 'below' : 'at'} WHO median</strong>
            </div>
            <div class="dev-tag"><div class="dev-dot" style="background:#ff7597"></div>
                <span>Rudhir Height:</span>
                <strong class="${hClass}">${hArrow} ${Math.abs(hDev)}% ${hDev > 0 ? 'above' : hDev < 0 ? 'below' : 'at'} WHO median</strong>
            </div>
            <div class="dev-tag"><div class="dev-dot" style="background:rgba(0,230,118,0.7)"></div>
                <span style="color:#7b7b9e">Green band = WHO 25th–75th percentile range</span>
            </div>`;
    }

    updateDeviationInfo();

    // Chart toggle
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeMetric = e.target.dataset.metric;
            refreshChart();
        });
    });

    // ── CHECKBOX SUGGESTION ENGINE ────────────────────────────
    const checkState = {}; // store ticked boxes across age changes

    function getKey(age, cat, idx) { return `${age}-${cat}-${idx}`; }

    function buildCheckboxList(ulId, items, cat, age, pctId, fillId) {
        const ul = document.getElementById(ulId);
        ul.innerHTML = '';
        items.forEach((item, i) => {
            const key = getKey(age, cat, i);
            const checked = checkState[key] || false;
            const li = document.createElement('li');
            if (checked) li.classList.add('done');
            li.innerHTML = `<input type="checkbox" id="${key}" ${checked ? 'checked' : ''}><span>${item}</span>`;
            li.querySelector('input').addEventListener('change', e => {
                checkState[key] = e.target.checked;
                li.classList.toggle('done', e.target.checked);
                updatePercentages(age);
            });
            ul.appendChild(li);
        });
        updatePercentages(age);
    }

    function updatePercentages(age) {
        const cats = ['food', 'milestone', 'memory'];
        const bm = WHO[age];
        if (!bm) return;
        const lengths = { food: bm.food.length, milestone: bm.milestone.length, memory: bm.memory.length };
        let totalTicked = 0, totalAll = 0;

        cats.forEach(cat => {
            const len = lengths[cat];
            let ticked = 0;
            for (let i = 0; i < len; i++) {
                if (checkState[getKey(age, cat, i)]) ticked++;
            }
            const pct = len ? Math.round(ticked / len * 100) : 0;
            document.getElementById(`${cat}Pct`).textContent = pct + '%';
            document.getElementById(`${cat}Fill`).style.width = pct + '%';
            totalTicked += ticked;
            totalAll += len;
        });

        const overall = totalAll ? Math.round(totalTicked / totalAll * 100) : 0;
        document.getElementById('suggestProgressPct').textContent = overall + '%';
        document.getElementById('suggestMasterFill').style.width   = overall + '%';
        document.getElementById('overallProgressVal').textContent  = overall + '%';
        document.getElementById('overallProgressBar').style.width  = overall + '%';
    }

    function renderSuggestions(age) {
        const m = parseInt(age);
        const bm = WHO[m];
        if (!bm) return;
        document.getElementById('suggestionMonth').textContent = m;
        
        const ageValEl = document.getElementById('statAgeValue');
        if (ageValEl) ageValEl.textContent = m === 1 ? '1 Month' : m + ' Months';

        // Growth benchmark (static text, no checklist)
        document.getElementById('growthBenchmark').innerHTML = `
            <div class="bench-row"><span class="bench-label">Weight (kg)</span>
                <span class="bench-range">${bm.w[0]}–${bm.w[2]}</span>
                <span class="bench-avg">Avg: <strong>${bm.w[1]} kg</strong></span>
            </div>
            <div class="bench-row"><span class="bench-label">Height (ft)</span>
                <span class="bench-range">${bm.h[0]}–${bm.h[2]}</span>
                <span class="bench-avg">Avg: <strong>${bm.h[1]} ft</strong></span>
            </div>`;

        buildCheckboxList('foodSuggestions',    bm.food,      'food',      m, 'foodPct',      'foodFill');
        buildCheckboxList('milestoneSuggestions',bm.milestone,'milestone', m, 'milestonePct', 'milestoneFill');
        buildCheckboxList('memorySuggestions',   bm.memory,   'memory',    m, 'memoryPct',    'memoryFill');
    }

    renderSuggestions(1);

    document.getElementById('babyAgeSelect').addEventListener('change', e => renderSuggestions(e.target.value));

    // ── VACCINATION ──────────────────────────────────────────
    const IAP_SCHEDULE = [
        { age: 'Birth', weeks: 0, doses: [
            { id: 'v_bcg', name: 'BCG', desc: 'Tuberculosis' },
            { id: 'v_hepb1', name: 'Hep B 1', desc: 'Hepatitis B' },
            { id: 'v_opv0', name: 'OPV 0', desc: 'Polio (Oral)' }
        ]},
        { age: '6 Weeks', weeks: 6, doses: [
            { id: 'v_dtwp1', name: 'DTwP 1', desc: 'Diphtheria, Tetanus, Pertussis' },
            { id: 'v_ipv1', name: 'IPV 1', desc: 'Inactivated Polio' },
            { id: 'v_hepb2', name: 'Hep B 2', desc: 'Hepatitis B' },
            { id: 'v_hib1', name: 'Hib 1', desc: 'Haemophilus influenzae B' },
            { id: 'v_rv1', name: 'Rotavirus 1', desc: 'Rotavirus diarrhea' },
            { id: 'v_pcv1', name: 'PCV 1', desc: 'Pneumococcal' }
        ]},
        { age: '10 Weeks', weeks: 10, doses: [
            { id: 'v_dtwp2', name: 'DTwP 2', desc: 'Diphtheria, Tetanus, Pertussis' },
            { id: 'v_ipv2', name: 'IPV 2', desc: 'Inactivated Polio' },
            { id: 'v_hib2', name: 'Hib 2', desc: 'Haemophilus influenzae B' },
            { id: 'v_rv2', name: 'Rotavirus 2', desc: 'Rotavirus diarrhea' },
            { id: 'v_pcv2', name: 'PCV 2', desc: 'Pneumococcal' }
        ]},
        { age: '14 Weeks', weeks: 14, doses: [
            { id: 'v_dtwp3', name: 'DTwP 3', desc: 'Diphtheria, Tetanus, Pertussis' },
            { id: 'v_ipv3', name: 'IPV 3', desc: 'Inactivated Polio' },
            { id: 'v_hib3', name: 'Hib 3', desc: 'Haemophilus influenzae B' },
            { id: 'v_rv3', name: 'Rotavirus 3', desc: 'Rotavirus diarrhea' },
            { id: 'v_pcv3', name: 'PCV 3', desc: 'Pneumococcal' }
        ]},
        { age: '6 Months', weeks: 26, doses: [
            { id: 'v_opv1', name: 'OPV 1', desc: 'Polio (Oral)' },
            { id: 'v_hepb3', name: 'Hep B 3', desc: 'Hepatitis B' }
        ]},
        { age: '9 Months', weeks: 39, doses: [
            { id: 'v_opv2', name: 'OPV 2', desc: 'Polio (Oral)' },
            { id: 'v_mmr1', name: 'MMR 1', desc: 'Measles, Mumps, Rubella' }
        ]},
        { age: '12 Months', weeks: 52, doses: [
            { id: 'v_hepa1', name: 'Hep A 1', desc: 'Hepatitis A' }
        ]}
    ];

    const vaccState = {};
    let totalDoses = 0;
    
    // Initialize state
    IAP_SCHEDULE.forEach(group => {
        totalDoses += group.doses.length;
        group.doses.forEach(d => vaccState[d.id] = false);
    });

    document.getElementById('vaccTotalLabel').textContent = `of ${totalDoses} doses`;

    function renderVaccines() {
        const currentBabyWeeks = 4; // Assume 1 month old to match start
        
        const vaccContainer = document.getElementById('vaccTimeline');
        if (!vaccContainer) return;
        vaccContainer.innerHTML = '';
        let completedDoses = 0;

        IAP_SCHEDULE.forEach(group => {
            let groupDosesStr = '';
            let groupGiven = 0;

            group.doses.forEach(dose => {
                const isGiven = vaccState[dose.id];
                if (isGiven) groupGiven++;
                
                let statusClass = 'status-upcoming';
                let chipClass = 'chip-upcoming';
                let chipText = 'Upcoming';

                if (isGiven) {
                    statusClass = 'status-given';
                    chipClass = 'chip-given';
                    chipText = 'Given';
                    completedDoses++;
                } else if (currentBabyWeeks >= group.weeks) {
                    statusClass = 'status-due';
                    chipClass = 'chip-due';
                    chipText = 'Due';
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

            const groupEl = document.createElement('div');
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

        document.querySelectorAll('.vacc-dose-row input[type="Checkbox"]').forEach(chk => {
            chk.addEventListener('change', e => {
                vaccState[e.target.dataset.id] = e.target.checked;
                renderVaccines();
            });
        });
        
        updateVaccineProgress();
    }

    function updateVaccineProgress() {
        let done = 0;
        Object.keys(vaccState).forEach(k => { if (vaccState[k]) done++; });
        
        document.getElementById('vaccDoneCount').textContent = done;
        const pct = Math.round((done / totalDoses) * 100);
        document.getElementById('vaccProgressPct').textContent = pct + '%';
        
        const ringFill = document.getElementById('vaccRingFill');
        if (ringFill) ringFill.setAttribute('stroke-dasharray', `${pct}, 100`);
    }

    renderVaccines();

    // ── MODAL ────────────────────────────────────────────────
    const modal    = document.getElementById('addEntryModal');
    const openBtn  = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');

    openBtn.addEventListener('click',  () => { modal.classList.add('active'); switchTab('growth'); });
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

    // ── TABS ─────────────────────────────────────────────────
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    function switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(b  => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.entry-form').forEach(f => f.classList.toggle('active', f.id === tab + 'Form'));
    }

    // ── FORMS ────────────────────────────────────────────────
    document.getElementById('growthForm').addEventListener('submit', e => {
        e.preventDefault();
        const wt = parseFloat(document.getElementById('weight').value);
        const ht = parseFloat(document.getElementById('height').value);
        labels.push(`Mo ${labels.length + 1}`);
        weightData.push(wt); heightData.push(ht);
        refreshChart();
        updateStatCards();
        e.target.reset(); showToast('📈 Growth data saved!'); modal.classList.remove('active');
    });

    function updateStatCards() {
        if (!weightData.length) return;
        const currentWt = weightData[weightData.length - 1];
        const currentHt = heightData[heightData.length - 1];
        document.getElementById('weightValue').textContent = currentWt.toFixed(2) + ' kg';
        document.getElementById('heightValue').textContent = currentHt.toFixed(2) + ' ft';

        if (weightData.length > 1) {
            const diffW = (currentWt - weightData[weightData.length - 2]).toFixed(2);
            document.getElementById('weightTrend').innerHTML = diffW > 0 
                ? `<i class="fa-solid fa-arrow-trend-up"></i> +${diffW} kg since last entry` 
                : `<i class="fa-solid fa-arrow-trend-down"></i> ${diffW} kg since last entry`;
            document.getElementById('weightTrend').className = diffW >= 0 ? 'stat-subtext trend-up' : 'stat-subtext dev-below';
        }

        if (heightData.length > 1) {
            const diffH = (currentHt - heightData[heightData.length - 2]).toFixed(2);
            document.getElementById('heightTrend').innerHTML = diffH > 0 
                ? `<i class="fa-solid fa-arrow-trend-up"></i> +${diffH} ft since last entry` 
                : `<i class="fa-solid fa-arrow-trend-down"></i> ${diffH} ft since last entry`;
            document.getElementById('heightTrend').className = diffH >= 0 ? 'stat-subtext trend-up' : 'stat-subtext dev-below';
        }
    }

    const msPhotoInput = document.getElementById('milestonePhoto');
    const msPreview = document.getElementById('imagePreviewMilestone');
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

    document.getElementById('milestoneForm').addEventListener('submit', e => {
        e.preventDefault();
        const file = msPhotoInput ? msPhotoInput.files[0] : null;
        let imgUrl = null;
        if (file) imgUrl = URL.createObjectURL(file);

        prependTimeline({ icon: 'fa-solid fa-star', title: document.getElementById('milestoneTitle').value, desc: document.getElementById('milestoneDesc').value, date: formatDate(document.getElementById('milestoneDate').value), imgUrl });
        e.target.reset();
        if (msPreview && msPlaceholder) { msPreview.src = ''; msPreview.style.display = 'none'; msPlaceholder.style.display = 'flex'; }
        showToast('🏁 Milestone added!'); modal.classList.remove('active');
    });

    const healthIcons = { vaccine: 'fa-solid fa-syringe', medication: 'fa-solid fa-pills', vitamin: 'fa-solid fa-capsules', checkup: 'fa-solid fa-stethoscope' };

    document.getElementById('healthForm').addEventListener('submit', e => {
        e.preventDefault();
        const type = document.getElementById('healthType').value;
        prependTimeline({ icon: healthIcons[type] || 'fa-solid fa-heart-pulse', title: document.getElementById('healthDesc').value, desc: capitalize(type), date: formatDate(document.getElementById('healthDate').value) });
        e.target.reset(); showToast('💊 Health record saved!'); modal.classList.remove('active');
    });

    const memPhotoInput = document.getElementById('memoryPhoto');
    const memPreview = document.getElementById('imagePreviewMemory');
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

    document.getElementById('memoryForm').addEventListener('submit', e => {
        e.preventDefault();
        const caption = document.getElementById('memoryCaption').value;
        const date    = formatDate(document.getElementById('memoryDate').value);
        const file    = memPhotoInput.files[0];
        let fileUrl = '';
        if (file) fileUrl = URL.createObjectURL(file);
        
        addMemoryCard(fileUrl, caption, date);
        e.target.reset();
        memPreview.src = ''; memPreview.style.display = 'none'; memPlaceholder.style.display = 'flex';
        showToast('📸 Memory saved!'); modal.classList.remove('active');
    });

    // ── HELPERS ──────────────────────────────────────────────
    function prependTimeline({ icon, title, desc, date, imgUrl }) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.style.animation = 'fadeIn 0.4s ease';
        const imgHtml = imgUrl ? `<img src="${imgUrl}" alt="${title} photo" class="timeline-image">` : '';
        item.innerHTML = `<div class="timeline-icon"><i class="${icon}"></i></div>
            <div class="timeline-content"><h4>${title}</h4><p>${desc}</p>${imgHtml}<span class="date">${date}</span></div>`;
        document.querySelector('.timeline').insertBefore(item, document.querySelector('.timeline').firstChild);
    }

    function addMemoryCard(src, caption, date) {
        const grid = document.getElementById('memoryGrid');
        const empty = grid.querySelector('.empty-state');
        if (empty) empty.remove();
        const item = document.createElement('div');
        item.className = 'memory-item';
        item.style.animation = 'fadeIn 0.5s ease';
        if (src) {
            item.innerHTML = `<img src="${src}" alt="${caption}">
                <div class="memory-caption-overlay"><p>${caption}</p><span>${date}</span></div>`;
        } else {
            item.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--primary-light); color:var(--primary); font-size:2.5rem;"><i class="fa-solid fa-camera-retro"></i></div>
                <div class="memory-caption-overlay"><p>${caption}</p><span>${date}</span></div>`;
        }
        grid.insertBefore(item, grid.firstChild);
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
        requestAnimationFrame(() => { t.style.transform='translateX(-50%) translateY(0)'; t.style.opacity='1'; });
        setTimeout(() => { t.style.transform='translateX(-50%) translateY(60px)'; t.style.opacity='0'; }, 2600);
    }

    function formatDate(s) {
        if (!s) return 'Today';
        const d = new Date(s + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
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

    // Close sidebar when a nav link is tapped on mobile
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
});
