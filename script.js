const state = {
  motivation: 60,
  emotion: 60,
  quality: 60,
  currentEvent: null,
  waitingForAction: false,
  eventsCount: 0,
  maxEvents: 15,
  gameOver: false
};

const sprites = {
  happy: "assets/happy.png",
  neutral: "assets/neutral.png",
  stressed: "assets/stressed.png",
  angry: "assets/angry.png",
  tired: "assets/tired.png"
};

const stats = {
  actions: { praise: 0, checkIn: 0, feedback: 0 },
  wrongActions: 0
};

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

const elements = {
  motivation: document.getElementById("motivation"),
  emotion: document.getElementById("emotion"),
  quality: document.getElementById("quality"),
  motivationBar: document.getElementById("motivationBar"),
  emotionBar: document.getElementById("emotionBar"),
  qualityBar: document.getElementById("qualityBar"),
  message: document.getElementById("message"),
  status: document.getElementById("status"),
  characterSprite: document.getElementById("characterSprite"),
  praiseBtn: document.getElementById("praiseBtn"),
  checkInBtn: document.getElementById("checkInBtn"),
  feedbackBtn: document.getElementById("feedbackBtn")
};

const clamp = (value) => Math.max(0, Math.min(100, value));

function normalize() {
  state.motivation = clamp(state.motivation);
  state.emotion = clamp(state.emotion);
  state.quality = clamp(state.quality);
}

function getCharacterState() {
  if (state.motivation < 30) return "tired";
  if (state.emotion < 30) return "angry";
  if (state.emotion < 45) return "stressed";
  if (state.motivation > 75 && state.emotion > 70) return "happy";
  return "neutral";
}

function updateCharacterSprite() {
  elements.characterSprite.src = sprites[getCharacterState()] || sprites.neutral;
}

function updateQuality() {
  const delta = Math.floor((state.motivation + state.emotion) / 25 - 4);
  state.quality += delta;
  normalize();
}

function getRandomEvent() {
  const roll = Math.random();
  if (roll < 0.7) return negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
  if (roll < 0.9) return neutralEvents[Math.floor(Math.random() * neutralEvents.length)];
  return positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
}

function setStatus(text = "") {
  elements.status.textContent = text;
}

function updateUI() {
  elements.motivation.textContent = state.motivation;
  elements.emotion.textContent = state.emotion;
  elements.quality.textContent = state.quality;

  elements.motivationBar.value = state.motivation;
  elements.emotionBar.value = state.emotion;
  elements.qualityBar.value = state.quality;

  updateCharacterSprite();
}

function triggerEvent() {
  if (state.gameOver) return;

  if (state.eventsCount >= state.maxEvents) {
    endShift();
    return;
  }

  const event = getRandomEvent();
  state.currentEvent = event;
  state.waitingForAction = true;
  state.eventsCount += 1;

  state.motivation += event.effect.motivation || 0;
  state.emotion += event.effect.emotion || 0;
  state.quality += event.effect.quality || 0;

  normalize();
  elements.message.textContent = `Событие: ${event.text}`;
  setStatus(`Событие ${state.eventsCount} из ${state.maxEvents}`);
  updateUI();
}

function scheduleNextEvent() {
  window.setTimeout(() => {
    if (!state.gameOver) {
      triggerEvent();
    }
  }, 2500);
}

function handleAction(action) {
  if (state.gameOver || !state.waitingForAction || !state.currentEvent) return;

  stats.actions[action] += 1;

  if (action === state.currentEvent.correctAction) {
    state.motivation += 5;
    state.emotion += 5;
    state.quality += 5;
    elements.message.textContent = "Решение помогло стабилизировать ситуацию.";
  } else if (state.currentEvent.correctAction) {
    stats.wrongActions += 1;
    state.motivation -= 5;
    state.emotion -= 5;
    state.quality -= 5;
    elements.message.textContent = "Решение усугубло ситуацию.";
  } else {
    elements.message.textContent = "Ситуация не требовала вмешательства.";
  }

  normalize();
  updateQuality();
  updateUI();

  state.currentEvent = null;
  state.waitingForAction = false;
  scheduleNextEvent();
}

function endShift() {
  state.gameOver = true;
  state.waitingForAction = false;
  elements.message.textContent = "Смена завершена. Проанализируйте принятые решения и влияние на состояние сотрудника.";
  setStatus(`Ошибочных действий: ${stats.wrongActions}`);
}

elements.praiseBtn.addEventListener("click", () => handleAction("praise"));
elements.checkInBtn.addEventListener("click", () => handleAction("checkIn"));
elements.feedbackBtn.addEventListener("click", () => handleAction("feedback"));

updateUI();
setStatus("Игра началась");
triggerEvent();
