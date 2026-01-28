(() => {
  // Simple tower shop + placement for your tower defense game
  const canvas = document.getElementById("mapCanvas");
  if (!canvas) return; // if no canvas on page, do nothing
  const rect = canvas.getBoundingClientRect();

  let coins = 120;
  let selectedType = null;
  const towers = [];
  window.towers = towers;
  const TOWER_GAP = 12; // extra ruimte tussen torens (pixels)
  let hoveredIdx = -1;
  let mouseX = 0,
    mouseY = 0,
    mouseInside = false;

  const defs = window.TOWER_DEFS || {};

  function towerRadius(def) {
    if (!def || !def.id) return 12;
    return def.id === "star" ? 16 : def.id === "heavy" ? 14 : 12;
  }

  function canPlaceTower(x, y, def) {
    if (window.isOnPath && window.isOnPath(x, y)) {
      return { ok: false, reason: "path" };
    }
    const r = towerRadius(def);
    for (const t of towers) {
      const tr = t.radius != null ? t.radius : towerRadius(t.def);
      const minD = tr + r + TOWER_GAP;
      const dx = t.x - x;
      const dy = t.y - y;
      if (dx * dx + dy * dy < minD * minD) {
        return { ok: false, reason: "near" };
      }
    }
    return { ok: true };
  }

  // Build menu (right side)
  const menu = document.createElement("div");
  menu.id = "towerMenu";
  menu.className = "tower-menu";
  const headerHTML = `
    <div class="coin">Coins: <span id="coinCount">${coins}</span></div>
    <div class="lives">Lives: <span id="liveCount">3</span></div>
    <div class="shop"></div>
    <div class="info">Select a tower then click the map to place.</div>
  `;
  menu.innerHTML = headerHTML;
  const shopEl = menu.querySelector('.shop');
  const order = ['light','heavy','candy','frost','star','sniper','splash','ice'];
  order.forEach((key)=>{
    const d = defs[key];
    if (!d) return;
    const btn = document.createElement('div');
    btn.className = 'tower-btn';
    btn.dataset.type = key;
    btn.innerHTML = `${d.name}<br><span class="cost">${d.cost}</span>`;
    shopEl.appendChild(btn);
  });
  document.body.appendChild(menu);

  function updateCoins() {
    const el = document.getElementById("coinCount");
    if (el) el.textContent = coins;
    // also sync lives display
    if (window.lives !== undefined) {
      const liveEl = document.getElementById("liveCount");
      if (liveEl) liveEl.textContent = window.lives;
    }
  }

  menu.querySelectorAll(".tower-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const t = b.dataset.type;
      selectedType = defs[t];
      menu
        .querySelectorAll(".tower-btn")
        .forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    });
  });

  canvas.addEventListener("click", (ev) => {
    if (!selectedType) return;
    const r = canvas.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    const place = canPlaceTower(x, y, selectedType);
    if (!place.ok) {
      if (place.reason === "path")
        alert(
          "Je kunt geen toren op het pad plaatsen. Kies een andere plaats."
        );
      else if (place.reason === "near")
        alert("Plaats torens niet te dicht bij elkaar. Houd wat ruimte vrij.");
      return;
    }
    if (coins < selectedType.cost) {
      alert("Niet genoeg munten");
      return;
    }
    coins -= selectedType.cost;
    towers.push({
      x,
      y,
      def: selectedType,
      cooldown: 0,
      radius: towerRadius(selectedType),
      hp: selectedType.hp,
      maxHp: selectedType.hp,
    });
    updateCoins();
    selectedType = null;
    menu
      .querySelectorAll(".tower-btn")
      .forEach((x) => x.classList.remove("selected"));
  });

  // Hover handling for highlighting tower ranges and placement preview
  canvas.addEventListener("mousemove", (ev) => {
    const r = canvas.getBoundingClientRect();
    mouseX = ev.clientX - r.left;
    mouseY = ev.clientY - r.top;
    mouseInside = true;
    // find nearest tower within 18px for hover highlight
    let best = -1,
      bestD2 = 18 * 18;
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      const dx = t.x - mouseX;
      const dy = t.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 <= bestD2) {
        bestD2 = d2;
        best = i;
      }
    }
    hoveredIdx = best;
  });
  canvas.addEventListener("mouseleave", () => {
    mouseInside = false;
    hoveredIdx = -1;
  });

  // Tower animation time
  let animTime = 0;

  // Expose draw function so map rendering can call it after drawing the map
  window.drawTowers = function (ctx) {
    animTime += 0.016; // ~60fps increment
    for (const t of towers) {
      const size = t.def.id === "star" ? 16 : t.def.id === "heavy" ? 14 : 12;
      const glow = Math.sin(animTime * 3) * 0.3 + 0.7; // pulsing 0.4 to 1.0

      // glow halo (outer)
      ctx.save();
      ctx.globalAlpha = 0.4 * glow;
      ctx.fillStyle = t.def.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // shadow under tower
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(t.x, t.y + size + 3, size, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // tower base with gradient effect
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = t.def.color;
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();

      // highlight on tower
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(t.x - size * 0.4, t.y - size * 0.4, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // border
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // HP bar above the tower
      const maxHp = t.maxHp != null ? t.maxHp : (t.def && t.def.hp) || 100;
      const curHp = t.hp != null ? t.hp : maxHp;
      const bw = Math.max(26, size * 2);
      const bh = 5;
      const bx = t.x - bw / 2;
      const by = t.y - size - 16;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(bx, by, bw, bh);
      const fillW = Math.max(0, (bw - 2) * (curHp / Math.max(1, maxHp)));
      ctx.fillStyle = curHp / maxHp > 0.5 ? "#6fff6f" : curHp / maxHp > 0.25 ? "#ffd166" : "#ff6b6b";
      ctx.fillRect(bx + 1, by + 1, fillW, bh - 2);
      ctx.restore();

      // decoration based on type with rotation
      const rot =
        animTime * (t.def.id === "candy" ? 2 : t.def.id === "frost" ? 1 : 0.5);
      if (t.def.id === "star") {
        drawStar(ctx, t.x, t.y - size * 0.3, 6, 3, rot);
      } else if (t.def.id === "candy") {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(rot);
        ctx.fillStyle = "#ff1744";
        ctx.fillRect(-5, -3, 10, 6);
        ctx.fillStyle = "#fff";
        ctx.fillRect(-2, -3, 4, 6);
        ctx.restore();
      } else if (t.def.id === "frost") {
        drawSnowflake(ctx, t.x, t.y, 7, rot);
      } else if (t.def.id === "light") {
        // light ray effect
        ctx.save();
        ctx.globalAlpha = 0.5 * glow;
        ctx.strokeStyle = t.def.color;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 + animTime;
          const x2 = t.x + Math.cos(angle) * (size + 6);
          const y2 = t.y + Math.sin(angle) * (size + 6);
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (t.def.id === "heavy") {
        // small armor lines
        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(t.x - size, t.y + i * 4);
          ctx.lineTo(t.x + size, t.y + i * 4);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Clear, solid black range indicator: extra thick black ring with white halo + ticks
      const R = t.def.range;
      // white halo (underlay) for maximum contrast on any background
      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(t.x, t.y, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // thick black ring (overlay)
      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(t.x, t.y, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // small tick marks at N/E/S/W for extra clarity (black)
      ctx.save();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      const tick = 8;
      // top
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - R);
      ctx.lineTo(t.x, t.y - R - tick);
      ctx.stroke();
      // right
      ctx.beginPath();
      ctx.moveTo(t.x + R, t.y);
      ctx.lineTo(t.x + R + tick, t.y);
      ctx.stroke();
      // bottom
      ctx.beginPath();
      ctx.moveTo(t.x, t.y + R);
      ctx.lineTo(t.x, t.y + R + tick);
      ctx.stroke();
      // left
      ctx.beginPath();
      ctx.moveTo(t.x - R, t.y);
      ctx.lineTo(t.x - R - tick, t.y);
      ctx.stroke();
      ctx.restore();
    }

    // placement preview ring when selecting a tower type
    if (selectedType && mouseInside) {
      const invalid = !canPlaceTower(mouseX, mouseY, selectedType).ok;
      ctx.save();
      const color = invalid ? "#ff4d4f" : selectedType.color;
      const R = selectedType.range;
      // solid black ring (or red if invalid)
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = invalid ? "#ff0000" : "#000000";
      ctx.lineWidth = 5;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  function drawStar(ctx, x, y, outer, inner, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = "#ffd700";
    ctx.shadowColor = "rgba(255,215,0,0.6)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / 5;
      const px = radius * Math.cos(angle - Math.PI / 2);
      const py = radius * Math.sin(angle - Math.PI / 2);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffed4e";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawSnowflake(ctx, x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = "#00ced1";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, size);
      ctx.stroke();
      // small branches
      for (let j = 1; j <= 2; j++) {
        ctx.beginPath();
        ctx.moveTo(0, (size / 3) * j);
        ctx.lineTo(-3, (size / 3) * j - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (size / 3) * j);
        ctx.lineTo(3, (size / 3) * j - 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // effects are centralized in window.effects
  const lasers = window.effects && window.effects.lasers ? window.effects.lasers : [];
  const impacts = window.effects && window.effects.impacts ? window.effects.impacts : [];
  const enemyBeams = window.effects && window.effects.enemyBeams ? window.effects.enemyBeams : [];

  // simple WebAudio laser sound (synth)
  let audioCtx = null;
  function playLaserSound(type) {
    try {
      if (!audioCtx)
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sawtooth";
      // frequency by type
      let freq = 720;
      if (type === "heavy") freq = 440;
      else if (type === "sniper") freq = 360;
      else if (type === "splash") freq = 500;
      else if (type === "ice") freq = 520;
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t0);
      o.stop(t0 + 0.13);
    } catch (e) {
      // ignore audio errors (e.g., autoplay restrictions)
      console.warn("Audio unavailable", e);
    }
  }

  // draw functions provided by effects.js
  window.drawLasers = window.drawLasers;

  // draw enemy beams (counter-attacks)
  window.drawEnemyBeams = function (ctx) {
    for (const b of enemyBeams) {
      const alpha = Math.max(0, b.ttl / b.duration);
      // glow
      ctx.save();
      ctx.globalAlpha = 0.5 * alpha;
      ctx.strokeStyle = b.color || "#ff4444";
      ctx.lineWidth = 8;
      ctx.shadowColor = b.color || "#ff4444";
      ctx.shadowBlur = 14 * alpha;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
      // core line
      ctx.save();
      ctx.globalAlpha = 0.9 * alpha;
      ctx.strokeStyle = "#ffdddd";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Tower logic: find enemy and apply damage on cooldown
  window.towerUpdate = function (dt) {
    if (!window.enemies) return;
    // towers fire: create projectiles towards chosen targets
    for (const t of towers) {
      t.cooldown -= dt;
      if (t.cooldown > 0) continue;
      let best = null;
      let bestDist = Infinity;
      for (const e of window.enemies) {
        if (e.dead || e.reachedBase) continue; // ignore dead/base enemies
        const dx = e.x - t.x;
        const dy = e.y - t.y;
        const d = Math.hypot(dx, dy);
        if (d <= t.def.range && d < bestDist) {
          best = e;
          bestDist = d;
        }
      }
      if (best) {
        // Apply damage via Enemy API if available; else manual
        const baseDmg = t.def.damage;
        if (typeof best.takeDamage === "function") {
          best.takeDamage(baseDmg);
        } else {
          best.hp -= baseDmg;
          if (best.hp <= 0) best.dead = true;
        }
        // Apply slow effect (ice) to target
        if (
          t.def.slowFactor &&
          t.def.slowDuration &&
          typeof best.applySlow === "function"
        ) {
          best.applySlow(t.def.slowFactor, t.def.slowDuration);
        }
        // Splash damage (AoE)
        if (t.def.aoeRadius && t.def.aoeFactor) {
          const rad = t.def.aoeRadius;
          const extra = Math.max(0, baseDmg * t.def.aoeFactor);
          for (const e of window.enemies) {
            if (e === best || e.dead || e.reachedBase) continue;
            const dx2 = e.x - best.x;
            const dy2 = e.y - best.y;
            if (dx2 * dx2 + dy2 * dy2 <= rad * rad) {
              if (typeof e.takeDamage === "function") e.takeDamage(extra);
              else {
                e.hp -= extra;
                if (e.hp <= 0) e.dead = true;
              }
            }
          }
          impacts.push({
            x: best.x,
            y: best.y,
            radius: rad,
            color: t.def.color,
            duration: 0.35,
            ttl: 0.35,
          });
        }
        // spawn a visual laser
        lasers.push({
          x1: t.x,
          y1: t.y,
          x2: best.x,
          y2: best.y,
          color: t.def.color,
          duration: 0.18,
          ttl: 0.18,
        });
        t.cooldown = 1 / Math.max(0.001, t.def.fireRate);
        // play laser sound (best effort)
        playLaserSound(t.def.id);
      }
    }
    // update centralized effects TTLs
    if (window.updateEffects) window.updateEffects(dt);
  };

  // Enemy attack loop: enemies shoot nearest tower within range
  window.enemyAttackUpdate = function (dt) {
    if (!window.enemies || !towers.length) return;
    for (const e of window.enemies) {
      if (e.dead || e.reachedBase || !e.attackRate || !e.attackRange) continue;
      e.attackCooldown = (e.attackCooldown || 0) - dt;
      if (e.attackCooldown > 0) continue;
      // find nearest tower in range
      let ti = -1;
      let bestD = Infinity;
      for (let i = 0; i < towers.length; i++) {
        const t = towers[i];
        const dx = t.x - e.x;
        const dy = t.y - e.y;
        const d = Math.hypot(dx, dy);
        if (d <= e.attackRange && d < bestD) {
          bestD = d;
          ti = i;
        }
      }
      if (ti >= 0) {
        const t = towers[ti];
        // apply damage immediately (beam visual)
        t.hp = Math.max(0, (t.hp || t.def.hp) - (e.attackDamage || 5));
        enemyBeams.push({
          x1: e.x,
          y1: e.y,
          x2: t.x,
          y2: t.y,
          color: e.color,
          duration: 0.15,
          ttl: 0.15,
        });
        e.attackCooldown = 1 / Math.max(0.001, e.attackRate);
      }
    }
    // remove destroyed towers
    for (let i = towers.length - 1; i >= 0; i--) {
      if ((towers[i].hp || 0) <= 0) towers.splice(i, 1);
    }
  };

  // expose projectiles draw so the main renderer can draw them after map/enemies
  window.drawProjectiles =
    window.drawProjectiles ||
    function (ctx) {
      for (const p of projectiles) {
        ctx.beginPath();
        ctx.fillStyle = p.color || "#fff";
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

  // Function to draw impacts for splash damage
  window.drawImpacts = function (ctx) {
    for (const im of impacts) {
      const progress = 1 - Math.max(0, im.ttl / im.duration);
      const r = Math.max(2, im.radius * progress);
      const alpha = Math.max(0, im.ttl / im.duration);
      ctx.save();
      ctx.globalAlpha = 0.18 * alpha;
      ctx.fillStyle = im.color || "#fff";
      ctx.beginPath();
      ctx.arc(im.x, im.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.8 * alpha;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(im.x, im.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  // API: give coins (for enemy death reward)
  window.addCoins = function (amt) {
    coins += amt;
    updateCoins();
  };
})();
