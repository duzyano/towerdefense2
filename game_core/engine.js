import { PATH } from "./path.js";
import { WaveManager } from "./waves.js";

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.enemies = [];
    this.waveManager = new WaveManager();
    this.baseHP = 20; // base health
    this.last = performance.now();
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000); // cap 50ms
    this.last = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    this.waveManager.update(dt, this.enemies);
    for (const e of this.enemies) {
      e.update(dt);
      if (e.reachedBase && !e.dead) {
        this.baseHP -= e.damage;
        e.dead = true;
      }
    }
    // remove dead
    this.enemies = this.enemies.filter((e) => !e.dead);
  }

  draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // path
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
    ctx.stroke();

    // base
    ctx.fillStyle = "#fff";
    ctx.fillRect(canvas.width - 24, PATH[PATH.length - 1].y - 12, 12, 24);

    // enemies
    for (const e of this.enemies) e.draw(ctx);

    // HUD
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "14px Segoe UI, Roboto, sans-serif";
    ctx.fillText(
      `Wave: ${Math.max(0, this.waveManager.waveIndex + 1)}/${5}`,
      10,
      20
    );
    ctx.fillText(`Base HP: ${this.baseHP}`, 10, 40);
    ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 60);
  }
}
