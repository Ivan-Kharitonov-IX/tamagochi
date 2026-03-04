const SHIFT_MIN_TURNS = 10;
const SHIFT_MAX_TURNS = 15;

const state = {
  motivation: 62,
  emotion: 58,
  quality: 60,
  fatigue: 25,
  burnoutRisk: 8,
  currentEvent: null,
  waitingForAction: false,
  turnsPlayed: 0,
  maxTurns: randomInt(SHIFT_MIN_TURNS, SHIFT_MAX_TURNS),
  gameOver: false,
  criticalStreak: {
    motivation: 0,
    emotion: 0
  },
  criticalMoments: 0,
  timeline: [],
  actionStats: {
    supportive: 0,
    directive: 0,
    byAction: {}
  }
};

const sprites = {
  happy: "assets/happy.png",
  neutral: "assets/neutral.png",
  stressed: "assets/stressed.png",
  angry: "assets/angry.png",
  tired: "assets/tired.png"
};

const actions = [
  {
    id: "praiseEmployee",
    label: "Похвалить сотрудника",
    type: "supportive",
    effects: { motivation: 12, emotion: 8, quality: 1, fatigue: -4, burnoutRisk: -2 },
    tags: { clients: 0, processes: -1, inner: 1, team: 1 },
    note: "Поддержка укрепляет доверие, но не всегда решает системные сбои."
  },
  {
    id: "personalTalk",
    label: "Провести личный разговор",
    type: "supportive",
    effects: { motivation: 7, emotion: 14, quality: -3, fatigue: -5, burnoutRisk: -3 },
    tags: { clients: -1, processes: -2, inner: 2, team: 1 },
    note: "Помогает снять напряжение, но временно отвлекает от операционных задач."
  },
  {
    id: "correctiveFeedback",
    label: "Дать корректирующую обратную связь",
    type: "directive",
    effects: { motivation: -4, emotion: -7, quality: 9, fatigue: 4, burnoutRisk: 3 },
    tags: { clients: 1, processes: 2, inner: -2, team: -1 },
    note: "Ускоряет исправление ошибок, но может снизить эмоциональный фон."
  },
  {
    id: "redistributeLoad",
    label: "Перераспределить нагрузку",
    type: "supportive",
    effects: { motivation: 4, emotion: 5, quality: -2, fatigue: -9, burnoutRisk: -5 },
    tags: { clients: 0, processes: -1, inner: 1, team: 2 },
    note: "Снижает перегруз, но адаптация команды временно замедляет результат."
  },
  {
    id: "speedUpPace",
    label: "Ускорить темп работы",
    type: "directive",
    effects: { motivation: -6, emotion: -9, quality: 8, fatigue: 10, burnoutRisk: 6 },
    tags: { clients: 2, processes: 1, inner: -2, team: -2 },
    note: "Даёт быстрый прирост в SLA, но повышает усталость и риск выгорания."
  },
  {
    id: "trainAndExplain",
    label: "Обучить и объяснить процесс",
    type: "supportive",
    effects: { motivation: 5, emotion: 3, quality: -6, fatigue: 2, burnoutRisk: -2 },
    tags: { clients: -1, processes: 2, inner: 1, team: 0 },
    note: "Краткосрочно снижает производительность, но укрепляет стабильность."
  }
];

const events = {
  clients: [
    {
      category: "Клиенты",
      text: "Пошёл наплыв клиентов с возвратами — очередь растёт каждую минуту.",
      impact: { emotion: -8, fatigue: 6, quality: -2 },
      pressure: 2,
      bestTags: ["clients", "processes"]
    },
    {
      category: "Клиенты",
      text: "Крупный клиент просит срочную отгрузку вне стандартного окна.",
      impact: { motivation: -4, emotion: -5, quality: -1 },
      pressure: 1,
      bestTags: ["processes", "clients"]
    },
    {
      category: "Клиенты",
      text: "Покупатель агрессивно спорит из-за задержки и требует руководителя.",
      impact: { emotion: -10, fatigue: 4 },
      pressure: 2,
      bestTags: ["inner", "clients"]
    },
    {
      category: "Клиенты",
      text: "Серия благодарностей от постоянных клиентов повышает ожидания к сервису.",
      impact: { motivation: 4, emotion: 3 },
      pressure: 1,
      bestTags: ["team", "processes"]
    },
    {
      category: "Клиенты",
      text: "Клиенты жалуются на несоответствие статуса заказа в системе.",
      impact: { quality: -5, emotion: -4 },
      pressure: 1,
      bestTags: ["processes", "clients"]
    }
  ],
  processes: [
    {
      category: "Процессы",
      text: "Новый регламент приёмки внедрили без инструктажа команды.",
      impact: { motivation: -6, quality: -4 },
      pressure: 1,
      bestTags: ["processes", "inner"]
    },
    {
      category: "Процессы",
      text: "Сканер штрихкодов периодически зависает, операции замедляются.",
      impact: { emotion: -6, fatigue: 5, quality: -2 },
      pressure: 2,
      bestTags: ["processes", "team"]
    },
    {
      category: "Процессы",
      text: "Поставщик снова прислал коробки без маркировки.",
      impact: { quality: -6, fatigue: 3 },
      pressure: 1,
      bestTags: ["processes", "clients"]
    },
    {
      category: "Процессы",
      text: "Внезапная проверка качества требует идеальной документации.",
      impact: { emotion: -5, quality: -3, fatigue: 4 },
      pressure: 2,
      bestTags: ["processes", "clients"]
    },
    {
      category: "Процессы",
      text: "Успешный пилот новой схемы упаковки можно масштабировать на смену.",
      impact: { motivation: 3, quality: 2 },
      pressure: 0,
      bestTags: ["processes", "team"]
    }
  ],
  inner: [
    {
      category: "Внутреннее состояние сотрудника",
      text: "Сотрудник выглядит вымотанным и делает паузы между задачами.",
      impact: { emotion: -7, fatigue: 8 },
      pressure: 1,
      bestTags: ["inner", "team"]
    },
    {
      category: "Внутреннее состояние сотрудника",
      text: "После ошибки сотрудник сильно сомневается в своей компетентности.",
      impact: { motivation: -9, emotion: -6 },
      pressure: 1,
      bestTags: ["inner", "processes"]
    },
    {
      category: "Внутреннее состояние сотрудника",
      text: "Сотрудник просит больше самостоятельности в принятии решений.",
      impact: { motivation: -3, emotion: -2 },
      pressure: 0,
      bestTags: ["team", "inner"]
    },
    {
      category: "Внутреннее состояние сотрудника",
      text: "Замечены признаки раздражительности и циничные комментарии.",
      impact: { emotion: -9, burnoutRisk: 5 },
      pressure: 1,
      bestTags: ["inner", "team"]
    },
    {
      category: "Внутреннее состояние сотрудника",
      text: "Сотрудник предложил идею улучшения процесса, но не уверен, что его услышат.",
      impact: { motivation: 2, emotion: 1 },
      pressure: 0,
      bestTags: ["team", "processes"]
    }
  ],
  team: [
    {
      category: "Коллектив",
      text: "Коллега заболел, и часть задач легла на вашу смену.",
      impact: { fatigue: 7, emotion: -4, quality: -2 },
      pressure: 2,
      bestTags: ["team", "inner"]
    },
    {
      category: "Коллектив",
      text: "В команде спор: кто должен закрывать поздние отгрузки.",
      impact: { emotion: -7, motivation: -3 },
      pressure: 1,
      bestTags: ["team", "inner"]
    },
    {
      category: "Коллектив",
      text: "Новый стажёр требует постоянных подсказок и замедляет поток.",
      impact: { quality: -3, fatigue: 4 },
      pressure: 1,
      bestTags: ["processes", "team"]
    },
    {
      category: "Коллектив",
      text: "Команда просит прозрачнее объяснить приоритеты на день.",
      impact: { motivation: -2, quality: -1 },
      pressure: 0,
      bestTags: ["processes", "team"]
    },
    {
      category: "Коллектив",
      text: "Сильный сотрудник из соседней смены готов помочь, если грамотно распределить задачи.",
      impact: { emotion: 2, quality: 1 },
      pressure: 0,
      bestTags: ["team", "clients"]
    }
  ]
};

const eventPool = Object.values(events).flat();

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
  actionsContainer: document.querySelector(".actions"),
  statsContainer: document.querySelector(".stats")
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeState() {
  state.motivation = clamp(state.motivation);
  state.emotion = clamp(state.emotion);
  state.quality = clamp(state.quality);
  state.fatigue = clamp(state.fatigue);
  state.burnoutRisk = clamp(state.burnoutRisk);
}

function ensureDynamicStats() {
  if (document.getElementById("fatigue")) return;

  const row = document.createElement("div");
  row.innerHTML = `😴 Уровень усталости: <span id="fatigue">0</span><progress id="fatigueBar" value="0" max="100"></progress>`;
  elements.statsContainer.appendChild(row);

  elements.fatigue = document.getElementById("fatigue");
  elements.fatigueBar = document.getElementById("fatigueBar");
}

function getCharacterState() {
  if (state.fatigue > 72 || state.burnoutRisk > 68) return "tired";
  if (state.emotion < 26) return "angry";
  if (state.emotion < 45 || state.motivation < 40) return "stressed";
  if (state.motivation > 78 && state.emotion > 72 && state.fatigue < 35) return "happy";
  return "neutral";
}

function updateCharacterSprite() {
  elements.characterSprite.src = sprites[getCharacterState()] || sprites.neutral;
}

function applyEventImpact(event) {
  Object.entries(event.impact).forEach(([metric, value]) => {
    state[metric] += value;
  });
}

function applyAction(action) {
  Object.entries(action.effects).forEach(([metric, value]) => {
    state[metric] += value;
  });
}

function applySynergy(action, event) {
  const [primaryTag, secondaryTag] = event.bestTags;
  const primaryScore = action.tags[primaryTag] || 0;
  const secondaryScore = action.tags[secondaryTag] || 0;
  const synergy = primaryScore * 2 + secondaryScore;

  if (synergy >= 5) {
    state.quality += 4;
    state.motivation += 2;
    state.burnoutRisk -= 2;
    return "Решение хорошо попало в контекст события.";
  }

  if (synergy >= 2) {
    state.quality += 2;
    return "Решение частично помогло стабилизировать ситуацию.";
  }

  if (synergy <= -3) {
    state.quality -= 4;
    state.emotion -= 3;
    state.burnoutRisk += 3;
    return "Подход не совпал с причиной проблемы и усилил напряжение.";
  }

  return "Эффект оказался смешанным: часть задач решилась, часть — отложилась.";
}

function updateDerivedMetrics(eventPressure = 0, action = null) {
  const moodFactor = (state.motivation * 0.45 + state.emotion * 0.45) - state.fatigue * 0.25;
  const baseDrift = (moodFactor - 45) * 0.1;
  state.quality += baseDrift;

  if (action && action.id === "trainAndExplain") {
    state.motivation += 2;
    state.burnoutRisk -= 1;
  }

  const criticalMotivation = state.motivation < 25;
  const criticalEmotion = state.emotion < 25;

  state.criticalStreak.motivation = criticalMotivation ? state.criticalStreak.motivation + 1 : 0;
  state.criticalStreak.emotion = criticalEmotion ? state.criticalStreak.emotion + 1 : 0;

  if (criticalMotivation || criticalEmotion) {
    state.criticalMoments += 1;
  }

  if (state.criticalStreak.motivation >= 2 || state.criticalStreak.emotion >= 2) {
    state.burnoutRisk += 5 + eventPressure;
    state.fatigue += 3;
  }

  if (state.fatigue > 70) {
    state.emotion -= 3;
    state.quality -= 2;
  }

  if (state.burnoutRisk > 75) {
    state.motivation -= 4;
    state.emotion -= 4;
  }

  normalizeState();
}

function getRandomEvent() {
  return eventPool[Math.floor(Math.random() * eventPool.length)];
}

function setStatus(text = "") {
  elements.status.textContent = text;
}

function updateUI() {
  elements.motivation.textContent = state.motivation;
  elements.emotion.textContent = state.emotion;
  elements.quality.textContent = state.quality;
  elements.fatigue.textContent = state.fatigue;

  elements.motivationBar.value = state.motivation;
  elements.emotionBar.value = state.emotion;
  elements.qualityBar.value = state.quality;
  elements.fatigueBar.value = state.fatigue;

  updateCharacterSprite();
}

function snapshotTurn(action) {
  state.timeline.push({
    turn: state.turnsPlayed,
    action: action.label,
    motivation: state.motivation,
    emotion: state.emotion,
    quality: state.quality,
    fatigue: state.fatigue,
    burnoutRisk: state.burnoutRisk
  });
}

function triggerEvent() {
  if (state.gameOver) return;

  if (state.turnsPlayed >= state.maxTurns) {
    endShift();
    return;
  }

  const event = getRandomEvent();
  state.currentEvent = event;
  state.waitingForAction = true;
  state.turnsPlayed += 1;

  applyEventImpact(event);
  updateDerivedMetrics(event.pressure);

  normalizeState();
  elements.message.textContent = `Событие (${event.category}): ${event.text}`;
  setStatus(`Ход ${state.turnsPlayed} из ${state.maxTurns} · Риск выгорания: ${state.burnoutRisk}%`);
  updateUI();
}

function scheduleNextEvent() {
  window.setTimeout(() => {
    if (!state.gameOver) {
      triggerEvent();
    }
  }, 2200);
}

function handleAction(actionId) {
  if (state.gameOver || !state.waitingForAction || !state.currentEvent) return;

  const action = actions.find((item) => item.id === actionId);
  if (!action) return;

  state.actionStats.byAction[action.id] = (state.actionStats.byAction[action.id] || 0) + 1;
  state.actionStats[action.type] += 1;

  applyAction(action);
  const resultText = applySynergy(action, state.currentEvent);
  updateDerivedMetrics(state.currentEvent.pressure, action);

  normalizeState();
  snapshotTurn(action);
  updateUI();

  elements.message.textContent = `${resultText} ${action.note}`;

  state.currentEvent = null;
  state.waitingForAction = false;
  scheduleNextEvent();
}

function getTrend(start, end) {
  const delta = end - start;
  if (delta > 7) return "рост";
  if (delta < -7) return "снижение";
  return "колебания без выраженного тренда";
}

function classifyLeadershipStyle() {
  const supportive = state.actionStats.supportive;
  const directive = state.actionStats.directive;
  const critical = state.criticalMoments;
  const fatigueEnd = state.fatigue;

  if (supportive >= directive + 3 && state.quality >= 60) return "Наставник";
  if (directive >= supportive + 3 && critical <= 3) return "Контролёр";
  if (critical >= 6 && directive >= supportive) return "Пожарный";
  if (directive >= supportive + 2 && fatigueEnd > 65) return "Микроменеджер";
  if (supportive >= directive + 2 && state.quality < 55) return "Популист";
  return supportive >= directive ? "Наставник" : "Контролёр";
}

function generateFeedback(style) {
  const parts = {
    Наставник: "Вы регулярно поддерживали сотрудника, удерживали мотивацию и эмоциональный фон. Сильная сторона — доверие и устойчивость, зона роста — быстрее реагировать директивно в процессных сбоях.",
    "Контролёр": "Вы уверенно управляли качеством и стандартами. Это помогает держать результат, но важно не допускать накопления усталости и эмоционального охлаждения сотрудника.",
    "Пожарный": "Вы умеете быстро тушить кризисы и вытягивать смену в сложных ситуациях. Однако частое управление в режиме аврала повышает риск выгорания и требует профилактики заранее.",
    "Микроменеджер": "Вы активно вмешивались в детали и добивались краткосрочного контроля. Цена такого подхода — рост усталости и снижение автономности сотрудника.",
    Популист: "Вы делали ставку на комфорт и лояльность сотрудника. Атмосфера улучшалась, но части решений не хватило жёсткости для стабильного качества процессов."
  };

  return parts[style];
}

function endShift() {
  state.gameOver = true;
  state.waitingForAction = false;

  const first = state.timeline[0] || state;
  const last = state.timeline[state.timeline.length - 1] || state;
  const style = classifyLeadershipStyle();

  const report = [
    "Смена завершена. Итоговая аналитика:",
    `Поддерживающих действий: ${state.actionStats.supportive}.`,
    `Директивных действий: ${state.actionStats.directive}.`,
    `Критических состояний сотрудника: ${state.criticalMoments}.`,
    `Динамика мотивации: ${getTrend(first.motivation, last.motivation)} (${first.motivation} → ${last.motivation}).`,
    `Динамика эмоций: ${getTrend(first.emotion, last.emotion)} (${first.emotion} → ${last.emotion}).`,
    `Динамика качества: ${getTrend(first.quality, last.quality)} (${first.quality} → ${last.quality}).`,
    `Динамика усталости: ${getTrend(first.fatigue, last.fatigue)} (${first.fatigue} → ${last.fatigue}).`,
    `Ваш управленческий стиль: ${style}.`,
    generateFeedback(style)
  ];

  elements.message.textContent = report.join(" ");
  setStatus("Смена закрыта. Можно перезагрузить страницу и попробовать другую стратегию.");
}

function renderActions() {
  elements.actionsContainer.innerHTML = "";

  actions.forEach((action) => {
    state.actionStats.byAction[action.id] = 0;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.addEventListener("click", () => handleAction(action.id));
    elements.actionsContainer.appendChild(button);
  });
}

function init() {
  ensureDynamicStats();
  renderActions();
  updateUI();
  setStatus(`Игра началась · Смена продлится ${state.maxTurns} ходов.`);
  triggerEvent();
}

init();
