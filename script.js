const state = {
  motivation: 60,
  emotion: 60,
  quality: 60,
  lastUpdate: Date.now()
};

// ---------- utils ----------
const clamp = v => Math.max(0, Math.min(100, v));

function updateUI() {
  motivation.textContent = state.motivation;
  emotion.textContent = state.emotion;
  quality.textContent = state.quality;

  status.textContent =
    state.emotion < 30
      ? "Сотрудник эмоционально напряжён"
      : state.motivation < 30
      ? "Сотрудник теряет вовлечённость"
      : "Состояние стабильное";
}

// ---------- game loop ----------
function tick() {
  state.emotion -= 1;

  if (state.emotion < 30) {
    state.motivation -= 2;
  } else {
    state.motivation -= 1;
  }

  // качество — следствие
  if (state.motivation > 60 && state.emotion > 60) {
    state.quality += 1;
  } else if (state.motivation < 30) {
    state.quality -= 2;
  }

  normalize();
  updateUI();
}

function normalize() {
  state.motivation = clamp(state.motivation);
  state.emotion = clamp(state.emotion);
  state.quality = clamp(state.quality);
}

// ---------- actions ----------
function praise() {
  const bonus = state.motivation > 80 ? 5 : 10;
  state.motivation += bonus;
  state.emotion += 10;
  normalize();
  updateUI();
}

function checkIn() {
  state.emotion += 15;
  normalize();
  updateUI();
}

function feedback() {
  if (state.emotion >= 50) {
    state.quality += 10;
  } else {
    state.motivation -= 10;
  }
  normalize();
  updateUI();
}

// ---------- start ----------
updateUI();
setInterval(tick, 5000);

