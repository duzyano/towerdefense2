import { Enemy, ENEMY_TYPES } from './enemy.js';

export const WAVES = [
  { count: 8, type: 'grunt', interval: 0.9 },
  { count: 6, type: 'fast', interval: 0.7 },
  { count: 10, type: 'grunt', interval: 0.8 },
  { count: 4, type: 'tank', interval: 1.2 },
  { count: 10, type: 'fast', interval: 0.6 },
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
