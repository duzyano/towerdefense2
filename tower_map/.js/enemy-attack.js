// Enemy attack module: enemies shoot nearest tower
(function(){
  window.enemyAttackUpdate = function(dt){
    const towers = window.towers || [];
    const enemies = window.enemies || [];
    const beams = window.effects && window.effects.enemyBeams ? window.effects.enemyBeams : [];
    if (!enemies.length || !towers.length) return;
    for (const e of enemies) {
      if (e.dead || e.reachedBase || !e.attackRate || !e.attackRange) continue;
      e.attackCooldown = (e.attackCooldown || 0) - dt;
      if (e.attackCooldown > 0) continue;
      // find nearest tower in range
      let ti = -1; let bestD = Infinity;
      for (let i = 0; i < towers.length; i++) {
        const t = towers[i];
        const dx = t.x - e.x; const dy = t.y - e.y; const d = Math.hypot(dx, dy);
        if (d <= e.attackRange && d < bestD) { bestD = d; ti = i; }
      }
      if (ti >= 0) {
        const t = towers[ti];
        t.hp = Math.max(0, (t.hp || t.def.hp) - (e.attackDamage || 5));
        beams.push({ x1: e.x, y1: e.y, x2: t.x, y2: t.y, color: e.color, duration: 0.15, ttl: 0.15 });
        e.attackCooldown = 1 / Math.max(0.001, e.attackRate);
      }
    }
    // remove destroyed towers
    for (let i = towers.length - 1; i >= 0; i--) {
      if ((towers[i].hp || 0) <= 0) towers.splice(i, 1);
    }
  };
})();
