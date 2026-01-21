(() => {
	// Simple tower shop + placement for your tower defense game
	const canvas = document.getElementById('mapCanvas');
	if (!canvas) return; // if no canvas on page, do nothing
	const rect = canvas.getBoundingClientRect();

	let coins = 200;
	let selectedType = null;
	const towers = [];

	const defs = {
		light: { id: 'light', name: 'Light Tower', cost: 50, range: 80, color: '#66c2ff', damage: 6, fireRate: 1, projSpeed: 400 },
		heavy: { id: 'heavy', name: 'Heavy Tower', cost: 120, range: 120, color: '#ff9f66', damage: 20, fireRate: 0.6, projSpeed: 300 },
		candy: { id: 'candy', name: 'Candy Tower', cost: 75, range: 100, color: '#ff69b4', damage: 12, fireRate: 0.9, projSpeed: 350 },
		frost: { id: 'frost', name: 'Frost Tower', cost: 100, range: 110, color: '#00ced1', damage: 15, fireRate: 0.8, projSpeed: 320 },
		star: { id: 'star', name: 'Star Tower', cost: 150, range: 140, color: '#ffd700', damage: 25, fireRate: 0.5, projSpeed: 280 }
	};

	// Build menu (right side)
	const menu = document.createElement('div');
	menu.id = 'towerMenu';
	menu.className = 'tower-menu';
	menu.innerHTML = `
		<div class="coin">Coins: <span id="coinCount">${coins}</span></div>
		<div class="lives">Lives: <span id="liveCount">3</span></div>
		<div class="shop">
			<div class="tower-btn" data-type="light">Light<br><span class="cost">50</span></div>
			<div class="tower-btn" data-type="heavy">Heavy<br><span class="cost">120</span></div>
			<div class="tower-btn" data-type="candy">Candy<br><span class="cost">75</span></div>
			<div class="tower-btn" data-type="frost">Frost<br><span class="cost">100</span></div>
			<div class="tower-btn" data-type="star">Star<br><span class="cost">150</span></div>
		</div>
		<div class="info">Select a tower then click the map to place.</div>
	`;
	document.body.appendChild(menu);

	function updateCoins() {
		const el = document.getElementById('coinCount');
		if (el) el.textContent = coins;
		// also sync lives display
		if (window.lives !== undefined) {
			const liveEl = document.getElementById('liveCount');
			if (liveEl) liveEl.textContent = window.lives;
		}
	}

	menu.querySelectorAll('.tower-btn').forEach(b => {
		b.addEventListener('click', () => {
			const t = b.dataset.type;
			selectedType = defs[t];
			menu.querySelectorAll('.tower-btn').forEach(x => x.classList.remove('selected'));
			b.classList.add('selected');
		});
	});

	canvas.addEventListener('click', (ev) => {
		if (!selectedType) return;
		const r = canvas.getBoundingClientRect();
		const x = ev.clientX - r.left;
		const y = ev.clientY - r.top;
		// prevent placing on path
		if (window.isOnPath && window.isOnPath(x, y)) {
			alert('Je kunt geen toren op het pad plaatsen. Kies een andere plaats.');
			return;
		}
		if (coins < selectedType.cost) {
			alert('Niet genoeg munten');
			return;
		}
		coins -= selectedType.cost;
		towers.push({ x, y, def: selectedType, cooldown: 0 });
		updateCoins();
		selectedType = null;
		menu.querySelectorAll('.tower-btn').forEach(x => x.classList.remove('selected'));
	});

	// Tower animation time
	let animTime = 0;

	// Expose draw function so map rendering can call it after drawing the map
	window.drawTowers = function (ctx) {
		animTime += 0.016; // ~60fps increment
		for (const t of towers) {
			const size = t.def.id === 'star' ? 16 : t.def.id === 'heavy' ? 14 : 12;
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
			ctx.fillStyle = '#000';
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
			ctx.fillStyle = 'rgba(255,255,255,0.3)';
			ctx.beginPath();
			ctx.arc(t.x - size * 0.4, t.y - size * 0.4, size * 0.4, 0, Math.PI * 2);
			ctx.fill();

			// border
			ctx.strokeStyle = 'rgba(0,0,0,0.2)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();

			// decoration based on type with rotation
			const rot = animTime * (t.def.id === 'candy' ? 2 : t.def.id === 'frost' ? 1 : 0.5);
			if (t.def.id === 'star') {
				drawStar(ctx, t.x, t.y - size * 0.3, 6, 3, rot);
			} else if (t.def.id === 'candy') {
				ctx.save();
				ctx.translate(t.x, t.y);
				ctx.rotate(rot);
				ctx.fillStyle = '#ff1744';
				ctx.fillRect(-5, -3, 10, 6);
				ctx.fillStyle = '#fff';
				ctx.fillRect(-2, -3, 4, 6);
				ctx.restore();
			} else if (t.def.id === 'frost') {
				drawSnowflake(ctx, t.x, t.y, 7, rot);
			} else if (t.def.id === 'light') {
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
			} else if (t.def.id === 'heavy') {
				// small armor lines
				ctx.save();
				ctx.strokeStyle = 'rgba(0,0,0,0.3)';
				ctx.lineWidth = 1;
				for (let i = -1; i <= 1; i++) {
					ctx.beginPath();
					ctx.moveTo(t.x - size, t.y + i * 4);
					ctx.lineTo(t.x + size, t.y + i * 4);
					ctx.stroke();
				}
				ctx.restore();
			}

			// range ring (faint)
			ctx.save();
			ctx.globalAlpha = 0.08;
			ctx.strokeStyle = t.def.color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(t.x, t.y, t.def.range, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
	};

	function drawStar(ctx, x, y, outer, inner, rotation) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotation);
		ctx.fillStyle = '#ffd700';
		ctx.shadowColor = 'rgba(255,215,0,0.6)';
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
		ctx.strokeStyle = '#ffed4e';
		ctx.lineWidth = 0.5;
		ctx.stroke();
		ctx.restore();
	}

	function drawSnowflake(ctx, x, y, size, rotation) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotation);
		ctx.strokeStyle = '#00ced1';
		ctx.lineWidth = 1.5;
		ctx.lineCap = 'round';
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

	// lasers (visual only) - immediate damage applied when fired
	const lasers = [];

	// simple WebAudio laser sound (synth)
	let audioCtx = null;
	function playLaserSound(type) {
		try {
			if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			const t0 = audioCtx.currentTime;
			const o = audioCtx.createOscillator();
			const g = audioCtx.createGain();
			o.type = 'sawtooth';
			// frequency by type
			o.frequency.setValueAtTime(type === 'heavy' ? 440 : 720, t0);
			g.gain.setValueAtTime(0, t0);
			g.gain.linearRampToValueAtTime(0.12, t0 + 0.01);
			g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
			o.connect(g);
			g.connect(audioCtx.destination);
			o.start(t0);
			o.stop(t0 + 0.13);
		} catch (e) {
			// ignore audio errors (e.g., autoplay restrictions)
			console.warn('Audio unavailable', e);
		}
	}

	// draw lasers as fading lines with glow
	window.drawLasers = function (ctx) {
		for (const l of lasers) {
			const alpha = Math.max(0, l.ttl / l.duration);
			// glow layer
			ctx.save();
			ctx.globalAlpha = 0.6 * alpha;
			ctx.strokeStyle = l.color || '#fff';
			ctx.lineWidth = 10;
			ctx.shadowColor = l.color || '#fff';
			ctx.shadowBlur = 18 * alpha;
			ctx.beginPath();
			ctx.moveTo(l.x1, l.y1);
			ctx.lineTo(l.x2, l.y2);
			ctx.stroke();
			ctx.restore();

			// core bright line
			ctx.save();
			ctx.globalAlpha = 0.9 * alpha;
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(l.x1, l.y1);
			ctx.lineTo(l.x2, l.y2);
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
				const dx = e.x - t.x;
				const dy = e.y - t.y;
				const d = Math.hypot(dx, dy);
				if (d <= t.def.range && d < bestDist) {
					best = e;
					bestDist = d;
				}
			}
			if (best) {
				// immediate laser hit: apply damage and spawn a visual laser
				best.hp -= t.def.damage;
				lasers.push({ x1: t.x, y1: t.y, x2: best.x, y2: best.y, color: t.def.color, duration: 0.18, ttl: 0.18 });
				t.cooldown = 1 / Math.max(0.001, t.def.fireRate);
				// play laser sound (best effort)
				playLaserSound(t.def.id);
			}
		}
		// update lasers TTL and remove expired
		for (let i = lasers.length - 1; i >= 0; i--) {
			lasers[i].ttl -= dt;
			if (lasers[i].ttl <= 0) lasers.splice(i, 1);
		}
	};

	// expose projectiles draw so the main renderer can draw them after map/enemies
	window.drawProjectiles = window.drawProjectiles || function(ctx){
		for (const p of projectiles) {
			ctx.beginPath();
			ctx.fillStyle = p.color || '#fff';
			ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
			ctx.fill();
		}
	};

	// API: give coins (for enemy death reward)
	window.addCoins = function (amt) {
		coins += amt;
		updateCoins();
	};

})();
