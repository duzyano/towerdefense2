import { Enemy, ENEMY_TYPES } from './enemy.js';

// Progressive wave plan: increases count, speed, and introduces tougher types.
export const WAVES = [
  // Early game
  { count: 8, type: 'grunt', interval: 0.9 },
  { count: 10, type: 'grunt', interval: 0.85 },
  { count: 6, type: 'fast', interval: 0.75 },
  { count: 12, type: 'grunt', interval: 0.8 },
  // Mid game
  { count: 8, type: 'tank', interval: 1.15 },
  { count: 10, type: 'fast', interval: 0.65 },
  { count: 12, type: 'grunt', interval: 0.75 },
  { count: 8, type: 'brute', interval: 1.0 },
  // Late game
  { count: 12, type: 'fast', interval: 0.6 },
  { count: 10, type: 'tank', interval: 1.0 },
  { count: 14, type: 'assassin', interval: 0.55 },
  { count: 18, type: 'grunt', interval: 0.7 },
  // Pre-boss pressure
  { count: 10, type: 'brute', interval: 0.9 },
  { count: 16, type: 'fast', interval: 0.55 },
  // Boss wave (single strong enemy)
  { count: 1, type: 'boss', interval: 0.1 },
];

export class WaveManager {
  constructor() {
    this.waveIndex = -1;
    this.spawning = false;
    this.spawnTimer = 0;
    this.spawned = 0;
    this.currentWave = null;
  }

  hasNext() {
    return this.waveIndex + 1 < WAVES.length;
  }

  startNextWave() {
    if (!this.hasNext()) return false;
    this.waveIndex++;
    this.currentWave = WAVES[this.waveIndex];
    this.spawning = true;
    this.spawnTimer = 0;
    this.spawned = 0;
    return true;
  }

  update(dt, enemies) {
    if (!this.spawning || !this.currentWave) return;
    this.spawnTimer += dt;
    const { interval, count, type } = this.currentWave;
    if (this.spawnTimer >= interval && this.spawned < count) {
      this.spawnTimer = 0;
      enemies.push(new Enemy(type));
      this.spawned++;
    }
    if (this.spawned >= count) {
      this.spawning = false;
    }
  }
}
