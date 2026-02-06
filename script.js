// ---------- Состояние ----------
const state = {
  motivation: 60,
  emotion: 60,
  quality: 60,
  currentEvent: null,
  waitingForAction: false,
  eventsCount: 0,
  maxEvents: 15
};

// ---------- Статистика ----------
const stats = {
  actions: { praise: 0, checkIn: 0, feedback: 0 },
  wrongActions: 0,
  lowMotivation: 0,
  lowEmotion: 0
};

// ---------- События ----------

// Негативные (основа смены)
const negativeEvents = [
  { text: "Перегрузка заказами", effect: { motivation: -15, emotion: -10 }, correctAction: "checkIn" },
  { text: "Очередь растёт, сотрудник не справляется", effect: { emotion: -15 }, correctAction: "checkIn" },
  { text: "Ошибка при выдаче заказа", effect: { quality: -10, motivation: -5 }, correctAction: "feedback" },
  { text: "Недовольный клиент", effect: { emotion: -15 }, correctAction: "checkIn" },
  { text: "Неясные инструкции по работе", effect: { motivation: -10, emotion: -5 }, correctAction: "feedback" },
  { text: "Конфликт с коллегой", effect: { motivation: -10, emotion: -20 }, correctAction: "checkIn" }
];

// Нейтральные
const neutralEvents = [
  { text: "Обычная рабочая нагрузка", effect: {}, correctAction: null },
  { text: "Смена идёт в штатном режиме", effect: {}, correctAction: null },
  { text: "Небольшая задержка поставки", effect: { emotion: -5 }, correctAction: "checkIn" }
];

// Позитивные (редкие)
const positiveEvents = [
  { text: "Похвала от клиента", effect: { motivation: 10, emotion: 10 }, correctAction: "praise" },
  { text: "Смена прошла без ошибок", effect: { quality: 10, emotion: 5 }, correctAction: "praise" }
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

// ---------- Выбор события с весами ----------
function getRandomEvent() {
  const roll = Math.random();

  if (roll < 0.7) {
    return negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
  } else if (roll < 0.9) {
    return neutralEvents[Math.floor(Math.random() * neutralEvents.length)];
  } else {
    return positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
  }
}

// ---------- UI ----------
function updateUI() {
  document.getElementById("motivation").textContent = state.motivation;
  document.getElementById("emotion").textContent = state.emotion;
  document.getElementById("quality").textContent = state.quality;

  document.getElementById("motivationBar").value = state.motivation;
  document.getElementById("emotionBar").value = state.emotion;
  document.getElementById("qualityBar").value = state.quality;

  if (state.motivation < 30) stats.lowMotivation++;
  if (state.emotion < 30) stats.lowEmotion++;
}

// ---------- Событие ----------
function triggerEvent() {
  if (state.eventsCount >= state.maxEvents) {
    endShift();
    return;
  }

  const evt = getRandomEvent();
  state.currentEvent = evt;
  state.waitingForAction = true;
  state.eventsCount++;

  state.motivation += evt.effect.motivation || 0;
  state.emotion += evt.effect.emotion || 0;
  state.quality += evt.effect.quality || 0;

  normalize();
  document.getElementById("message").textContent = `Событие: ${evt.text}`;
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
    document.getElementById("message").textContent = "Решение помогло стабилизировать ситуацию.";
  } else {
    if (state.currentEvent.correctAction) {
      stats.wrongActions++;
      state.motivation -= 5;
      state.emotion -= 5;
      state.quality -= 5;
      document.getElementById("message").textContent = "Решение усугубило ситуацию.";
    } else {
      document.getElementById("message").textContent = "Ситуация не требовала вмешательства.";
    }
  }

  normalize();
  updateQuality();
  updateUI();

  state.currentEvent = null;
  state.waitingForAction = false;
  setTimeout(triggerEvent, 3500);
}

// ---------- Итог смены ----------
function endShift() {
  let summary = "Итог смены:\n\n";

  if (stats.wrongActions > 4)
    summary += "• Часто принимались решения без учёта контекста.\n";

  if (stats.lowEmotion > 3)
    summary += "• Эмоциональное состояние сотрудника игнорировалось.\n";

  if (stats.lowMotivation > 3)
    summary += "• Мотивация сотрудника часто была на критическом уровне.\n";

  summary += "\nРекомендация:\nСначала стабилизируйте состояние сотрудника, затем работайте с качеством.";

  document.getElementById("message").textContent = summary;
}

// ---------- Кнопки ----------
function praise() { handleAction("praise"); }
function checkIn() { handleAction("checkIn"); }
function feedback() { handleAction("feedback"); }

// ---------- Старт ----------
updateUI();
triggerEvent();
