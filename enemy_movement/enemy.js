(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const path = [
    { x: 40, y: 40 },
    { x: 760, y: 40 },
    { x: 760, y: 440 },
    { x: 40, y: 440 },
    { x: 40, y: 240 },
    { x: 760, y: 240 },
  ];
  const gridSize = 40;
  const enemy = { x: path[0].x, y: path[0].y, r: 10, speed: 120, segment: 0 };
  let last = performance.now();
  function update(dt) {
    const targetIndex = Math.min(enemy.segment + 1, path.length - 1);
    const sx = enemy.x,
      sy = enemy.y;
    const tx = path[targetIndex].x,
      ty = path[targetIndex].y;
    const dx = tx - sx,
      dy = ty - sy;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      const step = Math.min(enemy.speed * dt, dist);
      enemy.x = sx + (dx / dist) * step;
      enemy.y = sy + (dy / dist) * step;
    }
    if (Math.hypot(tx - enemy.x, ty - enemy.y) < 0.5) {
      enemy.segment = (enemy.segment + 1) % (path.length - 1);
    }
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2a2d36";
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
    ctx.fill();
  }
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  if (canvas && ctx) {
    requestAnimationFrame(loop);
  }
})();
