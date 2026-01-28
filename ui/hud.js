// HUD module: updates header labels
(function(){
  function formatTime(t){
    const m = Math.floor(t/60), s = Math.floor(t%60);
    return String(m).padStart(2,'0')+":"+String(s).padStart(2,'0');
  }
  window.hudUpdate = function(dt){
    const timerEl = document.getElementById('timerLabel');
    if (timerEl) {
      const fmt = (window.formatTime ? window.formatTime : formatTime)(window.elapsedTime||0);
      timerEl.textContent = fmt;
    }
    const waveLbl = document.getElementById('waveLabel');
    if (waveLbl && window.waveManager) {
      waveLbl.textContent = window.waveManager.waveIndex >= 0 ? window.waveManager.waveIndex + 1 : 0;
    }
    const enemyLbl = document.getElementById('enemyCount');
    if (enemyLbl) enemyLbl.textContent = (window.enemies && window.enemies.length) ? window.enemies.length : 0;
    const coinsLbl = document.getElementById('coinsLabel');
    const coinCountEl = document.getElementById('coinCount');
    if (coinsLbl && coinCountEl) coinsLbl.textContent = coinCountEl.textContent;
    const nextWaveEl = document.getElementById('nextWaveLabel');
    if (nextWaveEl) {
      const hasNext = window.waveManager && typeof window.waveManager.hasNext==='function' && window.waveManager.hasNext();
      if (hasNext && typeof window.waveCountdown==='number' && window.waveCountdown>=0) {
        nextWaveEl.textContent = `Next wave in ${Math.max(0, window.waveCountdown).toFixed(1)}s`;
      } else {
        nextWaveEl.textContent = '';
      }
    }
  };
})();
