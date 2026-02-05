// ---------- Элементы ----------
const motivationEl = document.getElementById("motivation");
const emotionEl = document.getElementById("emotion");
const qualityEl = document.getElementById("quality");

const motivationBar = document.getElementById("motivationBar");
const emotionBar = document.getElementById("emotionBar");
const qualityBar = document.getElementById("qualityBar");

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
  },
  {
    text: "Игнорирование сотрудника руководством",
    effect: { motivation: -10, emotion: -10 },
    correctAction: null // нельзя исправить
  }
];

// ---------- Вспомогательные ----------
const clamp = v => Math.max(0, Math.min(100, v));

function normalize() {
  state.motivation = clamp(state.motivation);
  state.emotion = clamp(state.emotion);
  state.quality = clamp(state.quality);
}

function updateQuality() {
  // качество зависит от мотивации и эмоций
  const delta = Math.floor((state.motivation + state.emotion)/20 - 5);
  state.quality += delta;
  normalize();
}

function updateUI() {
  motivationEl.textContent = state.motivation;
  emotionEl.textContent = state.emotion;
  qualityEl.textContent = state.quality;

  motivationBar.value = state.motivation;
  emotionBar.value = state.emotion;
  qualityBar.value = state.quality;

  statusEl.textContent =
    state.emotion < 30
      ? "Сотрудник эмоционально напряжён"
      : state.motivation < 30
      ? "Сотрудник теряет вовлечённость"
      : "Состояние стабильное";

  messageEl.textContent = state.currentEvent ? state.currentEvent.text : "";
}

// ---------- Случайное событие ----------
function triggerEvent() {
  const evt = events[Math.floor(Math.random() * events.length)];
  state.currentEvent = evt;

  // применяем эффект события
  state.motivation += evt.effect.motivation || 0;
  state.emotion += evt.effect.emotion || 0;
  state.quality += evt.effect.quality || 0;

  normalize();
  updateUI();
}

// ---------- Действия игрока ----------
function handleAction(action) {
  if (!state.currentEvent) return;

  const evt = state.currentEvent;

  if (action === evt.correctAction) {
    messageEl.textContent = "Вы выбрали правильное действие! 👍";
    // усиливаем эффект
    state.motivation += 5;
    state.emotion += 5;
    state.quality += 5;
  } else {
    if(evt.correctAction) {
      messageEl.textContent = "Возможно, это было неверное решение. ⚠️";
      state.motivation -= 5;
      state.emotion -= 5;
      state.quality -= 5;
    } else {
      messageEl.textContent = "Событие негативное, не исправить. ⚠️";
    }
  }

  normalize();
  updateQuality();
  updateUI();
  state.currentEvent = null;
}

// ---------- Интерфейс кнопок ----------
function praise() { handleAction("praise"); }
function checkIn() { handleAction("checkIn"); }
function feedback() { handleAction("feedback"); }

// ---------- Запуск ----------
updateUI();
setInterval(triggerEvent, 10000); // новое событие каждые 10 секунд
