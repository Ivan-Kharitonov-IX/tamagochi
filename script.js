let scorm = null;

function initSCORM() {
  if (window.API) {
    scorm = window.API;
    scorm.LMSInitialize("");
  }
}

function sendScore(score) {
  if (scorm) {
    scorm.LMSSetValue("cmi.core.score.raw", score);
    scorm.LMSCommit("");
  }
}

function finishSCORM() {
  if (scorm) {
    scorm.LMSFinish("");
  }
}
const state = {
  motivation: 60,
  emotion: 60,
  quality: 60,
  currentEvent: null,
  waitingForAction: false,
  eventsCount: 0,
  maxEvents: 18,
  gameOver: false
};

const sprites = {
  happy: "assets/happy.png",
  neutral: "assets/neutral.png",
  stressed: "assets/stressed.png",
  angry: "assets/angry.png",
  tired: "assets/tired.png"
};

const actions = {
  support: {
    id: "support",
    label: "Поддержать сотрудника",
    base: { motivation: 10, emotion: 12, quality: -4 }
  },
  clarify: {
    id: "clarify",
    label: "Прояснить задачу",
    base: { motivation: -2, emotion: -3, quality: 10 }
  },
  feedback: {
    id: "feedback",
    label: "Дать обратную связь",
    base: { motivation: -3, emotion: -4, quality: 11 }
  },
  redistribute: {
    id: "redistribute",
    label: "Перераспределить нагрузку",
    base: { motivation: 5, emotion: 6, quality: -6 }
  },
  pressure: {
    id: "pressure",
    label: "Усилить контроль",
    base: { motivation: -10, emotion: -11, quality: 14 }
  },
  develop: {
    id: "develop",
    label: "Развивать сотрудника",
    base: { motivation: 9, emotion: 3, quality: 7 }
  }
};

const stats = {
  actions: {
    support: 0,
    clarify: 0,
    feedback: 0,
    redistribute: 0,
    pressure: 0,
    develop: 0
  },
  negativeOutcomes: 0,
  lowMotivationMoments: 0,
  lowEmotionMoments: 0,
  ignoredStateMoments: 0,
  contextMatches: 0
};

const events = [
  {
    text: "Сотрдник ведёт две очереди одновременно и начинает путаться в заказах.",
    category: "нагрузка",
    sensitivity: { support: 1.1, clarify: 1.2, feedback: 0.8, redistribute: 1.6, pressure: -0.6, develop: 0.7 }
  },
  {
    text: "В конце часа резко вырос поток клиентов, темп выдачи упал.",
    category: "нагрузка",
    sensitivity: { support: 0.8, clarify: 1.1, feedback: 0.9, redistribute: 1.7, pressure: 0.7, develop: 0.6 }
  },
  {
    text: "Сотрудник просит помощь: не успевает и жалуется на усталость.",
    category: "нагрузка",
    sensitivity: { support: 1.7, clarify: 0.9, feedback: 0.7, redistribute: 1.5, pressure: -0.8, develop: 0.6 }
  },
  {
    text: "Новая инструкция по возвратам написана неясно, сотрудники трактуют её по-разному.",
    category: "процессы",
    sensitivity: { support: 0.7, clarify: 1.8, feedback: 1.2, redistribute: 0.6, pressure: 0.5, develop: 1.1 }
  },
  {
    text: "Система маркировки обновилась, в команде пошли ошибки сканирования.",
    category: "процессы",
    sensitivity: { support: 0.6, clarify: 1.6, feedback: 1.3, redistribute: 0.7, pressure: 0.8, develop: 1.4 }
  },
  {
    text: "Сотрудник выполняет задачи механически и не замечает повторяющиеся ошибки.",
    category: "процессы",
    sensitivity: { support: 0.9, clarify: 1.1, feedback: 1.7, redistribute: 0.6, pressure: 0.9, develop: 1.2 }
  },
  {
    text: "После жёсткого разговора с клиентом сотрудник стал раздражительным.",
    category: "состояние",
    sensitivity: { support: 1.8, clarify: 0.8, feedback: 0.9, redistribute: 1.1, pressure: -0.9, develop: 0.8 }
  },
  {
    text: "Сотрудник работает стабильно, но заметно эмоционально выгорел.",
    category: "состояние",
    sensitivity: { support: 1.6, clarify: 0.9, feedback: 1.1, redistribute: 1.0, pressure: -0.8, develop: 1.3 }
  },
  {
    text: "Сотрудник сомневается в себе после двух мелких ошибок подряд.",
    category: "состояние",
    sensitivity: { support: 1.7, clarify: 1.0, feedback: 1.2, redistribute: 0.9, pressure: -0.7, develop: 1.1 }
  },
  {
    text: "Опытный сотрудник конфликтует с новичком из-за распределения задач.",
    category: "команда",
    sensitivity: { support: 1.2, clarify: 1.4, feedback: 1.1, redistribute: 1.3, pressure: 0.6, develop: 1.0 }
  },
  {
    text: "Команда жалуется на неравномерные смены и несправедливую нагрузку.",
    category: "команда",
    sensitivity: { support: 1.0, clarify: 1.1, feedback: 0.9, redistribute: 1.8, pressure: -0.5, develop: 0.8 }
  },
  {
    text: "Новичок тянется за сильным сотрудником и копирует его ошибки.",
    category: "команда",
    sensitivity: { support: 1.0, clarify: 1.2, feedback: 1.4, redistribute: 0.8, pressure: 0.7, develop: 1.7 }
  },
  {
    text: "Ключевой сотрудник просит ранний уход, но вечерняя смена уже недоукомплектована.",
    category: "дилеммы",
    sensitivity: { support: 1.1, clarify: 1.2, feedback: 0.8, redistribute: 1.5, pressure: 1.0, develop: 0.7 }
  },
  {
    text: "Клиент требует исключение из правила, и сотрудник ждёт вашего решения.",
    category: "дилеммы",
    sensitivity: { support: 0.7, clarify: 1.7, feedback: 1.1, redistribute: 0.6, pressure: 0.9, develop: 1.0 }
  },
  {
    text: "Сотрудник просит обучение, но на смене нет запаса по времени.",
    category: "дилеммы",
    sensitivity: { support: 1.0, clarify: 0.8, feedback: 1.0, redistribute: 0.7, pressure: 0.6, develop: 1.9 }
  },
  {
    text: "По KPI сегодня просадка, а сотрудник и так работает на пределе.",
    category: "дилеммы",
    sensitivity: { support: 1.2, clarify: 1.0, feedback: 1.1, redistribute: 1.1, pressure: -0.7, develop: 0.9 }
  },
  {
    text: "Сотрудник выполняет норму, но инициативы и роста не видно.",
    category: "процессы",
    sensitivity: { support: 0.9, clarify: 1.0, feedback: 1.3, redistribute: 0.7, pressure: 0.8, develop: 1.8 }
  },
  {
    text: "После сложной недели команда эмоционально просела, но план нужно закрыть.",
    category: "состояние",
    sensitivity: { support: 1.5, clarify: 0.9, feedback: 1.0, redistribute: 1.2, pressure: -0.6, develop: 1.1 }
  }
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
  characterSprite: document.getElementById("characterSprite")
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
  const delta = Math.floor((state.motivation + state.emotion) / 28 - 3);
  state.quality += delta;
  normalize();
}

function getRandomEvent() {
  return events[Math.floor(Math.random() * events.length)];
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

  state.currentEvent = getRandomEvent();
  state.waitingForAction = true;
  state.eventsCount += 1;

  elements.message.textContent = `Событие (${state.currentEvent.category}): ${state.currentEvent.text}`;
  setStatus(`Событие ${state.eventsCount} из ${state.maxEvents}`);
  updateUI();
}

function scheduleNextEvent() {
  window.setTimeout(() => {
    if (!state.gameOver) {
      triggerEvent();
    }
  }, 2200);
}

function applyActionWithContext(actionId, event) {
  const action = actions[actionId];
  if (!action || !event) return { totalDelta: 0, contextMultiplier: 1 };

  const multiplier = event.sensitivity[actionId] ?? 1;
  const resultDelta = { motivation: 0, emotion: 0, quality: 0 };

  Object.keys(action.base).forEach((metric) => {
    const baseValue = action.base[metric];
    let contextualValue = Math.round(baseValue * multiplier);

    if (multiplier < 0) {
      contextualValue -= Math.sign(baseValue) * 2;
    }

    resultDelta[metric] += contextualValue;
    state[metric] += contextualValue;
  });

  return {
    totalDelta: resultDelta.motivation + resultDelta.emotion + resultDelta.quality,
    contextMultiplier: multiplier,
    resultDelta
  };
}

function handleAction(actionId) {
  if (state.gameOver || !state.waitingForAction || !state.currentEvent) return;

  if (!actions[actionId]) return;

  stats.actions[actionId] += 1;

  const before = {
    motivation: state.motivation,
    emotion: state.emotion,
    quality: state.quality
  };

  const outcome = applyActionWithContext(actionId, state.currentEvent);
  normalize();
  updateQuality();

  const after = {
    motivation: state.motivation,
    emotion: state.emotion,
    quality: state.quality
  };

  const net = (after.motivation - before.motivation) + (after.emotion - before.emotion) + (after.quality - before.quality);

  if (net < 0) {
    stats.negativeOutcomes += 1;
  } else if (outcome.contextMultiplier >= 1.2) {
    stats.contextMatches += 1;
  }

  if (state.motivation < 35) {
    stats.lowMotivationMoments += 1;
  }

  if (state.emotion < 35) {
    stats.lowEmotionMoments += 1;
  }

  if ((before.motivation < 40 || before.emotion < 40) && (actionId === "pressure" || actionId === "clarify")) {
    stats.ignoredStateMoments += 1;
  }

  const moodText = net >= 0 ? "Решение сработало в текущем контексте." : "Решение ухудшило ситуацию в текущем контексте.";
  elements.message.textContent = `${moodText} (${actions[actionId].label})`;

  updateUI();

  state.currentEvent = null;
  state.waitingForAction = false;
  scheduleNextEvent();
}

function getDominantStyle() {
  const totalActions = Object.values(stats.actions).reduce((sum, val) => sum + val, 0) || 1;
  const pressureRate = stats.actions.pressure / totalActions;
  const supportRate = stats.actions.support / totalActions;
  const devRate = stats.actions.develop / totalActions;
  const highNegative = stats.negativeOutcomes >= Math.ceil(state.maxEvents * 0.4);

  if (pressureRate >= 0.3) {
    return "Слишком часто использовали давление и контроль — качество местами росло, но эмоциональный фон просел.";
  }

  if (supportRate >= 0.35 && stats.actions.feedback + stats.actions.clarify < totalActions * 0.35) {
    return "Сильный уклон в поддержку: атмосфера лучше, но управленческой жёсткости и структуры не хватило.";
  }

  if ((stats.lowMotivationMoments + stats.lowEmotionMoments >= 6 || stats.ignoredStateMoments >= 3) && highNegative) {
    return "Состояние сотрудника часто игнорировалось: накапливались усталость и раздражение, решения становились менее эффективными.";
  }

  if (pressureRate < 0.26 && supportRate < 0.3 && devRate >= 0.12 && stats.contextMatches >= 4) {
    return "Подход сбалансированный: вы адаптировались к контексту и сочетали поддержку, структуру и развитие.";
  }

  return "Стиль управления смешанный: были удачные решения, но часть действий не совпала с контекстом смены.";
}

function endShift() {
  state.gameOver = true;
  state.waitingForAction = false;

  const totalActions = Object.values(stats.actions).reduce((sum, val) => sum + val, 0);
  const summary = [
    `Смена завершена. Обработано событий: ${state.eventsCount}.`,
    `Негативных исходов решений: ${stats.negativeOutcomes}.`,
    `Эпизоды низкой мотивации: ${stats.lowMotivationMoments}.`,
    `Эпизоды низкого эмоционального фона: ${stats.lowEmotionMoments}.`,
    `Точных попаданий в контекст: ${stats.contextMatches}.`,
    getDominantStyle()
  ];

  elements.message.textContent = summary.join(" ");
  setStatus(`Итог: действий ${totalActions}, качество ${state.quality}, мотивация ${state.motivation}, эмоции ${state.emotion}.`);
  updateUI();
}

window.handleAction = handleAction;

updateUI();
setStatus("Игра началась");
triggerEvent();
