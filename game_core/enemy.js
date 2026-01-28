import { PATH as DEFAULT_PATH, direction, distance } from "./path.js";

export const ENEMY_TYPES = {
  // Blauwe grunt (standaard)
  grunt: {
    name: "Grunt",
    hp: 30,
    speed: 60,
    damage: 1,
    color: "#3A86FF",
    bounty: 15,
    attackRate: 0.25, // shots/sec towards towers
    attackRange: 90,  // px
    attackDamage: 6,
    projSpeed: 600,
  },
  // Gele snelle runner voor duidelijke contrast
  fast: {
    name: "Runner",
    hp: 20,
    speed: 120,
    damage: 1,
    color: "#FFD166",
    bounty: 20,
    attackRate: 0.2,
    attackRange: 100,
    attackDamage: 5,
    projSpeed: 700,
  },
  // Rode tank (hoog HP)
  tank: {
    name: "Tank",
    hp: 100,
    speed: 40,
    damage: 3,
    color: "#EF476F",
    bounty: 30,
    attackRate: 0.35,
    attackRange: 110,
    attackDamage: 10,
    projSpeed: 550,
  },
  brute: {
    name: "Brute",
    hp: 220,
    speed: 50,
    damage: 2,
    color: "#8e44ad",
    bounty: 45,
    attackRate: 0.3,
    attackRange: 110,
    attackDamage: 9,
    projSpeed: 600,
  },
  assassin: {
    name: "Assassin",
    hp: 60,
    speed: 180,
    damage: 2,
    color: "#2ecc71",
    bounty: 35,
    attackRate: 0.5,
    attackRange: 120,
    attackDamage: 7,
    projSpeed: 800,
  },
  boss: {
    name: "Boss",
    hp: 1000,
    speed: 35,
    damage: 8,
    color: "#222222",
    bounty: 200,
    attackRate: 0.5,
    attackRange: 140,
    attackDamage: 18,
    projSpeed: 650,
  },
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
    this.bounty = cfg.bounty;
    this.attackRate = cfg.attackRate || 0; // shots/sec
    this.attackRange = cfg.attackRange || 0; // px
    this.attackDamage = cfg.attackDamage || 0;
    this.projSpeed = cfg.projSpeed || 600;
    this.attackCooldown = 0;

    // Kies pad: gebruik globale pathPoints van de map als beschikbaar
    this.path =
      typeof window !== "undefined" &&
      Array.isArray(window.pathPoints) &&
      window.pathPoints.length
        ? window.pathPoints
        : DEFAULT_PATH;
    this.pos = { x: this.path[0].x, y: this.path[0].y };
    this.segment = 0; // moving towards PATH[1]
    this.reachedBase = false;
    this.dead = false;
    // status effects
    this.slowTimer = 0;
    this.slowFactor = 1.0;
  }

  // Getters voor integratie met towers/map code
  get x() {
    return this.pos.x;
  }
  get y() {
    return this.pos.y;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  applySlow(factor, duration) {
    // factor: 0.5 means 50% speed; duration in seconds
    if (factor <= 0 || duration <= 0) return;
    // pick strongest slow currently
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  update(dt) {
    if (this.dead || this.reachedBase) return;
    // update slow timer and reset when expired
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowFactor = 1.0;
      }
    }
    const targetIdx = Math.min(this.segment + 1, this.path.length - 1);
    const target = this.path[targetIdx];
    const dir = direction(this.pos, target);
    const effSpeed = this.speed * (this.slowTimer > 0 ? this.slowFactor : 1.0);
    const step = effSpeed * dt;
    this.pos.x += dir.x * step;
    this.pos.y += dir.y * step;

    if (distance(this.pos, target) < 2) {
      this.segment = targetIdx;
      if (this.segment >= this.path.length - 1) {
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
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fillRect(-12, -16, 24, 4);
    ctx.fillStyle = "#fff";
    const w = Math.max(0, Math.min(24, (this.hp / this.maxHp) * 24));
    ctx.fillRect(-12, -16, w, 4);

    ctx.restore();
  }
}
