  // ── Web Audio Synth Engine (Sound Palette) ──
  const BASound = {
    ctx: null,
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    },
    playTap() {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.start(); osc.stop(this.ctx.currentTime + 0.08);
    },
    playHover() {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.start(); osc.stop(this.ctx.currentTime + 0.03);
    },
    playSuccess() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Dual chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.connect(gain1); gain1.connect(this.ctx.destination);
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.start(now); osc1.stop(now + 0.15);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.connect(gain2); gain2.connect(this.ctx.destination);
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.start(now + 0.08); osc2.stop(now + 0.25);
    },
    playWipe() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.45);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now); noise.stop(now + 0.45);
    },
    playGachaSpark() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.03, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
        osc.start(now + idx * 0.05); osc.stop(now + idx * 0.05 + 0.22);
      });
    },
    playScanHum() {
      this.init();
      if (!this.ctx) return null;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      osc.start();
      return { osc, gain };
    }
  };

  // Add click sound dynamically to existing links/buttons
  window.addEventListener('click', (e) => {
    const target = (e.target as any).closest('button, .dock-item, .lobby-stack-btn, .topbar-card, .arona-guide-badge, .ba-account-card');
    if (target) {
      BASound.playTap();
    }
  });
  window.addEventListener('mouseover', (e) => {
    const target = (e.target as any).closest('button, .dock-item, .lobby-stack-btn, .topbar-card, .arona-guide-badge, .ba-account-card');
    if (target) {
      BASound.playHover();
    }
  });

  // ── Database of Student Skill Cards ──
  const StudentDB = [
    { id: 'daniel', name: 'Daniel Guanes', stars: 3, role: 'Support', title: 'Sensei / Developer', desc: 'Outsourced DBA, support tech & Master in Organic 3D modeling.', img: 'https://unavatar.io/twitter/tsk_yk64' },
    { id: 'arona', name: 'Arona', stars: 3, role: 'Support', title: 'A.I. Assistant', desc: 'Resident helper OS inside the Shittim Chest. Friendly and loves strawberry milk.', img: 'img/arona_guide.jpg' },
    { id: 'hachiware', name: 'Hachiware', stars: 1, role: 'Attacker', title: 'Lobby Helper', desc: 'Cute companion mascot who gives 100% effort in every developer task!', img: 'img/SweetBabyHachiware2.webp' },
    { id: 'oracle', name: 'Oracle DB', stars: 2, role: 'Support', title: 'Database Admin', desc: 'High-availability DBA services, table scaling, backup management and SQL tuning.', img: 'img/icon_student.png' },
    { id: 'postgres', name: 'PostgreSQL', stars: 3, role: 'Tank', title: 'DB Administrator', desc: 'Enterprise Postgres configurations, transaction logging, and query tuning.', img: 'img/icon_student.png' },
    { id: 'blender', name: 'Blender 3D', stars: 3, role: 'Attacker', title: '3D Modeler', desc: 'High-poly sculpting, UV mapping, character designs, and realistic environment builds.', img: 'img/icon_student.png' },
    { id: 'zbrush', name: 'ZBrush', stars: 3, role: 'Attacker', title: '3D Sculptor', desc: 'Organic concept modeling, detailing, brushes expertise, and dynamic poses.', img: 'img/icon_student.png' },
    { id: 'infobip', name: 'Customer Support', stars: 3, role: 'Support', title: 'SaaS Technician', desc: 'Resolving global messaging gateways, APIs, and client tickets at Infobip.', img: 'img/icon_student.png' },
    { id: 'bcp', name: 'Central Bank', stars: 3, role: 'Support', title: 'Junior IT Tech', desc: 'DBA operations, data protection, and Sybase optimization for Central Bank of Paraguay.', img: 'img/icon_student.png' },
    { id: 'unreal', name: 'Unreal Engine 5', stars: 2, role: 'Attacker', title: 'Game Designer', desc: 'Integrating high-fidelity textures, blueprint system logics, and ray-traced lighting.', img: 'img/icon_student.png' },
    { id: 'mssql', name: 'MS SQL Server', stars: 1, role: 'Support', title: 'Database Tech', desc: 'SQL administration, system health monitoring, backups, and script audits.', img: 'img/icon_student.png' },
    { id: 'telecom', name: 'SaaS Telecom', stars: 3, role: 'Support', title: 'Telephony Tech', desc: 'Omnichannel communication networks, cloud telephone lines, and SMS gateways.', img: 'img/icon_student.png' },
    { id: 'cybersec', name: 'Cybersecurity', stars: 3, role: 'Tank', title: 'ISC2 Candidate', desc: 'Trained in security governance, incident response, network logs, and encryption protocols.', img: 'img/icon_student.png' }
  ];

  // ── Game States & Persistent storage ──
  const GameState = {
    pyroxenes: 24000,
    keystones: 5,
    tickets: 3,
    unlocked: ['daniel', 'arona', 'hachiware'],
    levels: { daniel: 1, arona: 1, hachiware: 1 },
    ranks: { daniel: 1, arona: 1, hachiware: 1 },
    exp: { daniel: 0, arona: 0, hachiware: 0 },
    showcase: [],
    momotalk: {},
    momotalkCurrentNode: {},
    
    load() {
      const saved = localStorage.getItem('shittim_game_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.assign(this, parsed);
        } catch(e) { console.error("Error parsing game state", e); }
      }
      this.updateHUD();
    },
    save() {
      localStorage.setItem('shittim_game_state', JSON.stringify({
        pyroxenes: this.pyroxenes,
        keystones: this.keystones,
        tickets: this.tickets,
        unlocked: this.unlocked,
        levels: this.levels,
        ranks: this.ranks,
        exp: this.exp,
        showcase: this.showcase,
        momotalk: this.momotalk,
        momotalkCurrentNode: this.momotalkCurrentNode
      }));
      this.updateHUD();
    },
    updateHUD() {
      // Update pyroxenes
      document.querySelectorAll('[title="Pyroxenes"] .pill-val').forEach(el => {
        el.textContent = this.pyroxenes.toLocaleString();
      });
      // Update keystones
      const keysVal = (document.getElementById('keystone-count-val') as any);
      if (keysVal) keysVal.textContent = this.keystones;
      // Update tickets
      const tickVal = (document.getElementById('schedule-tickets-val') as any);
      if (tickVal) tickVal.textContent = `${this.tickets}/3`;
    }
  };

  // Replenish Pyroxenes
  function replenishPyroxenes() {
    GameState.pyroxenes += 1200;
    GameState.save();
    BASound.playSuccess();
    // Quote bubble chimes
    const textEl = ((document.getElementById('lobby-quote-text') || {}) as any);
    if (textEl) {
      textEl.textContent = "Thank you, Sensei! You successfully replenished Pyroxenes! 💎";
    }
  }

  // ── Digital Boot Screen Sequence ──
  function runBootSequence() {
    const box = (document.getElementById('boot-log-box') as any);
    const progress = (document.getElementById('boot-progress') as any);
    const percent = (document.getElementById('boot-percent') as any);
    const scanner = (document.getElementById('boot-scanner-area') as any);
    
    if (!box) return;

    const logs = [
      { text: "[SYSTEM: SHITTIM CHEST OS v3.2]", delay: 0 },
      { text: "[STATUS: LOADING BOOT LOADER...]", delay: 300 },
      { text: "[SYSTEM: INTEGRITY CHECK INITIATED]", delay: 650 },
      { text: "CHECKING DATABASE CONNECTION... OK", delay: 900, type: 'cyan' },
      { text: "LOADING ARONA LOGICS INTERFACE... OK", delay: 1100, type: 'cyan' },
      { text: "LOADING PLANA FALLBACK KERNEL... OK", delay: 1300, type: 'cyan' },
      { text: "CHECKING SENSEI CREDENTIALS... KEY DETECTED", delay: 1600, type: 'pink' },
      { text: "[SYSTEM READY: AWAITING AUTHORIZATION]", delay: 1900, type: 'success' }
    ];

    logs.forEach(l => {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = `boot-log-line ${l.type || ''}`;
        p.textContent = l.text;
        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
      }, l.delay);
    });

    // Animate progress bar
    let cur = 0;
    const interval = setInterval(() => {
      cur += Math.floor(Math.random() * 8) + 2;
      if (cur >= 100) {
        cur = 100;
        clearInterval(interval);
        scanner.classList.add('visible');
      }
      progress.style.width = `${cur}%`;
      percent.textContent = `${cur}%`;
    }, 120);
  }

  // Fingerprint Scanner
  const scanBtn = (document.getElementById('boot-scanner-btn') as any);
  if (scanBtn) {
    scanBtn.addEventListener('mousedown', startScanning);
    scanBtn.addEventListener('touchstart', startScanning);
  }

  let scanAudio = null;
  function startScanning(e) {
    e.preventDefault();
    scanBtn.classList.add('scanning');
    scanAudio = BASound.playScanHum();
    
    setTimeout(() => {
      if (scanBtn.classList.contains('scanning')) {
        stopScanning();
        BASound.playSuccess();
        triggerWipeTransition();
        setTimeout(() => {
          (document.getElementById('boot-screen') as any).classList.add('fade-out');
        }, 300);
      }
    }, 1500);
  }

  function stopScanning() {
    scanBtn.classList.remove('scanning');
    if (scanAudio) {
      scanAudio.osc.stop();
      scanAudio = null;
    }
  }
  window.addEventListener('mouseup', stopScanning);
  window.addEventListener('touchend', stopScanning);

  function triggerWipeTransition() {
    const wipe = (document.getElementById('ba-wipe') as any);
    if (wipe) {
      BASound.playWipe();
      wipe.classList.add('active');
      setTimeout(() => { wipe.classList.remove('active'); }, 1200);
    }
  }

  // ── Blue Archive Modal Controls (Upgraded) ──
  function openBAModal(modalId) {
    const wipe = (document.getElementById('ba-wipe') as any);
    if (wipe) {
      BASound.playWipe();
      wipe.classList.add('active');
      setTimeout(() => {
        const overlay = (document.getElementById('modal-overlay') as any);
        const modal = (document.getElementById(`modal-${modalId}`) as any);
        if (overlay) overlay.classList.add('active');
        if (modal) modal.classList.add('active');
        
        // Modal-specific triggers
        if (modalId === 'cafe') renderCafe();
        if (modalId === 'schedule') renderSchedule();
        if (modalId === 'students') renderRoster();
        if (modalId === 'recruit') renderRecruitBanner();
        if (modalId === 'crafting') renderCraftingRoom();
        if (modalId === 'messages') renderMomoTalk();
      }, 250);
      setTimeout(() => { wipe.classList.remove('active'); }, 650);
    } else {
      const overlay = (document.getElementById('modal-overlay') as any);
      const modal = (document.getElementById(`modal-${modalId}`) as any);
      if (overlay) overlay.classList.add('active');
      if (modal) modal.classList.add('active');
    }
  }

  function closeAllBAModals() {
    const overlay = (document.getElementById('modal-overlay') as any);
    if (overlay) overlay.classList.remove('active');
    document.querySelectorAll('.ba-modal').forEach(modal => {
      modal.classList.remove('active');
    });
    // Stop gacha signature canvas drawing
    gachaDrawing = false;
  }

  // ── Cafe Lounge Logic ──
  const cafeQuotes = {
    daniel: ["Database configurations are secure, Sensei!", "How do you like the Blender layout?", "Ready to compile the next masterwork! 💻"],
    arona: ["Welcome to the cafe! Need some strawberry milk? 🍓🥛", "Arona is tracking your schedule perfectly, Sensei!", "Tapping students raises their confidence! 🌸"],
    hachiware: ["Let's do our best today! 🐻", "Yum, this bread is delicious!", "Chikawa and Usagi say hello!"],
    postgres: ["SQL queries optimized. Read replication is live!", "Index structures verified, Sensei.", "DB cluster operating at peak specs."],
    blender: ["Polygons subdividing cleanly!", "Textures baked out successfully.", " dynamic skeletal rigs integrated."],
    zbrush: ["Anatomy details sculpted!", "Creature design looks stunning, Sensei.", "Ready for exporting high-poly meshes."]
  };

  function renderCafe() {
    const room = (document.getElementById('cafe-room') as any);
    if (!room) return;
    
    // Clear old chibis
    room.querySelectorAll('.cafe-chibi').forEach(el => el.remove());
    
    // Spawn unlocked chibis
    let count = 0;
    StudentDB.forEach(s => {
      if (GameState.unlocked.includes(s.id) && count < 4) {
        spawnChibi(s);
        count++;
      }
    });
  }

  function spawnChibi(student) {
    const room = (document.getElementById('cafe-room') as any);
    const c = document.createElement('div');
    c.className = 'cafe-chibi';
    c.id = `chibi-${student.id}`;
    
    // Random placement
    const l = Math.floor(Math.random() * 60) + 20;
    const t = Math.floor(Math.random() * 45) + 35;
    c.style.left = `${l}%`;
    c.style.top = `${t}%`;
    
    c.innerHTML = `
      <div class="chibi-avatar-frame" onclick="tapChibi('${student.id}')">
        <div class="chibi-halo"></div>
        <img src="${student.img}" onerror="this.src='img/icon_student.png'" alt="${student.name}"/>
        <div class="chibi-bubble" id="bubble-${student.id}">Hello!</div>
      </div>
    `;
    room.appendChild(c);
  }

  function tapChibi(studentId) {
    // Generate heart animation
    const room = (document.getElementById('cafe-room') as any);
    const chibi = (document.getElementById(`chibi-${studentId}`) as any);
    if (!chibi) return;
    
    const heart = document.createElement('div');
    heart.className = 'chibi-heart';
    heart.textContent = '❤️';
    heart.style.left = chibi.style.left;
    heart.style.top = chibi.style.top;
    room.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
    
    BASound.playSuccess();
    
    // Increase relationship
    if (!GameState.exp[studentId]) GameState.exp[studentId] = 0;
    if (!GameState.ranks[studentId]) GameState.ranks[studentId] = 1;
    
    GameState.exp[studentId] += 10;
    if (GameState.exp[studentId] >= GameState.ranks[studentId] * 30) {
      GameState.exp[studentId] = 0;
      GameState.ranks[studentId]++;
      // Trigger rank up quote
      (document.getElementById(`bubble-${studentId}`) as any).textContent = `RANK UP! Rank ${GameState.ranks[studentId]}!`;
    } else {
      const q = cafeQuotes[studentId] || ["Sensei, thanks for visiting!", "Let's do our best!"];
      const randQ = q[Math.floor(Math.random() * q.length)];
      (document.getElementById(`bubble-${studentId}`) as any).textContent = randQ;
    }
    
    GameState.save();
    
    // Show speech bubble
    chibi.classList.add('active');
    setTimeout(() => chibi.classList.remove('active'), 2500);
  }

  function inviteStudentToCafe() {
    // invite a random unlocked student
    const lockedUnlocked = StudentDB.filter(s => GameState.unlocked.includes(s.id));
    if (lockedUnlocked.length === 0) return;
    const randS = lockedUnlocked[Math.floor(Math.random() * lockedUnlocked.length)];
    
    const chibi = (document.getElementById(`chibi-${randS.id}`) as any);
    if (chibi) {
      // Move existing chibi
      const l = Math.floor(Math.random() * 60) + 20;
      const t = Math.floor(Math.random() * 45) + 35;
      chibi.style.left = `${l}%`;
      chibi.style.top = `${t}%`;
      tapChibi(randS.id);
    } else {
      spawnChibi(randS);
      tapChibi(randS.id);
    }
  }

  // ── Schedule City Map Logic ──
  const scheduleEvents = [
    { title: "Trinity General School", speaker: "Trinity Dean", text: "You visited Trinity General School. Reviewing academic achievements: Checked Daniel's master's credentials in Organic 3D Modeling. Arona: 'Amazing! Look at those high-poly ZBrush detailing!'" },
    { title: "Millennium Science School", speaker: "Millennium Student", text: "You visited Millennium Science School. Inspecting Computer Engineering syllabus: Reviewed Universidad Nihon Gakko degrees. Arona: 'Calculations are flawless, Sensei!'" },
    { title: "Gehenna Academy", speaker: "Gehenna Prefect", text: "You visited Gehenna Academy. Auditing system databases: Checked banking logs & Sybase setups for Paraguay Central Bank. Arona: 'No bottlenecks found! System operating efficiently!'" },
    { title: "Abydos High School", speaker: "Abydos President", text: "You visited Abydos High School. Reviewing procurement logs: Checked administrative and invoicing history. Arona: 'Ledger records are perfectly balanced!'" },
    { title: "SCHALE Office", speaker: "Plana", text: "You visited SCHALE Headquarters. Auditing technical support operations: Checked Infobip telecom queues. Plana: '100% resolution rates, Sensei!'" }
  ];

  function renderSchedule() {
    const map = (document.getElementById('schedule-map') as any);
    if (!map) return;
    
    // Clear old pins
    map.querySelectorAll('.schedule-pin').forEach(el => el.remove());
    
    // Position coordinates for pins on map
    const pins = [
      { id: 0, label: "Trinity General (3D Master)", left: "20%", top: "35%" },
      { id: 1, label: "Millennium (Comp Eng)", left: "55%", top: "25%" },
      { id: 2, label: "Gehenna (DB DBA)", left: "80%", top: "40%" },
      { id: 3, label: "Abydos (Accounts)", left: "30%", top: "75%" },
      { id: 4, label: "SCHALE (SaaS Support)", left: "65%", top: "70%" }
    ];

    pins.forEach(p => {
      const pin = document.createElement('div');
      pin.className = 'schedule-pin';
      pin.style.left = p.left;
      pin.style.top = p.top;
      pin.onclick = () => triggerScheduleEvent(p.id);
      
      pin.innerHTML = `
        <div class="pin-ring"></div>
        <span class="pin-label">${p.label}</span>
      `;
      map.appendChild(pin);
    });
  }

  function triggerScheduleEvent(pinId) {
    if (GameState.tickets <= 0) {
      alert("No Schedule Tickets left! Perform daily tasks to get more.");
      return;
    }
    
    GameState.tickets--;
    // Earn Pyroxenes & Keystones
    GameState.pyroxenes += 120;
    if (Math.random() > 0.5) GameState.keystones += 1;
    GameState.save();
    
    const ev = scheduleEvents[pinId];
    (document.getElementById('dialog-speaker') as any).textContent = ev.speaker;
    (document.getElementById('dialog-text') as any).textContent = ev.text;
    
    BASound.playSuccess();
    (document.getElementById('schedule-event-overlay') as any).classList.add('active');
  }

  function closeScheduleEvent() {
    (document.getElementById('schedule-event-overlay') as any).classList.remove('active');
    renderSchedule();
  }

  // ── Student Roster (生徒) Logic ──
  function renderRoster() {
    const grid = (document.getElementById('roster-grid') as any);
    if (!grid) return;
    grid.innerHTML = '';
    
    const query = (document.getElementById('roster-search') as any).value.toLowerCase();
    
    StudentDB.forEach(s => {
      if (query && !s.name.toLowerCase().includes(query) && !s.title.toLowerCase().includes(query)) return;
      
      const isUnlocked = GameState.unlocked.includes(s.id);
      const lvl = GameState.levels[s.id] || 1;
      const rank = GameState.ranks[s.id] || 1;
      
      const item = document.createElement('div');
      item.className = `roster-item ${isUnlocked ? '' : 'locked'}`;
      item.onclick = () => isUnlocked ? showStudentDetails(s) : alert("Unlock this student's skill via Gacha Recruitment!");
      
      let starsHTML = '';
      for (let i = 0; i < s.stars; i++) starsHTML += '<span class="card-star">★</span>';
      
      item.innerHTML = `
        <div class="roster-locked-icon">🔒</div>
        <div class="roster-avatar">
          <img src="${s.img}" onerror="this.src='img/icon_student.png'" alt="${s.name}"/>
        </div>
        <div class="roster-name">${s.name}</div>
        <div style="font-size:0.6rem;color:var(--muted);margin-bottom:2px;">${isUnlocked ? 'Lv.' + lvl + ' | Rank ' + rank : 'Locked'}</div>
        <div class="roster-stars">${starsHTML}</div>
      `;
      grid.appendChild(item);
    });
  }

  function filterRoster() {
    renderRoster();
  }

  function showStudentDetails(student) {
    const lvl = GameState.levels[student.id] || 1;
    const rank = GameState.ranks[student.id] || 1;
    
    let starsHTML = '';
    for (let i = 0; i < student.stars; i++) starsHTML += '<span class="card-star">★</span>';
    
    // Inject details into gacha display temporarily to showcase
    const overlay = (document.getElementById('gacha-reveal-overlay') as any);
    (document.getElementById('revealed-card-stars') as any).innerHTML = starsHTML;
    (document.getElementById('revealed-card-img') as any).src = student.img;
    (document.getElementById('revealed-card-role') as any).textContent = student.role;
    (document.getElementById('revealed-card-name') as any).textContent = student.name;
    (document.getElementById('revealed-card-title') as any).textContent = `${student.title} (Level ${lvl} | Rank ${rank})`;
    (document.getElementById('revealed-card-desc') as any).innerHTML = `
      ${student.desc}<br/><br/>
      <button onclick="levelUpStudent('${student.id}', event)" style="background:var(--ba-pink);border:none;border-radius:4px;padding:6px 16px;color:#fff;font-weight:bold;cursor:pointer;">LEVEL UP (Lv.${lvl})</button>
    `;
    
    overlay.classList.add('active');
  }

  function levelUpStudent(studentId, event) {
    if (event) event.stopPropagation();
    
    if (!GameState.levels[studentId]) GameState.levels[studentId] = 1;
    GameState.levels[studentId] += 1;
    GameState.save();
    
    BASound.playSuccess();
    
    const s = StudentDB.find(st => st.id === studentId);
    showStudentDetails(s);
    renderRoster();
  }

  // ── Gacha Recruitment Logic ──
  let recruitmentPool = [];
  let revealIndex = 0;
  let currentPullSize = 1;

  function renderRecruitBanner() {
    (document.getElementById('gacha-home') as any).style.display = 'block';
    (document.getElementById('gacha-sign') as any).style.display = 'none';
    (document.getElementById('gacha-reveal') as any).style.display = 'none';
  }

  function startGacha(pullSize) {
    currentPullSize = pullSize;
    const cost = pullSize * 120;
    
    if (GameState.pyroxenes < cost) {
      alert("Insufficient Pyroxenes! Click the '+' button next to the Pyroxenes display in the topbar to replenish.");
      return;
    }
    
    GameState.pyroxenes -= cost;
    GameState.save();
    
    // Open signing pad
    (document.getElementById('gacha-home') as any).style.display = 'none';
    (document.getElementById('gacha-sign') as any).style.display = 'block';
    clearGachaCanvas();
  }

  // Gacha Signature Canvas
  const gachaCanvas = (document.getElementById('gacha-canvas') as any);
  const gachaCtx = gachaCanvas ? gachaCanvas.getContext('2d') : null;
  let gachaDrawing = false;
  let gachaTool = 'pen';
  let gachaLastX = 0, gachaLastY = 0;

  function setGachaTool(t) {
    gachaTool = t;
    document.querySelectorAll('.gacha-tool').forEach(b => b.classList.remove('active'));
    (document.getElementById(`tool-${t}-gacha`) as any).classList.add('active');
  }

  function clearGachaCanvas() {
    if (gachaCtx) gachaCtx.clearRect(0, 0, gachaCanvas.width, gachaCanvas.height);
  }

  function getGachaPos(e) {
    const rect = gachaCanvas.getBoundingClientRect();
    const scaleX = gachaCanvas.width  / rect.width;
    const scaleY = gachaCanvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
  }

  if (gachaCanvas) {
    gachaCanvas.addEventListener('pointerdown', e => {
      gachaDrawing = true;
      [gachaLastX, gachaLastY] = getGachaPos(e);
    });
    gachaCanvas.addEventListener('pointermove', e => {
      if (!gachaDrawing) return;
      const [x, y] = getGachaPos(e);
      gachaCtx.globalCompositeOperation = gachaTool === 'eraser' ? 'destination-out' : 'source-over';
      gachaCtx.strokeStyle = (document.getElementById('draw-color-gacha') as any).value;
      gachaCtx.lineWidth   = (document.getElementById('draw-size-gacha') as any).value;
      gachaCtx.lineCap     = 'round';
      gachaCtx.lineJoin    = 'round';
      gachaCtx.beginPath();
      gachaCtx.moveTo(gachaLastX, gachaLastY);
      gachaCtx.lineTo(x, y);
      gachaCtx.stroke();
      [gachaLastX, gachaLastY] = [x, y];
    });
    gachaCanvas.addEventListener('pointerup',   () => gachaDrawing = false);
    gachaCanvas.addEventListener('pointerout',  () => gachaDrawing = false);
  }

  async function confirmSignature() {
    // 1. Submit drawing signature to Cloudflare api backend (Original portfolio D1 database feature!)
    try {
      const dataUrl = gachaCanvas.toDataURL('image/png');
      fetch('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: dataUrl, message: `Sensei Recruited Student Card Pool ${currentPullSize}x` })
      });
    } catch(e) { console.warn("Failed sending signature to backend database", e); }
    
    // 2. Roll gacha cards
    recruitmentPool = [];
    for (let i = 0; i < currentPullSize; i++) {
      // Calculate rarity: 3-Star = 20%, 2-Star = 45%, 1-Star = 35%
      const rand = Math.random();
      let selectedRarity = 1;
      if (rand < 0.20) selectedRarity = 3;
      else if (rand < 0.65) selectedRarity = 2;
      
      const matchStudents = StudentDB.filter(s => s.stars === selectedRarity);
      const student = matchStudents[Math.floor(Math.random() * matchStudents.length)];
      recruitmentPool.push(student);
    }
    
    // Display reveal envelopes desk
    (document.getElementById('gacha-sign') as any).style.display = 'none';
    (document.getElementById('gacha-reveal') as any).style.display = 'block';
    
    const desk = (document.getElementById('gacha-reveal-desk') as any);
    desk.innerHTML = '';
    
    recruitmentPool.forEach((s, idx) => {
      const env = document.createElement('div');
      env.className = `gacha-envelope rarity-${s.stars}`;
      env.id = `env-${idx}`;
      env.onclick = () => revealCard(idx);
      desk.appendChild(env);
    });
    
    (document.getElementById('gacha-finish-btn') as any).style.display = 'none';
  }

  function revealCard(idx) {
    revealIndex = idx;
    const student = recruitmentPool[idx];
    const env = (document.getElementById(`env-${idx}`) as any);
    if (env.classList.contains('opened')) return;
    
    env.classList.add('opened');
    BASound.playGachaSpark();
    
    setTimeout(() => {
      // Show card splash popup
      let starsHTML = '';
      for (let i = 0; i < student.stars; i++) starsHTML += '<span class="card-star">★</span>';
      
      (document.getElementById('revealed-card-stars') as any).innerHTML = starsHTML;
      (document.getElementById('revealed-card-img') as any).src = student.img;
      (document.getElementById('revealed-card-role') as any).textContent = student.role;
      (document.getElementById('revealed-card-name') as any).textContent = student.name;
      (document.getElementById('revealed-card-title') as any).textContent = student.title;
      (document.getElementById('revealed-card-desc') as any).textContent = student.desc;
      
      // Unlock student
      if (!GameState.unlocked.includes(student.id)) {
        GameState.unlocked.push(student.id);
        GameState.levels[student.id] = 1;
        GameState.ranks[student.id] = 1;
        GameState.exp[student.id] = 0;
        GameState.save();
      }
      
      (document.getElementById('gacha-reveal-overlay') as any).classList.add('active');
    }, 400);
  }

  function confirmCardReveal() {
    (document.getElementById('gacha-reveal-overlay') as any).classList.remove('active');
    
    // Check if all cards opened
    const desk = (document.getElementById('gacha-reveal-desk') as any);
    const totalEnvs = recruitmentPool.length;
    const openedEnvs = desk.querySelectorAll('.gacha-envelope.opened').length;
    
    if (openedEnvs >= totalEnvs) {
      (document.getElementById('gacha-finish-btn') as any).style.display = 'block';
    }
  }

  function finishRecruitment() {
    renderRecruitBanner();
  }

  // ── Manufacturing (Crafting Room) Logic ──
  const craftables = [
    { name: "3D Maya Certification", icon: "🎬", desc: "Digital modeling authentication verifying advanced workflow capacities." },
    { name: "PostgreSQL DBA Script", icon: "🐘", desc: "High-performance cluster script detailing query routing rules." },
    { name: "Infobip SaaS Gateway", icon: "📡", desc: "Cloud telephony setup routing WhatsApp and SMS queues." },
    { name: "Blender Character Concept", icon: "🗿", desc: "Dynamic topology mesh details ready for exporting and sculpting." },
    { name: "Paraguay Central Bank DBA Cert", icon: "🏦", desc: "SQL administration credentials verifying secure data protocols." },
    { name: "Unreal Level Blueprint", icon: "🎮", desc: "System scripting governing triggers, render scales, and lighting." }
  ];

  function renderCraftingRoom() {
    const list = (document.getElementById('showcase-grid') as any);
    if (!list) return;
    list.innerHTML = '';
    
    if (GameState.showcase.length === 0) {
      list.innerHTML = '<div class="col-12 empty text-center" style="font-size:0.8rem;color:var(--muted)">😴 Showcase empty. Craft items!</div>';
      return;
    }
    
    GameState.showcase.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4';
      col.innerHTML = `
        <div class="sk" style="padding: 10px 6px; font-size: 0.72rem;">
          <span class="si" style="font-size: 20px;">${item.icon}</span>
          ${item.name}
        </div>
      `;
      list.appendChild(col);
    });
  }

  function startCrafting() {
    if (GameState.keystones <= 0) {
      alert("Insufficient Keystones! Earn them by exploring schedule campuses.");
      return;
    }
    
    GameState.keystones--;
    GameState.save();
    
    const triggerBtn = (document.getElementById('craft-trigger-btn') as any);
    triggerBtn.disabled = true;
    
    const statusLbl = (document.getElementById('craft-status-lbl') as any);
    statusLbl.textContent = "Manufacturing... 🛠️";
    
    BASound.playWipe();
    
    setTimeout(() => {
      // Craft complete!
      const randItem = craftables[Math.floor(Math.random() * craftables.length)];
      
      // Save to inventory
      if (!GameState.showcase.some(it => it.name === randItem.name)) {
        GameState.showcase.push(randItem);
        GameState.save();
      }
      
      // Popup showcase
      (document.getElementById('crafted-icon') as any).textContent = randItem.icon;
      (document.getElementById('crafted-name') as any).textContent = randItem.name;
      (document.getElementById('crafted-desc') as any).textContent = randItem.desc;
      (document.getElementById('crafted-popup') as any).classList.add('active');
      
      BASound.playSuccess();
      
      statusLbl.textContent = "Chamber Standby";
      triggerBtn.disabled = false;
      renderCraftingRoom();
    }, 2200);
  }

  function closeCraftedPopup() {
    (document.getElementById('crafted-popup') as any).classList.remove('active');
  }

  // ── Upgraded MomoTalk Chat Logic ──
  const chatNarratives = {
    daniel: {
      start: 'node_welcome',
      nodes: {
        node_welcome: {
          text: "Hola Sensei! How is your day going? Ready to review my professional stats? ⚡",
          choices: [
            { text: "Tell me about your database experience!", next: 'node_db' },
            { text: "What projects have you modeled in 3D?", next: 'node_3d' }
          ]
        },
        node_db: {
          text: "Of course! I have over 5 years of SQL experience, supporting platforms like Oracle, PostgreSQL, and Sybase. I supported the Central Bank of Paraguay (BCP) database systems as a DBA technician! 🏦",
          choices: [
            { text: "Impressive! What about SaaS?", next: 'node_saas' }
          ]
        },
        node_3d: {
          text: "I hold a Master's degree in Organic 3D Modeling. I love sculpting in ZBrush, UV mapping, rigging, and assembling scenes in Blender, Maya, and Unreal Engine 5! 🎨",
          choices: [
            { text: "Awesome! Where do you work now?", next: 'node_infobip' }
          ]
        },
        node_saas: {
          text: "Currently I support SaaS telecom messaging platforms at Infobip, helping global enterprises configure WhatsApp/SMS gateways, APIs, and debugging complex network routes! 📡",
          choices: [
            { text: "Thank you for the overview!", next: 'node_end' }
          ]
        },
        node_infobip: {
          text: "I worked as a customer support engineer at Infobip for 1 year and 10 months, tackling technical SaaS routing cases daily. I'm always looking to apply this combination of support and engineering!",
          choices: [
            { text: "Understood! Let's do our best!", next: 'node_end' }
          ]
        },
        node_end: {
          text: "Thanks, Sensei! Let's continue working hard at SCHALE! 🌸",
          end: true
        }
      }
    },
    arona: {
      start: 'node_welcome',
      nodes: {
        node_welcome: {
          text: "Sensei! Did you complete your schedules today? I tracked the database integrations perfectly! 📊",
          choices: [
            { text: "Yes, schedules are all set!", next: 'node_schedule_ok' },
            { text: "Need some strawberry milk?", next: 'node_milk' }
          ]
        },
        node_schedule_ok: {
          text: "Yay! Let's keep it up! Check the manufacturing monitor next for some resume certificates! 💎",
          end: true
        },
        node_milk: {
          text: "Strawberry milk?! Wow, thank you Sensei! You are the best! 🍓🥛",
          end: true
        }
      }
    },
    hachiware: {
      start: 'node_welcome',
      nodes: {
        node_welcome: {
          text: "Sensei! I'm doing my absolute best to help you draw contracts! Let's draw together! 🎨",
          choices: [
            { text: "Let's draw on the recruitment contractor sheet!", next: 'node_gacha' },
            { text: "You are doing great, Hachiware!", next: 'node_praise' }
          ]
        },
        node_gacha: {
          text: "Yes! Signing the contracts recruits new skills for SCHALE! Let's go! ✏️",
          end: true
        },
        node_praise: {
          text: "Hehe, thank you Sensei! I will keep working hard! 🐻",
          end: true
        }
      }
    }
  };

  let activeChatId = 'daniel';

  function renderMomoTalk() {
    const list = (document.getElementById('momotalk-chats-tabs') as any);
    if (!list) return;
    list.innerHTML = '';
    
    const chats = [
      { id: 'daniel', name: 'Daniel Guanes', img: 'https://unavatar.io/twitter/tsk_yk64' },
      { id: 'arona', name: 'Arona', img: 'img/arona_guide.jpg' },
      { id: 'hachiware', name: 'Hachiware', img: 'img/SweetBabyHachiware2.webp' }
    ];
    
    chats.forEach(ch => {
      const tab = document.createElement('div');
      tab.className = `momotalk-chat-tab ${ch.id === activeChatId ? 'active' : ''}`;
      tab.onclick = () => selectMomoTalkChat(ch.id);
      
      tab.innerHTML = `
        <div class="momotalk-chat-avatar">
          <img src="${ch.img}" onerror="this.src='img/icon_student.png'" alt="${ch.name}"/>
        </div>
        <span class="momotalk-chat-name">${ch.name}</span>
      `;
      list.appendChild(tab);
    });
    
    loadChatMessageFlow();
  }

  function selectMomoTalkChat(chatId) {
    activeChatId = chatId;
    renderMomoTalk();
  }

  function loadChatMessageFlow() {
    const history = (document.getElementById('momotalk-chat-history') as any);
    const choicesPanel = (document.getElementById('momotalk-choices-container') as any);
    if (!history || !choicesPanel) return;
    
    history.innerHTML = '';
    choicesPanel.innerHTML = '';
    
    // Ensure chat state exists
    if (!GameState.momotalk[activeChatId]) {
      GameState.momotalk[activeChatId] = [];
    }
    if (!GameState.momotalkCurrentNode[activeChatId]) {
      GameState.momotalkCurrentNode[activeChatId] = chatNarratives[activeChatId].start;
    }
    
    const chatList = GameState.momotalk[activeChatId];
    const currNodeId = GameState.momotalkCurrentNode[activeChatId];
    const flow = chatNarratives[activeChatId];
    const char = StudentDB.find(st => st.id === activeChatId);
    
    // If history is empty, push initial greeting message
    if (chatList.length === 0 && currNodeId) {
      const node = flow.nodes[currNodeId];
      if (node) {
        chatList.push({ sender: 'student', text: node.text });
        GameState.save();
      }
    }
    
    // Render all message history bubbles
    chatList.forEach(msg => {
      const bubble = document.createElement('div');
      if (msg.sender === 'student') {
        bubble.className = "chat-bubble-container incoming-chat";
        bubble.innerHTML = `
          <div class="chat-avatar">
            <img src="${char.img}" onerror="this.src='img/icon_student.png'" alt="${char.name}">
          </div>
          <div class="chat-details">
            <span class="chat-sender">${char.name}</span>
            <div class="chat-bubble">${msg.text}</div>
          </div>
        `;
      } else {
        bubble.className = "chat-bubble-container outgoing-chat mt-3 d-flex justify-content-end";
        bubble.innerHTML = `<div class="chat-bubble outgoing">${msg.text}</div>`;
      }
      history.appendChild(bubble);
    });
    
    history.scrollTop = history.scrollHeight;
    
    // Render choices for current node if it's active
    if (currNodeId) {
      const node = flow.nodes[currNodeId];
      if (node && node.choices) {
        node.choices.forEach(ch => {
          const btn = document.createElement('button');
          btn.className = "momotalk-choice-btn";
          btn.textContent = ch.text;
          btn.onclick = () => chooseMomoTalkOption(ch.next, ch.text);
          choicesPanel.appendChild(btn);
        });
      } else if (node && node.end) {
        // Conversation finished, mark state finished
        GameState.momotalkCurrentNode[activeChatId] = null;
        // Award Pyroxenes if not already awarded
        GameState.pyroxenes += 120;
        GameState.save();
        
        const bubble = document.createElement('div');
        bubble.className = "chat-bubble-container incoming-chat";
        bubble.innerHTML = `
          <div class="chat-details" style="margin-left: 44px;">
            <div class="chat-bubble" style="background:rgba(0,163,255,0.08); border-color:rgba(0,163,255,0.2); font-size:0.75rem; color:var(--ba-blue);">
              ✨ Relationship Story Complete! Earned 💎 120 Pyroxenes!
            </div>
          </div>
        `;
        history.appendChild(bubble);
        history.scrollTop = history.scrollHeight;
      }
    }
  }

  function chooseMomoTalkOption(nextNodeId, choiceText) {
    BASound.playTap();
    
    const chatList = GameState.momotalk[activeChatId];
    const flow = chatNarratives[activeChatId];
    
    // Push user selection message
    chatList.push({ sender: 'user', text: choiceText });
    
    // Advance node state
    GameState.momotalkCurrentNode[activeChatId] = nextNodeId;
    
    // Push next node message
    const nextNode = flow.nodes[nextNodeId];
    if (nextNode) {
      chatList.push({ sender: 'student', text: nextNode.text });
    }
    
    GameState.save();
    
    // Render changes
    loadChatMessageFlow();
  }

  // ── Character Database ──
  const characters = [
    { name: 'Daniel Guanes', type: 'twitter', src: 'https://unavatar.io/twitter/tsk_yk64' },
    { name: 'Arona', type: 'local', src: 'img/arona_guide.jpg' },
    { name: 'Hachiware', type: 'local', src: 'img/SweetBabyHachiware2.webp' }
  ];
  let currentCharIndex = 1;

  function loadLobbyCharacter() {
    const char = characters[currentCharIndex];
    const img = ((document.getElementById('avatar-img') || {}) as any);
    if (!img) return;

    img.style.display = 'block';
    if (char.type === 'twitter') {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      img.src = `${char.src}?v=${today}`;
    } else {
      img.src = char.src;
    }
    
    // Toggle full-screen Live2D mode when Arona (index 1) is active
    document.body.classList.toggle('arona-active', currentCharIndex === 1);
  }

  function swapLobbyCharacter(event) {
    if (event) event.stopPropagation(); // prevent triggering quote change
    currentCharIndex = (currentCharIndex + 1) % characters.length;
    loadLobbyCharacter();
    
    // spring pop character
    const avatarHex = (document.querySelector('.avatar-hex') as any);
    if (avatarHex) {
      avatarHex.classList.remove('popped');
      void avatarHex.offsetWidth; // trigger reflow
      avatarHex.classList.add('popped');
      setTimeout(() => avatarHex.classList.remove('popped'), 300);
    }
    
    // change quote to greet as the new character
    const textEl = ((document.getElementById('lobby-quote-text') || {}) as any);
    if (textEl) {
      if (currentCharIndex === 0) {
        textEl.textContent = "Daniel Guanes, reporting! Sensei is ready for developer tasks! ⚡";
      } else if (currentCharIndex === 1) {
        textEl.textContent = "Arona is here to assist you! Shall we check today's tasks, Sensei? 🌸";
      } else {
        textEl.textContent = "Hachiware is here! Let's do our best today! 🐻";
      }
    }
  }

  // ── Blue Archive Lobby Quotes ──
  const senseiQuotes = [
    "Welcome to the SCHALE office, Sensei! 🌸",
    "Calculations are perfect! Ready to review today's schedule? 📊",
    "Sensei, did you check your MomoTalk messages yet? 📱",
    "A good teacher shouldn't keep their students waiting! ⏱️",
    "Welcome back, Sensei! Let's do our best today! ✨",
    "If you have time to slack off, let's review the budget together! 🪙",
    "SCHALE is always open for you, Sensei. 🌸",
    "Don't forget to sign the contract at the Cafe! ✍️",
    "Let's check the manufacturing monitor for any updates! 📺"
  ];
  let quoteIndex = 0;
  function changeQuote() {
    const textEl = ((document.getElementById('lobby-quote-text') || {}) as any);
    const bubble = ((document.getElementById('lobby-quote-bubble') || {}) as any);
    if (!textEl) return;
    
    if (bubble) {
      bubble.classList.remove('clicked');
      void bubble.offsetWidth; // trigger reflow
      bubble.classList.add('clicked');
    }
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * senseiQuotes.length);
    } while (newIndex === quoteIndex && senseiQuotes.length > 1);
    
    quoteIndex = newIndex;
    textEl.style.opacity = 0;
    setTimeout(() => {
      textEl.textContent = senseiQuotes[quoteIndex];
      textEl.style.opacity = 1;
    }, 150);
  }

  // ── Dynamic Age Calculation ──
  (function() {
    const BIRTH = new Date(1999, 9, 4); // October 4, 1999 (0-indexed 9 is October)
    const now   = new Date();
    let age = now.getFullYear() - BIRTH.getFullYear();
    if (now < new Date(now.getFullYear(), 9, 4)) age--;
    
    const kanjiMap = { 
      0:"零",1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八",9:"九",
      10:"十",20:"二十",21:"二十一",22:"二十二",23:"二十三",24:"二十四",25:"二十五",
      26:"二十六",27:"二十七",28:"二十八",29:"二十九",30:"三十" 
    };
    const kanjiAge = kanjiMap[age] ?? age;
    
    const badge = (document.getElementById("age-badge") as any);
    if (badge) badge.textContent = kanjiAge + "歳";
    const topbarBadge = (document.getElementById("age-badge-topbar") as any);
    if (topbarBadge) topbarBadge.textContent = age;
  })();

  // ── Spotify Widget Integration ──
  async function fetchSpotify() {
    const el = (document.getElementById('spotify-content') as any);
    try {
      const res  = await fetch('/api/spotify');
      const data = (await res.json()) as any;

      if (!data.track) {
        el.innerHTML = `<span style="color:var(--muted)">🎵 Not listening to anything right now...</span>`;
        return;
      }

      const t      = data.track;
      const isLive = data.source === 'live';
      const fmtTime = ms => `${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,'0')}`;

      const currentSong = el.dataset.trackUrl;
      if (currentSong !== t.url) {
        const progress = t.duration ? Math.round((t.progress / t.duration) * 100) : 0;
        el.dataset.trackUrl = t.url;
        el.innerHTML = `
          <a href="${t.url}" target="_blank" style="text-decoration:none;display:flex;gap:12px;align-items:center;flex-wrap:nowrap;width:100%;">
            ${t.cover ? `<img src="${t.cover}" alt="${t.album}"
              style="width:55px;height:55px;border-radius:6px;flex-shrink:0;
                     border:1px solid rgba(29,185,84,.35);box-shadow:0 0 12px rgba(29,185,84,.2);"/>` : ''}
            <div style="flex:1;min-width:0;">
              <div id="spotify-status-label" style="font-size:.6rem;letter-spacing:1px;font-weight:900;margin-bottom:2px;
                           display:flex;align-items:center;gap:4px;color:#1db954;">
                ${isLive ? `<span style="width:6px;height:6px;background:#1db954;border-radius:50%;display:inline-block;animation:blink 1s infinite;"></span> PLAYING` : 'LAST PLAYED'}
              </div>
              <div style="font-size:0.8rem;font-weight:900;color:#f0d6f5;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                🎵 ${t.name}
              </div>
              <div style="font-size:.7rem;color:#1db954;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.artist}</div>
              ${isLive ? `
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                <span id="spotify-elapsed" style="font-size:.6rem;color:var(--muted);">${fmtTime(t.progress)}</span>
                <div style="flex:1;height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;">
                  <div id="spotify-bar" style="width:${progress}%;height:100%;background:#1db954;transition:width .9s linear;"></div>
                </div>
              </div>` : ''}
            </div>
          </a>`;

        if (isLive) {
          clearInterval((window as any)._spotifyTicker);
          let elapsed  = t.progress;
          const duration = t.duration;
          (window as any)._spotifyTicker = setInterval(() => {
            elapsed += 1000;
            if (elapsed > duration) { clearInterval((window as any)._spotifyTicker); return; }
            const bar = (document.getElementById('spotify-bar') as any);
            const elp = (document.getElementById('spotify-elapsed') as any);
            if (bar) bar.style.width = `${Math.min((elapsed / duration) * 100, 100)}%`;
            if (elp) elp.textContent = fmtTime(elapsed);
          }, 1000);
        }
      } else if (isLive) {
        const bar = (document.getElementById('spotify-bar') as any);
        const elp = (document.getElementById('spotify-elapsed') as any);
        if (bar) bar.style.width = `${Math.round((t.progress / t.duration) * 100)}%`;
        if (elp) elp.textContent = fmtTime(t.progress);
        
        clearInterval((window as any)._spotifyTicker);
        let elapsed = t.progress;
        const duration = t.duration;
        (window as any)._spotifyTicker = setInterval(() => {
          elapsed += 1000;
          if (elapsed > duration) { clearInterval((window as any)._spotifyTicker); return; }
          const b = (document.getElementById('spotify-bar') as any);
          const e = (document.getElementById('spotify-elapsed') as any);
          if (b) b.style.width = `${Math.min((elapsed / duration) * 100, 100)}%`;
          if (e) e.textContent = fmtTime(elapsed);
        }, 1000);
      }
    } catch(e) {
      el.innerHTML = `<span style="color:var(--muted);font-size:.75rem;">⚠️ Could not load Spotify.</span>`;
    }
  }

  // ── Steam Widget Integration ──
  async function fetchSteam() {
    const el = (document.getElementById('steam-content') as any);
    try {
      const res   = await fetch('/api/steam');
      const data  = (await res.json()) as any;
      const games = data.game ? [data.game] : null;

      if (!games || games.length === 0) {
        el.innerHTML = `<span style="color:var(--muted)">😴 No recent games found.</span>`;
        return;
      }

      const game   = games[0];
      const name   = game.name;
      const img    = game.img;
      const hrs2w  = (game.playtime_2weeks / 60).toFixed(1);
      const storeUrl = game.url;

      el.innerHTML = `
        <a href="${storeUrl}" target="_blank" style="text-decoration:none;display:flex;gap:12px;align-items:center;width:100%;">
          <img src="${img}" alt="${name}" style="width:90px;height:auto;border-radius:4px;flex-shrink:0;"/>
          <div style="min-width:0;flex:1;">
            <div style="font-size:.6rem;color:var(--neon-pink);font-weight:900;margin-bottom:2px;">
              ${data.source === 'live' ? 'PLAYING NOW' : 'RECENTLY PLAYED'}
            </div>
            <div style="font-size:0.8rem;font-weight:900;color:#f0d6f5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              🎮 ${name}
            </div>
            <div style="font-size:.65rem;color:var(--neon-cyan);font-weight:700;margin-top:1px;">
              ⏱️ ${hrs2w}h (2 weeks)
            </div>
          </div>
        </a>`;
    } catch(e) {
      el.innerHTML = `<span style="color:var(--muted);font-size:.75rem;">⚠️ Could not load Steam.</span>`;
    }
  }

  // ── Anonymous MomoTalk Messages Send ──
  const msgInput = (document.getElementById('msg-input') as any);
  if (msgInput) {
    msgInput.addEventListener('input', () => {
      (document.getElementById('msg-char') as any).textContent = `${msgInput.value.length} / 500`;
    });
  }

  async function sendMessage() {
    const msgInput = (document.getElementById('msg-input') as any);
    const msg      = msgInput.value.trim();
    const status   = (document.getElementById('msg-status') as any);
    const btn      = (document.getElementById('msg-btn') as any);
    if (!msg) return;
    btn.disabled = true; btn.style.opacity = '.6';
    status.style.display = 'none';
    try {
      const res  = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = (await res.json()) as any;
      if (data.success) {
        msgInput.value = '';
        (document.getElementById('msg-char') as any).textContent = '0 / 500';
        
        const chatArea = (document.getElementById('momotalk-chat-history') as any);
        if (chatArea) {
          const bubble = document.createElement('div');
          bubble.className = 'chat-bubble-container outgoing-chat mt-3 d-flex justify-content-end';
          bubble.innerHTML = `<div class="chat-bubble outgoing">${escHtml(msg)}</div>`;
          chatArea.appendChild(bubble);
          chatArea.scrollTop = chatArea.scrollHeight;
        }
        
        status.style.display = 'block';
        status.style.color   = '#80ffcc';
        status.textContent   = '✅ Sent! ありがとう 🌸';
      } else {
        throw new Error(data.error ?? 'Unknown error');
      }
    } catch(e) {
      status.style.display = 'block';
      status.style.color   = '#ff6b6b';
      status.textContent   = `❌ ${e.message || 'Failed to send.'}`;
    }
    btn.disabled = false; btn.style.opacity = '1';
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Falling Petals Generator ──
  function initFallingPetals() {
    const petals = ['🌸','✿','✦','✈️','💧'];
    const container = (document.querySelector('.bg-layer') as any);
    if (!container) return;
    
    // Clear existing petals first
    document.querySelectorAll('.petal').forEach(el => el.remove());

    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = petals[Math.floor(Math.random()*petals.length)];
      const isCyan = Math.random() > 0.5;
      p.style.cssText = `
        left:${Math.random()*100}%;
        animation-duration:${12+Math.random()*18}s;
        animation-delay:-${Math.random()*20}s;
        font-size:${10+Math.random()*10}px;
        color: ${isCyan ? 'var(--neon-cyan)' : 'var(--neon-pink)'};
        text-shadow: 0 0 5px ${isCyan ? 'var(--neon-cyan)' : 'var(--neon-pink)'};
      `;
      container.appendChild(p);
    }
  }

  // ── Real-Time Digital Clock HUD ──
  (function() {
    function updateClock() {
      const el = (document.getElementById("lobby-time-display") as any);
      if (!el) return;
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      el.textContent = `${hrs}:${mins}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  })();

  // ── Fullscreen Toggle ──
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // ── Smooth Scroll and Highlight Widgets ──
  function scrollToWidgets() {
    const el = (document.querySelector('.lobby-widgets-container') as any);
    if (!el) return;
    
    // Smooth scroll inside parent if scrollable, or window
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add glowing highlight border temporarily
    el.classList.add('highlighted-widgets');
    setTimeout(() => { 
      el.classList.remove('highlighted-widgets'); 
    }, 1500);
  }

  // ── Tarkov Theme Toggle & Audio Ticker ──
  const tarkovBackgrounds = [
    'img/tarkov1.jpeg', 'img/tarkov2.jpeg', 'img/tarkov3.jpeg',
    'img/tarvko4.jpeg', 'img/tarkov5.jpeg', 'img/tarkov6.jpeg'
  ];
  const tarkovSongs = [
    '00xprBmokcI', 'LDQEqhZ0TQc', 'zr5CCXjnZ8k', 'UxHruHuWKt4',
    '1nS3lkNc408', 'Krg0yrh8o0M', 'wq9deTUvcy0', 'CMKuhNXF3ws'
  ];

  let lastTarkovBG = null;
  let lastTarkovSong = null;

  function toggleTarkov() {
    const body = document.body;
    const btn = (document.getElementById('tarkov-btn') as any);
    const audioContainer = (document.getElementById('tarkov-audio-container') as any);
    const bgLayer = (document.querySelector('.bg-grad') as any);
    const isTarkov = body.classList.toggle('tarkov-theme');
    
    if (isTarkov) {
      btn.innerHTML = '<span class="btn-inner">⚡</span>';
      
      let randomBG, randomSong;
      do {
        randomBG = tarkovBackgrounds[Math.floor(Math.random() * tarkovBackgrounds.length)];
      } while (randomBG === lastTarkovBG && tarkovBackgrounds.length > 1);
      
      do {
        randomSong = tarkovSongs[Math.floor(Math.random() * tarkovSongs.length)];
      } while (randomSong === lastTarkovSong && tarkovSongs.length > 1);
      
      lastTarkovBG = randomBG;
      lastTarkovSong = randomSong;
      
      const img = new Image();
      img.onload = () => {
        bgLayer.style.backgroundImage = `linear-gradient(rgba(10, 10, 10, 0.65), rgba(10, 10, 10, 0.65)), url('${randomBG}')`;
      };
      img.onerror = () => {
        bgLayer.style.backgroundImage = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)';
      };
      img.src = randomBG;
      
      audioContainer.innerHTML = `<iframe width="1" height="1" src="https://www.youtube.com/embed/${randomSong}?autoplay=1&loop=1&playlist=${randomSong}&enablejsapi=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
    } else {
      btn.innerHTML = '<span class="btn-inner">⚙️</span>';
      bgLayer.style.backgroundImage = '';
      audioContainer.innerHTML = '';
    }
  }

  // ── Initialization ──
  window.addEventListener('DOMContentLoaded', () => {
    // Start game state
    GameState.load();
    
    // Run bootloader
    runBootSequence();
    
    // Restore original page initialization steps
    loadLobbyCharacter();
    changeQuote();
    initFallingPetals();
    fetchSpotify();
    fetchSteam();
    
    // Auto refresh spotify every 10s
    setInterval(fetchSpotify, 10000);
    
    // Attach sound initializers
    const lobbyCenter = (document.querySelector('.lobby-center-area') as any);
    if (lobbyCenter) {
      lobbyCenter.addEventListener('click', () => {
        BASound.playTap();
      });
    }
  });


// Expose functions to global window object for index.html inline onclick handlers
(window as any).openBAModal = openBAModal;
(window as any).closeAllBAModals = closeAllBAModals;
(window as any).replenishPyroxenes = replenishPyroxenes;
if (typeof toggleTarkov === 'function') (window as any).toggleTarkov = toggleTarkov;
if (typeof changeQuote === 'function') (window as any).changeQuote = changeQuote;
if (typeof swapLobbyCharacter === 'function') (window as any).swapLobbyCharacter = swapLobbyCharacter;
