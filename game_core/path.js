export const PATH = [
  { x: 40, y: 240 },
  { x: 180, y: 240 },
  { x: 300, y: 140 },
  { x: 460, y: 140 },
  { x: 620, y: 280 },
  { x: 760, y: 280 },
];

export function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

export function direction(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}
