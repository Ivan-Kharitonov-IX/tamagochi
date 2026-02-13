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

// ---------- Спрайты ----------
const sprites = {
  happy: "assets/happy.png",
  neutral: "assets/neutral.png",
  stressed: "assets/stressed.png",
  angry: "assets/angry.png",
  tired: "assets/tired.png"
};

// ---------- Определение состояния ----------
function getCharacterState() {
  if (state.motivation < 30) return "tired";
  if (state.emotion < 30) return "angry";
  if (state.emotion < 45) return "stressed";
  if (state.motivation > 75 && state.emotion > 70) return "happy";
  return "neutral";
}

function updateCharacterSprite() {
  const current = getCharacterState();
  document.getElementById("characterSprite").src = sprites[current];
}

// ---------- Статистика ----------
const stats = {
  actions: { praise: 0, checkIn: 0, feedback: 0 },
  wrongActions: 0,
  lowMotivation: 0,
  lowEmotion: 0
};

// ---------- События ----------
const negativeEvents = [
  { text: "Перегрузка заказами", effect: { motivation: -15, emotion: -10 }, correctAction: "checkIn" },
  { text: "Очередь растёт, сотрудник не справляется", effect: { emotion: -15 }, correctAction: "checkIn" },
  { text: "Ошибка при выдаче заказа", effect: { quality: -10, motivation: -5 }, correctAction: "feedback" },
  { text: "Недовольный клиент", effect: { emotion: -15 }, correctAction: "checkIn" },
  { text: "Неясные инструкции по работе", effect: { motivation: -10, emotion: -5 }, correctAction: "feedback" },
  { text: "Конфликт с коллегой", effect: { motivation: -10, emotion: -20 }, correctAction: "checkIn" }
];

const neutralEvents = [
  { text: "Обычная рабочая нагрузка", effect: {}, correctAction: null },
  { text: "Смена идёт в штатном режиме", effect: {}, correctAction: null },
  { text: "Небольшая задержка поставки", effect: { emotion: -5 }, correctAction: "checkIn" }
];

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

// ---------- Выбор события ----------
function getRandomEvent() {
  const roll = Math.random();
  if (roll < 0.7) return negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
  if (roll < 0.9) return neutralEvents[Math.floor(Math.random() * neutralEvents.length)];
  return positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
}

// ---------- UI ----------
function updateUI() {
  document.getElementById("motivation").textContent = state.motivation;
  document.getElementById("emotion").textContent = state.emotion;
  document.getElementById("quality").textContent = state.quality;

  document.getElementById("motivationBar").value = state.motivation;
  document.getElementById("emotionBar").value = state.emotion;
  document.getElementById("qualityBar").value = state.quality;

  updateCharacterSprite();
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
  } else if (state.currentEvent.correctAction) {
    stats.wrongActions++;
    state.motivation -= 5;
    state.emotion -= 5;
    state.quality -= 5;
    document.getElementById("message").textContent = "Решение усугубило ситуацию.";
  } else {
    document.getElementById("message").textContent = "Ситуация не требовала вмешательства.";
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
  document.getElementById("message").textContent =
    "Смена завершена. Проанализируйте принятые решения и влияние на состояние сотрудника.";
}

// ---------- Кнопки ----------
function praise() { handleAction("praise"); }
function checkIn() { handleAction("checkIn"); }
function feedback() { handleAction("feedback"); }

// ---------- Старт ----------
updateUI();
triggerEvent();
