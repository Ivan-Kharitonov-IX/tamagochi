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
  maxEvents: 21,
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
    base: { motivation: 10, emotion: 12, quality: -5 }
  },
  clarify: {
    id: "clarify",
    label: "Прояснить задачу",
    base: { motivation: -3, emotion: -2, quality: 10 }
  },
  feedback: {
    id: "feedback",
    label: "Дать корректирующую обратную связь",
    base: { motivation: -4, emotion: -5, quality: 12 }
  },
  redistribute: {
    id: "redistribute",
    label: "Перераспределить нагрузку",
    base: { motivation: 6, emotion: 7, quality: -4 }
  },
  pressure: {
    id: "pressure",
    label: "Усилить контроль",
    base: { motivation: -10, emotion: -11, quality: 14 }
  },
  develop: {
    id: "develop",
    label: "Развивать сотрудника",
    base: { motivation: 8, emotion: 2, quality: 6 }
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
    text: "Резкий рост задач",
    category: "нагрузка",
    sensitivity: { support: 1.5, clarify: 1.0, feedback: 0.9, redistribute: 1.8, pressure: -0.9, develop: 1.0 }
  },
  {
    text: "Несколько задач одновреенно",
    category: "нагрузка",
    sensitivity: { support: 1.0, clarify: 1.8, feedback: 0.9, redistribute: 1.1, pressure: -0.9, develop: 1.0 }
  },
  {
    text: "Нагрузка распределена неравномерно",
    category: "нагрузка",
    sensitivity: { support: 0.9, clarify: 1.1, feedback: 0.9, redistribute: 1.8, pressure: -0.9, develop: 1.0 }
  },
  {
    text: "Требуется ускорение выполнения",
    category: "нагрузка",
    sensitivity: { support: -0.8, clarify: 1.0, feedback: 1.0, redistribute: 1.1, pressure: 1.5, develop: 0.9 }
  },
  {
    text: "Новый процесс без объяснений",
    category: "процессы",
    sensitivity: { support: 1.0, clarify: 1.7, feedback: 1.0, redistribute: 0.9, pressure: -0.9, develop: 1.7 }
  },
  {
    text: "Противоречивые инструкции",
    category: "процессы",
    sensitivity: { support: 1.0, clarify: 1.8, feedback: -0.8, redistribute: 0.9, pressure: 1.0, develop: 1.0 }
  },
  {
    text: "Ошибка в процессе влияет на результат",
    category: "процессы",
    sensitivity: { support: -0.8, clarify: 1.0, feedback: 1.7, redistribute: 1.0, pressure: 0.9, develop: 1.6 }
  },
  {
    text: "Нужно быстро адаптироваться к изменениям",
    category: "процессы",
    sensitivity: { support: 1.6, clarify: 1.1, feedback: 1.0, redistribute: 0.9, pressure: -0.9, develop: 1.7 }
  },
  {
    text: "Потеря уверенности после ошибки",
    category: "состояние",
    sensitivity: { support: 1.9, clarify: 1.0, feedback: -0.9, redistribute: 1.1, pressure: 0.9, develop: 1.2 }
  },
  {
    text: "Растёт раздражительность",
    category: "состояние",
    sensitivity: { support: 1.8, clarify: 1.0, feedback: 0.9, redistribute: 1.1, pressure: -0.9, develop: 1.0 }
  },
  {
    text: "Падает вовлечённость",
    category: "состояние",
    sensitivity: { support: 1.1, clarify: 1.0, feedback: 1.0, redistribute: 0.9, pressure: -0.9, develop: 1.8 }
  },
  {
    text: "Избегает сложных задач",
    category: "состояние",
    sensitivity: { support: 1.0, clarify: 1.0, feedback: 1.0, redistribute: 0.9, pressure: -0.9, develop: 1.8 }
  },
  {
    text: "Конфликт в команде",
    category: "команда",
    sensitivity: { support: 1.7, clarify: 1.7, feedback: 1.0, redistribute: 1.0, pressure: -0.9, develop: 1.0 }
  },
  {
    text: "Неравномерная ответственность",
    category: "команда",
    sensitivity: { support: -0.8, clarify: 1.1, feedback: 1.8, redistribute: 1.2, pressure: 1.0, develop: 1.0 }
  },
  {
    text: "Сильный сотрудник перегружен",
    category: "команда",
    sensitivity: { support: 1.2, clarify: 1.0, feedback: 0.9, redistribute: 1.9, pressure: -0.9, develop: 1.0 }
  },
  {
    text: "Новичок замедляет процесс",
    category: "команда",
    sensitivity: { support: 1.0, clarify: 1.1, feedback: 1.0, redistribute: 0.9, pressure: -0.9, develop: 1.8 }
  },
  {
    text: "Нужно выбрать: скорость или качество",
    category: "дилеммы",
    sensitivity: { support: -0.8, clarify: 1.6, feedback: 1.1, redistribute: 1.0, pressure: 1.6, develop: 0.9 }
  },
  {
    text: "Сотрудник делает медленно, но без ошибок",
    category: "дилеммы",
    sensitivity: { support: 1.7, clarify: 1.0, feedback: 0.9, redistribute: 1.0, pressure: -0.9, develop: 1.6 }
  },
  {
    text: "Сотрудник делает быстро, но с ошибками",
    category: "дилеммы",
    sensitivity: { support: -0.8, clarify: 1.7, feedback: 1.7, redistribute: 1.0, pressure: 1.0, develop: 1.0 }
  },
  {
    text: "Есть шанс улучшить процесс, но это замедлит работу",
    category: "дилеммы",
    sensitivity: { support: 1.1, clarify: 1.0, feedback: 1.1, redistribute: 0.9, pressure: -0.9, develop: 1.8 }
  },
  {
    text: "Нужно делегировать задачу с риском ошибки",
    category: "дилеммы",
    sensitivity: { support: 1.1, clarify: 1.0, feedback: 1.1, redistribute: 1.2, pressure: -0.9, develop: 1.8 }
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
  if (!action || !event) return { contextMultiplier: 1, resultDelta: { motivation: 0, emotion: 0, quality: 0 } };

  const multiplier = event.sensitivity[actionId] ?? 1;
  const resultDelta = { motivation: 0, emotion: 0, quality: 0 };

  Object.keys(action.base).forEach((metric) => {
    const baseValue = action.base[metric];
    let contextualValue = Math.round(baseValue * multiplier);

    if (multiplier < 0) {
      contextualValue -= Math.sign(baseValue) * 2;
    }

    resultDelta[metric] = contextualValue;
    state[metric] += contextualValue;
  });

  return { contextMultiplier: multiplier, resultDelta };
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
  } else if (outcome.contextMultiplier >= 1.5) {
    stats.contextMatches += 1;
  }

  if (state.motivation < 35) {
    stats.lowMotivationMoments += 1;
  }

  if (state.emotion < 35) {
    stats.lowEmotionMoments += 1;
  }

  if ((before.motivation < 40 || before.emotion < 40) && (actionId === "pressure" || actionId === "feedback")) {
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
  const maxCount = Math.max(...Object.values(stats.actions));
  const minCount = Math.min(...Object.values(stats.actions));

  if (pressureRate >= 0.3) {
    return "Слишком частый упор на контроль: качество иногда росло, но мотивация и эмоции заметно просели.";
  }

  if (supportRate >= 0.35) {
    return "Сильный уклон в поддержку: эмоциональный фон стабилизировался, но часть процессов осталась без жёсткой коррекции.";
  }

  if (maxCount - minCount >= 6) {
    return "Подход несбалансированный: часть управленческих инструментов почти не использовалась, из-за чего решения хуже попадали в контекст.";
  }

  return "Подход в целом сбалансирован: тебе удалось варьировать инструменты управления и адаптироваться к контексту.";
}

function endShift() {
  state.gameOver = true;
  state.waitingForAction = false;
  const finalScore = state.quality;
sendScore(finalScore);
finishSCORM();

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
