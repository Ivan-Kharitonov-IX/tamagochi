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
  currentEvent: null,
  waitingForAction: false,
  eventsCount: 0,
  maxEvents: 8
};

// ---------- Статистика смены ----------
const stats = {
  actions: {
    praise: 0,
    checkIn: 0,
    feedback: 0
  },
  wrongActions: 0,
  lowMotivation: 0,
  lowEmotion: 0
};

// ---------- События ----------
const events = [
  {
    text: "Перегрузка заказами",
    effect: { motivation: -15, emotion: -10 },
    correctAction: "checkIn"
  },
  {
    text: "Неясные инструкции по выдаче",
    effect: { motivation: -10, emotion: -5 },
    correctAction: "feedback"
  },
  {
    text: "Ошибка при выдаче заказа",
    effect: { quality: -10, motivation: -5 },
    correctAction: "feedback"
  },
  {
    text: "Недовольный клиент",
    effect: { emotion: -15 },
    correctAction: "checkIn"
  },
  {
    text: "Похвала от клиента",
    effect: { motivation: 10, emotion: 10 },
    correctAction: "praise"
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
  const delta = Math.floor((state.motivation + state.emotion) / 25 - 4);
  state.quality += delta;
  normalize();
}

// ---------- UI ----------
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

  if (state.motivation < 30) stats.lowMotivation++;
  if (state.emotion < 30) stats.lowEmotion++;
}

// ---------- Событие ----------
function triggerEvent() {
  if (state.eventsCount >= state.maxEvents) {
    endShift();
    return;
  }

  const evt = events[Math.floor(Math.random() * events.length)];
  state.currentEvent = evt;
  state.waitingForAction = true;
  state.eventsCount++;

  state.motivation += evt.effect.motivation || 0;
  state.emotion += evt.effect.emotion || 0;
  state.quality += evt.effect.quality || 0;

  normalize();
  messageEl.textContent = `Событие: ${evt.text}`;
  updateUI();
}

// ---------- Действия ----------
function handleAction(action) {
  if (!state.waitingForAction) return;

  stats.actions[action]++;

  if (action === state.currentEvent.correctAction) {
    state.motivation += 5;
    state.emotion += 5;
    state.quality += 5;
    messageEl.textContent = "Решение оказалось удачным.";
  } else {
    stats.wrongActions++;
    state.motivation -= 5;
    state.emotion -= 5;
    state.quality -= 5;
    messageEl.textContent = "Решение ухудшило состояние сотрудника.";
  }

  normalize();
  updateQuality();
  updateUI();

  state.currentEvent = null;
  state.waitingForAction = false;

  setTimeout(triggerEvent, 4000);
}

// ---------- Итог смены ----------
function endShift() {
  let summary = "Итог смены:\n\n";

  const totalActions =
    stats.actions.praise +
    stats.actions.checkIn +
    stats.actions.feedback;

  if (stats.actions.praise > totalActions / 2) {
    summary += "• Вы часто мотивировали, но могли упускать состояние сотрудника.\n";
  }
  if (stats.actions.checkIn > totalActions / 2) {
    summary += "• Вы уделяли внимание состоянию сотрудника.\n";
  }
  if (stats.actions.feedback > totalActions / 2) {
    summary += "• Вы делали упор на обратную связь и процессы.\n";
  }

  if (stats.wrongActions > 3) {
    summary += "• Часто принимались решения без учёта контекста.\n";
  }

  if (stats.lowEmotion > 2) {
    summary += "• Эмоциональное состояние сотрудника игнорировалось.\n";
  }

  if (stats.lowMotivation > 2) {
    summary += "• Мотивация сотрудника часто была на критическом уровне.\n";
  }

  summary += "\nРекомендация:\n";
  summary += "Сначала стабилизируйте состояние сотрудника, затем работайте с качеством.";

  messageEl.textContent = summary;
}

// ---------- Кнопки ----------
function praise() { handleAction("praise"); }
function checkIn() { handleAction("checkIn"); }
function feedback() { handleAction("feedback"); }

// ---------- Старт ----------
updateUI();
triggerEvent();
