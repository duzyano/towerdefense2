// Visual effects module: lasers, splash impacts, enemy beams
(function(){
  const effects = {
    lasers: [],
    impacts: [],
    enemyBeams: [],
    update(dt) {
      for (let i = this.lasers.length - 1; i >= 0; i--) {
        this.lasers[i].ttl -= dt;
        if (this.lasers[i].ttl <= 0) this.lasers.splice(i, 1);
      }
      for (let i = this.impacts.length - 1; i >= 0; i--) {
        this.impacts[i].ttl -= dt;
        if (this.impacts[i].ttl <= 0) this.impacts.splice(i, 1);
      }
      for (let i = this.enemyBeams.length - 1; i >= 0; i--) {
        this.enemyBeams[i].ttl -= dt;
        if (this.enemyBeams[i].ttl <= 0) this.enemyBeams.splice(i, 1);
      }
    },
    drawLasers(ctx) {
      for (const l of this.lasers) {
        const alpha = Math.max(0, l.ttl / l.duration);
        // glow layer
        ctx.save();
        ctx.globalAlpha = 0.6 * alpha;
        ctx.strokeStyle = l.color || "#fff";
        ctx.lineWidth = 10;
        ctx.shadowColor = l.color || "#fff";
        ctx.shadowBlur = 18 * alpha;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.restore();

        // core bright line
        ctx.save();
        ctx.globalAlpha = 0.9 * alpha;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.restore();
      }
    },
    drawImpacts(ctx) {
      for (const im of this.impacts) {
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
    },
    drawEnemyBeams(ctx) {
      for (const b of this.enemyBeams) {
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
    }
  };
  window.effects = effects;
  // convenience aliases
  window.drawLasers = (ctx)=>effects.drawLasers(ctx);
  window.drawImpacts = (ctx)=>effects.drawImpacts(ctx);
  window.drawEnemyBeams = (ctx)=>effects.drawEnemyBeams(ctx);
  window.updateEffects = (dt)=>effects.update(dt);
})();
