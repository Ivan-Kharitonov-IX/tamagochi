// ---------- Элементы ----------
const motivationEl = document.getElementById("motivation");
const emotionEl = document.getElementById("emotion");
const qualityEl = document.getElementById("quality");
const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");

// ---------- Состояние ----------
const state = {
  motivation: 60,
  emotion: 60,
  quality: 60,
  currentEvent: null
};

// ---------- События ----------
const events = [
  {
    text: "Сотрудник перегружен задачами — мотивация и эмоциональный фон снизились",
    effect: { motivation: -15, emotion: -10 },
    correctAction: "checkIn"
  },
  {
    text: "Сотрудник начал новый интересный проект",
    effect: { motivation: 10, emotion: 10 },
    correctAction: "praise"
  },
  {
    text: "Конфликт в команде",
    effect: { motivation: -10, emotion: -20 },
    correctAction: "checkIn"
  },
  {
    text: "Отличный результат проекта",
    effect: { quality: 10, emotion: 5 },
    correctAction: "feedback"
  }
];

// ---------- Вспомогательные ----------
const clamp = v => Math.max(0, Math.min(100, v));

function normalize() {
  state.motivation = clamp(state.motivation);
  state.emotion = clamp(state.emotion);
  state.quality = clamp(state.quality);
}

function updateUI() {
  motivationEl.textContent = state.motivation;
  emotionEl.textContent = state.emotion;
  qualityEl.textContent = state.quality;

  statusEl.textContent =
    state.emotion < 30
      ? "Сотрудник эмоционально напряжён"
      : state.motivation < 30
      ? "Сотрудник теряет вовлечённость"
      : "Состояние стабильное";

  // текст текущего события или подсказка
  messageEl.textContent = state.currentEvent ? state.currentEvent.text : "";
}

// ---------- Случайное событие ----------
function triggerEvent() {
  const evt = events[Math.floor(Math.random() * events.length)];
  state.currentEvent = evt;
  // сразу применяем эффект
  state.motivation += evt.effect.motivation || 0;
  state.emotion += evt.effect.emotion || 0;
  state.quality += evt.effect.quality || 0;
  normalize();
  updateUI();
}

// ---------- Действия игрока ----------
function handleAction(action) {
  if (!state.currentEvent) return;

  if (action === state.currentEvent.correctAction) {
    messageEl.textContent = "Вы выбрали правильное действие! 👍";
    state.motivation += 5;
    state.emotion += 5;
    state.quality += 5;
  } else {
    messageEl.textContent = "Возможно, это было неверное решение. ⚠️";
    state.motivation -= 5;
    state.emotion -= 5;
    state.quality -= 5;
  }

  normalize();
  updateUI();
  state.currentEvent = null;
}

// ---------- Интерфейс кнопок ----------
function praise() { handleAction("praise"); }
function checkIn() { handleAction("checkIn"); }
function feedback() { handleAction("feedback"); }

// ---------- Запуск ----------
updateUI();
setInterval(triggerEvent, 10000); // событие каждые 10 секунд
