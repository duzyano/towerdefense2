import { PATH, direction, distance } from './path.js';

export const ENEMY_TYPES = {
  // Blauwe grunt (standaard)
  grunt: { name: 'Grunt', hp: 30, speed: 60, damage: 1, color: '#3A86FF' },
  // Gele snelle runner voor duidelijke contrast
  fast:  { name: 'Runner', hp: 20, speed: 120, damage: 1, color: '#FFD166' },
  // Rode tank (hoog HP)
  tank:  { name: 'Tank', hp: 100, speed: 40, damage: 3, color: '#EF476F' },
};

export class Enemy {
  constructor(typeKey) {
    const cfg = ENEMY_TYPES[typeKey] || ENEMY_TYPES.grunt;
    this.type = typeKey;
    this.name = cfg.name;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.speed = cfg.speed; // px/sec
    this.damage = cfg.damage;
    this.color = cfg.color;

    this.pos = { x: PATH[0].x, y: PATH[0].y };
    this.segment = 0; // moving towards PATH[1]
    this.reachedBase = false;
    this.dead = false;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  update(dt) {
    if (this.dead || this.reachedBase) return;
    const targetIdx = Math.min(this.segment + 1, PATH.length - 1);
    const target = PATH[targetIdx];
    const dir = direction(this.pos, target);
    const step = this.speed * dt;
    this.pos.x += dir.x * step;
    this.pos.y += dir.y * step;

   
    if (distance(this.pos, target) < 2) {
      this.segment = targetIdx;
      if (this.segment >= PATH.length - 1) {
        this.reachedBase = true;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    // body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // hp bar
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(-12, -16, 24, 4);
    ctx.fillStyle = '#fff';
    const w = Math.max(0, Math.min(24, (this.hp / this.maxHp) * 24));
    ctx.fillRect(-12, -16, w, 4);

    ctx.restore();
  }
}
