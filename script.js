// ---------- Получаем элементы ----------
const motivation = document.getElementById("motivation");
const emotion = document.getElementById("emotion");
const quality = document.getElementById("quality");
const status = document.getElementById("status");

// ---------- Состояние ----------
const state = {
  motivation: 60,
  emotion: 60,
  quality: 60,
  lastUpdate: Date.now()
};

// ---------- Вспомогательные функции ----------
const clamp = v => Math.max(0, Math.min(100, v));

function updateUI() {
  motivation.textContent = state.motivation;
  emotion.textContent = state.emotion;
  quality.textContent = state.quality;

  if (state.emotion < 30) {
    status.textContent = "Сотрудник эмоционально напряжён";
  } else if (state.motivation < 30) {
    status.textContent = "Сотрудник теряет вовлечённость";
  } else {
    status.textContent = "Состояние стабильное";
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

  // Качество — следствие
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

// ---------- Запуск ----------
updateUI();
setInterval(tick, 5000); // один игровой шаг = 5 секунд
