const STORAGE_KEY = "td2:settings";
const qs = (s, r = document) => r.querySelector(s);

const $settings = {
  difficulty: qs("#difficulty"),
  map: qs("#map"),
  musicVolume: qs("#musicVolume"),
  sfxVolume: qs("#sfxVolume"),
  graphicsQuality: qs("#graphicsQuality"),
  fullscreen: qs("#fullscreen"),
  language: qs("#language"),
  gameSpeed: qs("#gameSpeed"),
};

const $modals = {
  settings: qs("#settings-modal"),
  howto: qs("#howto-modal"),
  credits: qs("#credits-modal"),
};

const $buttons = {
  start: qs("#btn-start"),
  settings: qs("#btn-settings"),
  howto: qs("#btn-howto"),
  credits: qs("#btn-credits"),
  howtoClose: qs("#btn-howto-close"),
  creditsClose: qs("#btn-credits-close"),
  save: qs("#btn-save"),
  cancel: qs("#btn-cancel"),
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const [k, v] of Object.entries(data)) {
      if (!$settings[k]) continue;
      if (typeof $settings[k].checked === "boolean") $settings[k].checked = !!v;
      else $settings[k].value = String(v);
    }
  } catch (e) {
    console.warn("Kon instellingen niet laden:", e);
  }
}

function readSettings() {
  return {
    difficulty: $settings.difficulty?.value,
    map: $settings.map?.value,
    musicVolume: Number($settings.musicVolume?.value || 0),
    sfxVolume: Number($settings.sfxVolume?.value || 0),
    graphicsQuality: $settings.graphicsQuality?.value,
    fullscreen: !!$settings.fullscreen?.checked,
    language: $settings.language?.value,
    gameSpeed: Number($settings.gameSpeed?.value || 1),
  };
}

function saveSettings() {
  const data = readSettings();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
  return data;
}

function wireUI() {
  $buttons.settings?.addEventListener("click", () =>
    $modals.settings.showModal()
  );
  $buttons.howto?.addEventListener("click", () => $modals.howto.showModal());
  $buttons.credits?.addEventListener("click", () =>
    $modals.credits.showModal()
  );
  $buttons.howtoClose?.addEventListener("click", () => $modals.howto.close());
  $buttons.creditsClose?.addEventListener("click", () =>
    $modals.credits.close()
  );

  $buttons.save?.addEventListener("click", (e) => {
    e.preventDefault();
    saveSettings();
    $modals.settings.close();
  });
  $buttons.cancel?.addEventListener("click", (e) => {
    e.preventDefault();
    loadSettings();
    $modals.settings.close();
  });

  $buttons.start?.addEventListener("click", async () => {
    const settings = saveSettings();
    if (settings.fullscreen && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {}
    }
    // Navigeer naar demo pagina (relatief naar project root)
    // Vanaf /towerdefense2/game_setup/ -> ../towersshooting.html
    location.href = "../towersshooting.html";
  });
}

function init() {
  loadSettings();
  wireUI();
}
init();
