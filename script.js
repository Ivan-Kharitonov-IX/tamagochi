// ---------- Получаем элементы ----------
const motivationEl = document.getElementById("motivation");
const emotionEl = document.getElementById("emotion");
const qualityEl = document.getElementById("quality");
const statusEl = document.getElementById("status");

// ---------- Инициализация состояния ----------
const state = {
  motivation: 60, // стартовое значение
  emotion: 60,
  quality: 60
};

// ---------- Вспомогательные функции ----------
const clamp = (v) => Math.max(0, Math.min(100, v));

function updateUI() {
  motivationEl.textContent = state.motivation;
  emotionEl.textContent = state.emotion;
  qualityEl.textContent = state.quality;

  if (state.emotion < 30) {
    statusEl.textContent = "Сотрудник эмоционально напряжён";
  } else if (state.motivation < 30) {
    statusEl.textContent = "Сотрудник теряет вовлечённость";
  } else {
    statusEl.textContent = "Состояние стабильное";
  }
}

function normalize() {
  state.motivation = clamp(state.motivation);
  state.emotion = clamp(state.emotion);
  state.quality = clamp(state.quality);
}

// ---------- Основной игровой цикл ----------
function tick() {
  // естественное падение параметров
  state.emotion -= 1;

  if (state.emotion < 30) {
    state.motivation -= 2;
  } else {
    state.motivation -= 1;
  }

  // Качество — следствие мотивации и эмоций
  if (state.motivation > 60 && state.emotion > 60) {
    state.quality += 1;
  } else if (state.motivation < 30) {
    state.quality -= 2;
  }

  normalize();
  updateUI();
}

// ---------- Действия игрока ----------
function praise() {
  state.motivation += state.motivation > 80 ? 5 : 10;
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

// ---------- Старт игры ----------
updateUI();             // первый апдейт
setInterval(tick, 5000); // один игровой шаг = 5 секунд
