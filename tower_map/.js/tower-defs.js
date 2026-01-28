// Central tower definitions
(function(){
  window.TOWER_DEFS = {
    light: { id: "light", name: "Light Tower", cost: 50, range: 80, color: "#66c2ff", damage: 6, fireRate: 1, projSpeed: 400, hp: 90 },
    heavy: { id: "heavy", name: "Heavy Tower", cost: 120, range: 120, color: "#ff9f66", damage: 20, fireRate: 0.6, projSpeed: 300, hp: 140 },
    candy: { id: "candy", name: "Candy Tower", cost: 75, range: 100, color: "#ff69b4", damage: 12, fireRate: 0.9, projSpeed: 350, hp: 100 },
    frost: { id: "frost", name: "Frost Tower", cost: 100, range: 110, color: "#00ced1", damage: 15, fireRate: 0.8, projSpeed: 320, hp: 110 },
    star:  { id: "star",  name: "Star Tower",  cost: 150, range: 140, color: "#ffd700", damage: 25, fireRate: 0.5, projSpeed: 280, hp: 130 },
    sniper:{ id: "sniper",name: "Sniper Tower",cost: 180, range: 220, color: "#9ccaff", damage: 60, fireRate: 0.3, projSpeed: 500, hp: 100 },
    splash:{ id: "splash",name: "Splash Tower",cost: 140, range: 110, color: "#ffcc88", damage: 18, fireRate: 0.7, projSpeed: 380, aoeRadius: 40, aoeFactor: 0.5, hp: 110 },
    ice:   { id: "ice",   name: "Ice Tower",   cost: 110, range: 120, color: "#8be9fd", damage: 8, fireRate: 0.8, projSpeed: 320, slowFactor: 0.5, slowDuration: 1.4, hp: 100 },
  };
})();
