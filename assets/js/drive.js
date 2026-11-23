/* Animated drive along the bottom of the hero.

   A small traffic simulation seen from above. The white car with the blue roof
   sensor is the self-driving car. It follows the car ahead, changes lanes around
   slow traffic, and gives cyclists and pedestrians room. Its camera field of view
   is the green wedge, camera detections get green boxes with a confidence score,
   and LiDAR returns are the small blue points. The Perceive / Reason / Act panel
   under the road says what the car sees and what it decides to do.

   Motion stops when the hero is off screen, when the tab is hidden, when the
   visitor presses the pause button, and for visitors who prefer reduced motion
   (they see a single still frame). */
(() => {
  const root = document.querySelector('.drive');
  if (!root) return;
  const canvas = root.querySelector('.drive-canvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return;

  const hero = root.closest('.hero');
  const toggle = root.querySelector('.drive-toggle');
  const hud = {};
  root.querySelectorAll('[data-hud]').forEach((el) => { hud[el.dataset.hud] = el; });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------- palette */
  const C = {
    ground: '#1f2a3b',
    bldg: ['#2a3649', '#2f3c52', '#283346', '#334159'],
    roofEdge: 'rgba(255,255,255,0.05)',
    unit: '#3c4b64',
    walk: '#2b3749',
    joint: 'rgba(255,255,255,0.035)',
    curb: '#3b4961',
    road: '#141b27',
    dash: 'rgba(255,255,255,0.45)',
    edge: 'rgba(255,255,255,0.6)',
    bike: '#18302a',
    bikeLine: 'rgba(120,220,170,0.5)',
    plant: '#1c3129',
    trees: ['#2c5445', '#31614e', '#274d3f'],
    lamp: '255,214,150',
    cam: '61,220,151',
    box: '#3ddc97',
    boxText: '#062016',
    lidar: '#7cc8ff',
    ego: '#f7f9fc',
    egoSensor: '#3d7fe0',
  };
  const CAR_COLORS = ['#a7b3c4', '#d5dbe3', '#c9a266', '#c4706a', '#6c97cc', '#7db3a2', '#8f86c9'];
  const TRUCK_COLORS = ['#d98f4e', '#5f8fc6', '#c4706a'];
  const SHIRTS = ['#e0a64a', '#6fa8dc', '#e06c75', '#98c379', '#c39be0', '#e5e9f0'];
  const SKIN = ['#f0cfae', '#d4a682', '#a87a58', '#7a553c'];

  /* ------------------------------------------------------ constants
     World units are "base pixels": a lane is 26 units wide. G.s converts
     base units to screen pixels for the current canvas size. */
  const V0 = 82;            // ego cruise speed, units per second
  const ACC = 38;           // gentle acceleration
  const DEC = 170;          // firm braking
  const MIN_GAP = 14;       // bumper-to-bumper gap when stopped behind a car
  const CHANGE_T = 1.7;     // seconds for a lane change
  const TAN_FOV = Math.tan(0.27);
  const LIDAR_R = 150;
  const SPEC = {
    car: { len: 30, wid: 15, label: 'car' },
    truck: { len: 56, wid: 17, label: 'truck' },
    cyclist: { len: 15, wid: 6, label: 'cyclist' },
    ped: { len: 6, wid: 8, label: 'pedestrian' },
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  /* ------------------------------------------------------ geometry */
  let W = 0;
  let H = 0;
  let G = null;

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const top = Math.round(H * 0.2);
    const bottom = Math.round(H * 0.22);
    const bike = Math.round(H * 0.08);
    const laneW = (H - top - bottom - bike) / 3;
    const s = laneW / 26;
    G = {
      s,
      top,
      laneW,
      bike,
      topWalk: Math.round(7 * s),
      roadTop: top,
      roadBot: top + laneW * 3,
      walkTop: top + laneW * 3 + bike,
      walkH: Math.round(bottom * 0.6),
      egoX: Math.round(clamp(W * 0.24, 90, 380)),
      range: clamp(W * 0.42, 230, 470) / s,
      font: Math.round(10 * clamp(s, 0.9, 1.1)),
    };
  }

  const laneY = (f) => G.roadTop + G.laneW * (f + 0.5);
  const toScreen = (x) => G.egoX + (x - ego.x) * G.s;
  const bounds = () => [ego.x - G.egoX / G.s, ego.x + (W - G.egoX) / G.s];

  /* ------------------------------------------------------ agents */
  function makeVehicle(kind, lane) {
    const sp = SPEC[kind];
    const v0 = kind === 'truck' ? rand(46, 60) : rand(56, 104);
    const conf = rand(0.88, 0.99);
    return {
      kind, x: 0, lane, laneF: lane, toLane: lane, p: 0, changing: false,
      len: sp.len, wid: sp.wid, v0, v: v0, cool: rand(1, 4), heading: 0,
      color: pick(kind === 'truck' ? TRUCK_COLORS : CAR_COLORS),
      conf, confBase: conf, det: 0, inView: false, braking: false,
      lead: null, gap: Infinity, dir: '', passLabel: '',
    };
  }
  function makeCyclist() {
    const conf = rand(0.84, 0.95);
    const v0 = rand(22, 30);
    return { kind: 'cyclist', x: 0, len: 15, wid: 6, v0, v: v0, conf, confBase: conf, det: 0, inView: false, shirt: pick(SHIRTS), skin: pick(SKIN), phase: rand(0, 6) };
  }
  function makePed() {
    const conf = rand(0.82, 0.95);
    return { kind: 'ped', x: 0, len: 6, wid: 8, yf: rand(0.1, 0.9), v: (Math.random() < 0.5 ? -1 : 1) * rand(7, 14), conf, confBase: conf, det: 0, inView: false, shirt: pick(SHIRTS), skin: pick(SKIN), phase: rand(0, 6) };
  }

  const ego = makeVehicle('car', 1);
  Object.assign(ego, { ego: true, v0: V0, v: V0, color: C.ego, nudge: 0, ease: 1 });
  let vehicles = [ego];
  let cyclists = [];
  let peds = [];
  let simTime = 0;
  let confClock = 0;

  const occupies = (b, lane) => Math.abs(b.laneF - lane) < 0.9 || (b.changing && b.toLane === lane);
  const clearAt = (lane, x, need, self) => vehicles.every((b) => b === self || !occupies(b, lane) || Math.abs(b.x - x) > need);

  function leaderOf(a) {
    let lead = null;
    let best = Infinity;
    for (const b of vehicles) {
      if (b === a || b.x <= a.x) continue;
      const inLane = Math.abs(b.laneF - a.laneF) < 0.8 || (a.changing && Math.abs(b.laneF - a.toLane) < 0.8);
      if (!inLane) continue;
      const gap = b.x - a.x - (a.len + b.len) / 2;
      if (gap < best) { best = gap; lead = b; }
    }
    return [lead, best];
  }

  function laneFree(a, lane) {
    for (const b of vehicles) {
      if (b === a || !occupies(b, lane)) continue;
      const dx = b.x - a.x;
      const half = (a.len + b.len) / 2;
      if (dx >= 0 && dx - half < 36 + Math.max(0, a.v - b.v) * 1.2) return false;
      if (dx < 0 && -dx - half < 22 + Math.max(0, b.v - a.v) * 1.6) return false;
    }
    return true;
  }

  function respawnVehicle(a, anywhere) {
    const [L, R] = bounds();
    a.v0 = a.kind === 'truck' ? rand(46, 60) : rand(56, 104);
    const ahead = Math.random() < (a.v0 < ego.v0 ? 0.85 : 0.2);
    for (let t = 0; t < 14; t++) {
      const lane = Math.floor(Math.random() * 3);
      const x = anywhere ? rand(L - 40, R + 200) : ahead ? R + rand(60, 300) : L - rand(60, 140);
      const need = anywhere && lane === ego.lane ? 110 : 90;
      if (clearAt(lane, x, need, a)) {
        Object.assign(a, {
          x, lane, laneF: lane, toLane: lane, changing: false, p: 0, heading: 0,
          v: a.v0, det: 0, cool: rand(1, 4), color: pick(a.kind === 'truck' ? TRUCK_COLORS : CAR_COLORS),
        });
        a.confBase = a.conf = rand(0.88, 0.99);
        return;
      }
    }
    a.x = R + 2000; // no room this frame; try again later
  }

  function respawnCyclist(c, anywhere) {
    const [L, R] = bounds();
    c.x = anywhere ? rand(L, R + 300) : R + rand(40, 420);
    c.v0 = c.v = rand(22, 30);
    c.det = 0;
  }

  function respawnPed(p, anywhere) {
    const [L, R] = bounds();
    p.x = anywhere ? rand(L, R + 200) : R + rand(20, 320);
    p.yf = rand(0.1, 0.9);
    p.det = 0;
  }

  // Keep traffic density proportional to the strip width.
  function ensureCounts(initial) {
    const span = W / G.s;
    const want = {
      veh: clamp(Math.round(span / 165), 3, 13),
      cyc: clamp(Math.round(span / 650), 1, 3),
      ped: clamp(Math.round(span / 190), 2, 10),
    };
    while (vehicles.length - 1 < want.veh) {
      const v = makeVehicle(vehicles.length % 5 === 1 ? 'truck' : 'car', 0);
      vehicles.push(v);
      respawnVehicle(v, initial);
    }
    while (vehicles.length - 1 > want.veh) vehicles.pop();
    while (cyclists.length < want.cyc) { const c = makeCyclist(); cyclists.push(c); respawnCyclist(c, initial); }
    cyclists.length = want.cyc;
    while (peds.length < want.ped) { const p = makePed(); peds.push(p); respawnPed(p, initial); }
    peds.length = want.ped;
  }

  const detectables = () => vehicles.filter((v) => !v.ego).concat(cyclists, peds);

  function objY(o) {
    if (o.kind === 'cyclist') return G.roadBot + G.bike / 2;
    if (o.kind === 'ped') return G.walkTop + 4 * G.s + o.yf * (G.walkH - 8 * G.s);
    return laneY(o.laneF + (o.ego ? o.nudge : 0));
  }

  function inFov(o) {
    const dx = o.x - (ego.x + ego.len / 2);
    if (dx <= 0 || dx > G.range) return false;
    const dy = (objY(o) - objY(ego)) / G.s;
    return Math.abs(dy) <= dx * TAN_FOV + o.wid / 2;
  }

  /* ------------------------------------------------------ simulation step */
  function step(dt) {
    simTime += dt;

    // Lane changes: pass a slow leader when the next lane has room.
    for (const a of vehicles) {
      const [lead, gap] = leaderOf(a);
      a.lead = lead;
      a.gap = gap;
      a.cool -= dt;
      if (a.changing || a.cool > 0 || !lead || gap > 85 || lead.v > a.v0 - 8) continue;
      const options = a.lane === 1 ? (Math.random() < 0.5 ? [0, 2] : [2, 0]) : [1];
      let moved = false;
      for (const lane of options) {
        if (!laneFree(a, lane)) continue;
        a.changing = true;
        a.toLane = lane;
        a.p = 0;
        a.dir = lane < a.lane ? 'left' : 'right';
        a.passLabel = SPEC[lead.kind].label;
        moved = true;
        break;
      }
      a.cool = moved ? 99 : 0.5;
    }

    // The ego car eases off near a pedestrian at the curb and edges away from cyclists.
    const egoCurbLane = ego.lane === 2 && !ego.changing;
    const pedNear = egoCurbLane && peds.some((p) => p.inView && p.x - ego.x < 150);
    const cycNear = egoCurbLane && cyclists.some((c) => c.x - ego.x > -40 && c.x - ego.x < 110);
    ego.ease += ((pedNear ? 0.82 : cycNear ? 0.92 : 1) - ego.ease) * Math.min(1, dt * 2);
    ego.nudge += ((cycNear ? -0.16 : 0) - ego.nudge) * Math.min(1, dt * 2.5);

    // Speeds: follow the leader, never closer than MIN_GAP.
    for (const a of vehicles) {
      const [lead, gap] = leaderOf(a);
      let target = a.v0 * (a.ego ? ego.ease : 1);
      if (lead) target = Math.min(target, lead.v + (gap - MIN_GAP) * 1.15);
      target = Math.max(0, target);
      const dv = target - a.v;
      a.braking = dv < -4;
      a.v += dv > 0 ? Math.min(dv, ACC * dt) : Math.max(dv, -DEC * dt);
    }

    // Move.
    for (const a of vehicles) {
      a.x += a.v * dt;
      if (!a.changing) continue;
      const prev = a.laneF;
      a.p = Math.min(1, a.p + dt / CHANGE_T);
      a.laneF = a.lane + (a.toLane - a.lane) * ease(a.p);
      if (dt > 0) a.heading = clamp(Math.atan2(((a.laneF - prev) * 26) / dt, Math.max(a.v, 20)), -0.3, 0.3);
      if (a.p >= 1) {
        a.lane = a.toLane;
        a.laneF = a.lane;
        a.changing = false;
        a.heading = 0;
        a.cool = rand(3, 6);
      }
    }
    for (const c of cyclists) { c.x += c.v * dt; c.phase += dt * 8; }
    for (const p of peds) { p.x += p.v * dt; p.phase += dt * 7; }

    // Recycle anything that has left the strip.
    const [L, R] = bounds();
    for (const a of vehicles) if (!a.ego && (a.x < L - 120 || a.x > R + 340)) respawnVehicle(a, false);
    for (const c of cyclists) if (c.x < L - 60) respawnCyclist(c, false);
    for (const p of peds) if (p.x < L - 30 || p.x > R + 400) respawnPed(p, false);

    // Detection state, with a short fade so boxes snap on rather than blink.
    for (const o of detectables()) {
      o.inView = inFov(o);
      o.det = clamp(o.det + (o.inView ? dt * 5 : -dt * 4), 0, 1);
    }
    confClock += dt;
    if (confClock > 1.1) {
      confClock = 0;
      for (const o of detectables()) o.conf = clamp(o.confBase + rand(-0.02, 0.02), 0.8, 0.99);
    }
  }

  /* ------------------------------------------------------ drawing */
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawScenery(L, R) {
    const s = G.s;
    ctx.fillStyle = C.ground;
    ctx.fillRect(0, 0, W, H);

    // Buildings along the top.
    const P = 110;
    const front = G.top - G.topWalk;
    for (let i = Math.floor(L / P) - 1; i <= Math.ceil(R / P) + 1; i++) {
      const w = P * (0.5 + 0.4 * hash(i, 1));
      const x0 = i * P + hash(i, 2) * (P - w);
      const sx = toScreen(x0);
      const sw = w * s;
      const depth = front - (2 + hash(i, 7) * 6) * s;
      ctx.fillStyle = C.bldg[Math.floor(hash(i, 3) * C.bldg.length)];
      ctx.fillRect(sx, -4, sw, depth + 4);
      ctx.strokeStyle = C.roofEdge;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 3 * s, 3 * s - 4, sw - 6 * s, depth - 6 * s + 4);
      if (hash(i, 4) > 0.35) {
        ctx.fillStyle = C.unit;
        ctx.fillRect(sx + sw * (0.15 + 0.5 * hash(i, 5)), depth * 0.3, 7 * s, 5 * s);
      }
    }

    // Sidewalks, road, bike lane, planting strip.
    ctx.fillStyle = C.walk;
    ctx.fillRect(0, front, W, G.topWalk);
    ctx.fillRect(0, G.walkTop, W, G.walkH);
    ctx.fillStyle = C.road;
    ctx.fillRect(0, G.roadTop, W, G.laneW * 3);
    ctx.fillStyle = C.bike;
    ctx.fillRect(0, G.roadBot, W, G.bike);
    ctx.fillStyle = C.plant;
    ctx.fillRect(0, G.walkTop + G.walkH, W, H - G.walkTop - G.walkH);

    // Paving joints.
    ctx.fillStyle = C.joint;
    for (let x = Math.floor(L / 20) * 20; x < R + 20; x += 20) {
      const sx = toScreen(x);
      ctx.fillRect(sx, G.walkTop, 1, G.walkH);
      ctx.fillRect(sx, front, 1, G.topWalk);
    }

    // Curbs and lane markings.
    ctx.fillStyle = C.curb;
    ctx.fillRect(0, G.roadTop - 1, W, 1);
    ctx.fillRect(0, G.walkTop, W, 1);
    ctx.fillStyle = C.edge;
    ctx.fillRect(0, G.roadTop + 1.5 * s, W, 1.2);
    ctx.fillStyle = C.bikeLine;
    ctx.fillRect(0, G.roadBot - 0.6, W, 1.2);
    ctx.fillStyle = C.dash;
    for (let k = 1; k <= 2; k++) {
      const y = G.roadTop + G.laneW * k - 0.7;
      for (let x = Math.floor(L / 36) * 36 - 36; x < R + 36; x += 36) ctx.fillRect(toScreen(x), y, 18 * s, 1.4);
    }

    // Trees in the planting strip.
    const T = 70;
    for (let i = Math.floor(L / T) - 1; i <= Math.ceil(R / T) + 1; i++) {
      if (hash(i, 8) < 0.3) continue;
      const sx = toScreen(i * T + hash(i, 9) * T * 0.5);
      const r = (7 + 3.5 * hash(i, 10)) * s;
      const cy = G.walkTop + G.walkH + (H - G.walkTop - G.walkH) * 0.55;
      ctx.fillStyle = C.trees[Math.floor(hash(i, 11) * C.trees.length)];
      ctx.beginPath();
      ctx.arc(sx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(sx - r * 0.3, cy - r * 0.3, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Street lamps with a warm pool of light.
    const Lp = 150;
    for (let i = Math.floor(L / Lp) - 1; i <= Math.ceil(R / Lp) + 1; i++) {
      const sx = toScreen(i * Lp + 40);
      for (const cy of [front + G.topWalk * 0.5, G.walkTop + 2.5 * s]) {
        const g = ctx.createRadialGradient(sx, cy, 0, sx, cy, 14 * s);
        g.addColorStop(0, `rgba(${C.lamp},0.22)`);
        g.addColorStop(1, `rgba(${C.lamp},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(sx - 14 * s, cy - 14 * s, 28 * s, 28 * s);
        ctx.fillStyle = `rgb(${C.lamp})`;
        ctx.beginPath();
        ctx.arc(sx, cy, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawFov() {
    const s = G.s;
    const fx = G.egoX + (ego.len / 2) * s;
    const fy = objY(ego);
    const R = G.range * s;
    const h = ego.heading;
    const a = Math.atan(TAN_FOV);
    const g = ctx.createLinearGradient(fx, 0, fx + R, 0);
    g.addColorStop(0, `rgba(${C.cam},0.22)`);
    g.addColorStop(1, `rgba(${C.cam},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.arc(fx, fy, R, h - a, h + a);
    ctx.closePath();
    ctx.fill();
    const e = ctx.createLinearGradient(fx, 0, fx + R, 0);
    e.addColorStop(0, `rgba(${C.cam},0.55)`);
    e.addColorStop(1, `rgba(${C.cam},0)`);
    ctx.strokeStyle = e;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(h - a) * R, fy + Math.sin(h - a) * R);
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(h + a) * R, fy + Math.sin(h + a) * R);
    ctx.stroke();
  }

  function drawVehicle(a) {
    const s = G.s;
    const L = a.len * s;
    const Wd = a.wid * s;
    const sx = toScreen(a.x);
    const sy = objY(a);
    if (sx < -L || sx > W + L) return;

    if (a.ego) {
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30 * s);
      halo.addColorStop(0, 'rgba(124,200,255,0.22)');
      halo.addColorStop(1, 'rgba(124,200,255,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 30 * s, sy - 30 * s, 60 * s, 60 * s);
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(a.heading || 0);

    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    rr(-L / 2 + 1.5, -Wd / 2 + 2, L, Wd, Wd * 0.32);
    ctx.fill();

    if (a.kind === 'truck') {
      ctx.fillStyle = '#dfe4ec';
      rr(-L / 2, -Wd / 2, L * 0.7, Wd, 2 * s);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      for (let k = 1; k < 5; k++) ctx.fillRect(-L / 2 + (L * 0.7 * k) / 5, -Wd / 2 + 1, 1, Wd - 2);
      ctx.fillStyle = a.color;
      rr(L / 2 - L * 0.27, -Wd / 2 + 0.6 * s, L * 0.27, Wd - 1.2 * s, 3 * s);
      ctx.fill();
      ctx.fillStyle = 'rgba(12,18,28,0.6)';
      ctx.fillRect(L / 2 - L * 0.1, -Wd / 2 + 2.2 * s, L * 0.06, Wd - 4.4 * s);
    } else {
      ctx.fillStyle = a.color;
      rr(-L / 2, -Wd / 2, L, Wd, Wd * 0.32);
      ctx.fill();
      ctx.fillStyle = 'rgba(12,18,28,0.58)';
      rr(-L * 0.24, -Wd / 2 + 2 * s, L * 0.46, Wd - 4 * s, 2.5 * s);
      ctx.fill();
      ctx.fillStyle = a.color;
      rr(-L * 0.15, -Wd / 2 + 2.4 * s, L * 0.27, Wd - 4.8 * s, 2 * s);
      ctx.fill();
    }

    // Headlights.
    ctx.fillStyle = 'rgba(255,244,214,0.95)';
    ctx.fillRect(L / 2 - 1.6 * s, -Wd / 2 + 1.5 * s, 1.6 * s, 2.4 * s);
    ctx.fillRect(L / 2 - 1.6 * s, Wd / 2 - 3.9 * s, 1.6 * s, 2.4 * s);

    // Tail lights glow when braking.
    if (a.braking) {
      ctx.fillStyle = 'rgba(255,70,70,0.35)';
      ctx.beginPath();
      ctx.arc(-L / 2, 0, Wd * 0.62, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.fill();
    }
    ctx.fillStyle = a.braking ? '#ff6b6b' : '#b8403f';
    ctx.fillRect(-L / 2, -Wd / 2 + 1.5 * s, 1.4 * s, 2.3 * s);
    ctx.fillRect(-L / 2, Wd / 2 - 3.8 * s, 1.4 * s, 2.3 * s);

    // Turn signal on the side it is moving toward.
    if (a.changing && Math.floor(simTime * 3.2) % 2 === 0) {
      const side = a.toLane < a.lane ? -1 : 1;
      ctx.fillStyle = '#ffb547';
      const y = side < 0 ? -Wd / 2 - 0.4 * s : Wd / 2 - 1.6 * s;
      ctx.fillRect(L / 2 - 3 * s, y, 2.6 * s, 2 * s);
      ctx.fillRect(-L / 2 + 0.4 * s, y, 2.6 * s, 2 * s);
    }

    // Roof LiDAR on the self-driving car.
    if (a.ego) {
      ctx.fillStyle = C.egoSensor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-L * 0.02, 0, 2.8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCyclist(c) {
    const s = G.s;
    const sx = toScreen(c.x);
    if (sx < -20 || sx > W + 20) return;
    const sy = objY(c);
    ctx.fillStyle = '#9fb0c6';
    rr(sx - 7.5 * s, sy - 1 * s, 15 * s, 2 * s, 1 * s);
    ctx.fill();
    ctx.fillStyle = c.shirt;
    ctx.beginPath();
    ctx.ellipse(sx - 0.5 * s, sy, 2.6 * s, 3.6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(sx + 2.2 * s, sy, 1.9 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPed(p) {
    const s = G.s;
    const sx = toScreen(p.x);
    if (sx < -10 || sx > W + 10) return;
    const sy = objY(p) + Math.sin(p.phase) * 0.4 * s;
    ctx.fillStyle = p.shirt;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 2.8 * s, 4.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(sx + (p.v > 0 ? 0.6 : -0.6) * s, sy, 2.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function boxOf(o) {
    const s = G.s;
    const pad = 2.5 * s;
    const w = o.len * s + pad * 2;
    const h = o.wid * s + pad * 2;
    return { x: toScreen(o.x) - w / 2, y: objY(o) - h / 2, w, h };
  }

  function drawDetections() {
    ctx.font = `600 ${G.font}px "IBM Plex Sans", system-ui, sans-serif`;
    ctx.textBaseline = 'middle';
    const placed = [];
    const nearestFirst = detectables().filter((o) => o.det > 0).sort((a, b) => a.x - b.x);
    for (const o of nearestFirst) {
      const b = boxOf(o);
      const grow = (1 - o.det) * 6;
      const x = b.x - grow;
      const y = b.y - grow;
      const w = b.w + grow * 2;
      const h = b.h + grow * 2;
      const c = Math.min(7 * G.s, w * 0.35, h * 0.45);
      ctx.globalAlpha = o.det;
      ctx.strokeStyle = C.box;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
      ctx.moveTo(x + w - c, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + c);
      ctx.moveTo(x + w, y + h - c); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - c, y + h);
      ctx.moveTo(x + c, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - c);
      ctx.stroke();

      // Label above the box, else below, else higher up; skip it if all collide.
      const text = `${SPEC[o.kind].label} ${o.conf.toFixed(2)}`;
      const tw = ctx.measureText(text).width + 8;
      const th = G.font + 4;
      const lx = clamp(x, 2, W - tw - 2);
      const spot = [y - th - 2, y + h + 2, y - th * 2 - 4]
        .filter((ly) => ly >= 1 && ly + th <= H - 1)
        .find((ly) => placed.every((r) => lx + tw < r.x || lx > r.x + r.w || ly + th < r.y || ly > r.y + r.h));
      if (spot === undefined) continue;
      placed.push({ x: lx - 2, y: spot - 1, w: tw + 4, h: th + 2 });
      ctx.fillStyle = C.box;
      rr(lx, spot, tw, th, 3);
      ctx.fill();
      ctx.fillStyle = C.boxText;
      ctx.fillText(text, lx + 4, spot + th / 2 + 0.5);
    }
    ctx.globalAlpha = 1;
  }

  // LiDAR returns: points on the faces of nearby objects and building fronts.
  function drawLidar(L, R) {
    const s = G.s;
    const ex = G.egoX;
    const ey = objY(ego);
    const Rpx = LIDAR_R * s;
    const tq = Math.floor(simTime * 12);
    const size = 1.6;
    ctx.fillStyle = C.lidar;

    const face = (x0, y0, x1, y1, seed, alpha) => {
      const n = Math.max(2, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 3.2));
      ctx.globalAlpha = alpha;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const j = (hash(seed + i, tq) - 0.5) * 1.1;
        ctx.fillRect(x0 + (x1 - x0) * t + j - size / 2, y0 + (y1 - y0) * t - j - size / 2, size, size);
      }
    };

    let seed = 1;
    for (const o of detectables()) {
      seed += 17;
      const b = boxOf(o);
      const pad = 2.5 * s;
      const x0 = b.x + pad;
      const y0 = b.y + pad;
      const x1 = b.x + b.w - pad;
      const y1 = b.y + b.h - pad;
      const d = Math.hypot((x0 + x1) / 2 - ex, (y0 + y1) / 2 - ey);
      if (d > Rpx) continue;
      const alpha = 0.35 + 0.65 * (1 - d / Rpx);
      if (ex < x0) face(x0, y0, x0, y1, seed, alpha);
      else if (ex > x1) face(x1, y0, x1, y1, seed + 3, alpha);
      if (ey < y0) face(x0, y0, x1, y0, seed + 5, alpha);
      else if (ey > y1) face(x0, y1, x1, y1, seed + 7, alpha);
    }

    // Building fronts facing the road.
    const yb = G.top - G.topWalk;
    const dy = ey - yb;
    if (Math.abs(dy) < Rpx) {
      const reach = Math.sqrt(Rpx * Rpx - dy * dy);
      const P = 110;
      for (let i = Math.floor(L / P) - 1; i <= Math.ceil(R / P) + 1; i++) {
        const w = P * (0.5 + 0.4 * hash(i, 1));
        const bx0 = toScreen(i * P + hash(i, 2) * (P - w));
        const bx1 = bx0 + w * s;
        const depth = yb - (2 + hash(i, 7) * 6) * s;
        const a0 = Math.max(bx0, ex - reach);
        const a1 = Math.min(bx1, ex + reach);
        if (a1 <= a0) continue;
        for (let x = a0; x <= a1; x += 4) {
          const d = Math.hypot(x - ex, depth - ey);
          if (d > Rpx) continue;
          ctx.globalAlpha = 0.25 + 0.5 * (1 - d / Rpx);
          ctx.fillRect(x + (hash(x | 0, tq) - 0.5), depth - size / 2, size, size);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!G || W === 0 || H === 0) return;
    const [L, R] = bounds();
    drawScenery(L, R);
    drawFov();
    for (const p of peds) drawPed(p);
    for (const c of cyclists) drawCyclist(c);
    for (const a of vehicles) if (!a.ego) drawVehicle(a);
    drawVehicle(ego);
    drawDetections();
    drawLidar(L, R);
  }

  /* ------------------------------------------------------ narration */
  let hudClock = 0;
  let pairKey = '';
  let pairSince = -10;

  function decide(seen) {
    if (ego.changing) return [`Slow ${ego.passLabel} ahead in my lane`, `Change lane to the ${ego.dir}`, true];
    if (ego.lead && ego.gap < 70 && ego.v < ego.v0 - 6) {
      return [`${cap(SPEC[ego.lead.kind].label)} ahead, next lane is busy`, 'Hold a safe following gap', false];
    }
    const near = (o, d) => o.x - ego.x < d;
    if (ego.lane === 2 && seen.some((o) => o.kind === 'cyclist' && near(o, 170))) return ['Cyclist in the bike lane', 'Give extra room while passing', false];
    if (ego.lane === 2 && seen.some((o) => o.kind === 'ped' && near(o, 150))) return ['Pedestrian close to the curb', 'Ease off and stay alert', false];
    return ['Lane ahead is clear', 'Cruise at the speed limit', false];
  }

  function setText(el, text, fade) {
    if (!el || el.textContent === text) return;
    if (!fade || reduceMotion.matches) { el.textContent = text; return; }
    el.classList.add('is-swapping');
    window.setTimeout(() => { el.textContent = text; el.classList.remove('is-swapping'); }, 200);
  }

  function narrate(dt, force) {
    hudClock += dt;
    if (!force && hudClock < 0.45) return;
    hudClock = 0;
    const seen = detectables().filter((o) => o.inView).sort((a, b) => a.x - b.x);
    setText(
      hud.perceive,
      seen.length ? seen.slice(0, 3).map((o) => `${SPEC[o.kind].label} ${o.conf.toFixed(2)}`).join(', ') : 'Scanning the road ahead',
      false
    );
    const [reason, act, urgent] = decide(seen);
    const key = `${reason}|${act}`;
    if (key !== pairKey && (force || urgent || simTime - pairSince > 1.6)) {
      pairKey = key;
      pairSince = simTime;
      setText(hud.reason, reason, !force);
      setText(hud.act, act, !force);
    }
  }

  /* ------------------------------------------------------ run loop */
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let paused = false;

  function frame(t) {
    const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
    last = t;
    step(dt);
    draw();
    narrate(dt, false);
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (raf || paused || !onScreen || document.hidden || reduceMotion.matches) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function stillFrame() {
    root.classList.add('is-static');
    for (let i = 0; i < 150; i++) step(1 / 30);
    draw();
    narrate(0, true);
  }

  layout();
  ensureCounts(true);
  for (let i = 0; i < 45; i++) step(1 / 30); // settle traffic before the first frame
  draw();
  narrate(0, true);
  if (reduceMotion.matches) stillFrame();

  if (toggle) {
    toggle.addEventListener('click', () => {
      paused = !paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
      if (hero) hero.classList.toggle('is-paused', paused);
      if (paused) stop(); else play();
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) play(); else stop();
    }).observe(root);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else play();
  });

  const onMotionPref = () => {
    if (reduceMotion.matches) { stop(); stillFrame(); }
    else { root.classList.remove('is-static'); play(); }
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionPref);

  if ('ResizeObserver' in window) {
    let lastW = W;
    let lastH = H;
    new ResizeObserver(() => {
      if (canvas.clientWidth === lastW && canvas.clientHeight === lastH) return;
      lastW = canvas.clientWidth;
      lastH = canvas.clientHeight;
      layout();
      ensureCounts(false);
      if (!raf) draw();
    }).observe(canvas);
  }

  play();
})();
