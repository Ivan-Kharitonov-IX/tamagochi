(function (global) {
  function создатьДвижок() {
    const НАСТРОЙКИ = { минХодов: 10, максХодов: 15, критПорог: 25 };

    const SVG_СПРАЙТ = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><rect width='100%' height='100%' fill='#f7f7f7'/><circle cx='110' cy='75' r='38' fill='#222'/><rect x='62' y='122' width='96' height='70' rx='10' fill='#222'/><text x='110' y='210' text-anchor='middle' font-size='16' font-family='sans-serif' fill='#444'>Персонаж</text></svg>`)}`;

    const СПРАЙТЫ = {
      happy: "assets/happy.png",
      neutral: "assets/neutral.png",
      stressed: "assets/stressed.png",
      angry: "assets/angry.png",
      tired: "assets/tired.png"
    };

    const ДЕЙСТВИЯ = [
      { id: "praiseEmployee", label: "Похвалить сотрудника", тип: "поддерживающее", эффект: { motivation: 10, emotion: 7, fatigue: -2, burnoutRisk: -2 }, кКачеству: -2 },
      { id: "personalTalk", label: "Провести личный разговор", тип: "поддерживающее", эффект: { motivation: 6, emotion: 12, fatigue: -5, burnoutRisk: -3 }, кКачеству: -4 },
      { id: "correctiveFeedback", label: "Дать корректирующую обратную связь", тип: "директивное", эффект: { motivation: -4, emotion: -7, fatigue: 4, burnoutRisk: 3 }, кКачеству: 8 },
      { id: "redistributeLoad", label: "Перераспределить нагрузку", тип: "поддерживающее", эффект: { motivation: 4, emotion: 6, fatigue: -9, burnoutRisk: -4 }, кКачеству: -3 },
      { id: "speedUpPace", label: "Ускорить темп работы", тип: "директивное", эффект: { motivation: -6, emotion: -9, fatigue: 11, burnoutRisk: 7 }, кКачеству: 9 },
      { id: "trainAndExplain", label: "Обучить и объяснить процесс", тип: "поддерживающее", эффект: { motivation: 5, emotion: 4, fatigue: 2, burnoutRisk: -2 }, кКачеству: -7 }
    ];

    const СОБЫТИЯ = [
      { категория: "Клиенты", текст: "Клиент скандалит из-за задержки заказа.", эффект: { emotion: -7, fatigue: 3 }, контекст: { срочность: 2, конфликт: 2, хаос: 1, обучение: 0 } },
      { категория: "Клиенты", текст: "Волна возвратов, очередь стремительно растёт.", эффект: { quality: -3, fatigue: 4, motivation: -2 }, контекст: { срочность: 2, конфликт: 1, хаос: 2, обучение: 0 } },
      { категория: "Клиенты", текст: "VIP-клиент просит нестандартную срочную отгрузку.", эффект: { quality: -2, emotion: -4 }, контекст: { срочность: 2, конфликт: 1, хаос: 1, обучение: 0 } },
      { категория: "Процессы", текст: "Новый регламент внедрили без нормального инструктажа.", эффект: { motivation: -3, quality: -3 }, контекст: { срочность: 1, конфликт: 0, хаос: 1, обучение: 2 } },
      { категория: "Процессы", текст: "Сканер маркировки работает с перебоями.", эффект: { quality: -4, fatigue: 5 }, контекст: { срочность: 1, конфликт: 0, хаос: 2, обучение: 0 } },
      { категория: "Внутреннее состояние сотрудника", текст: "Сотрудник выглядит вымотанным и заторможенным.", эффект: { fatigue: 8, emotion: -5 }, контекст: { срочность: 0, конфликт: 0, хаос: 0, обучение: 1 } },
      { категория: "Внутреннее состояние сотрудника", текст: "Сотрудник жалуется на рутину и отсутствие развития.", эффект: { motivation: -7, emotion: -3 }, контекст: { срочность: 0, конфликт: 0, хаос: 0, обучение: 2 } },
      { категория: "Коллектив", текст: "Коллега ушёл на больничный, нагрузка выросла.", эффект: { fatigue: 7, emotion: -4, quality: -2 }, контекст: { срочность: 1, конфликт: 0, хаос: 1, обучение: 0 } },
      { категория: "Коллектив", текст: "В команде спор о распределении сложных задач.", эффект: { emotion: -6, motivation: -3 }, контекст: { срочность: 0, конфликт: 2, хаос: 0, обучение: 0 } },
      { категория: "Коллектив", текст: "Опытный коллега готов помочь при грамотном распределении.", эффект: { quality: 2, emotion: 2 }, контекст: { срочность: 0, конфликт: 0, хаос: 0, обучение: 1 } }
    ];

    const состояние = {
      ход: 0,
      максимумХодов: randomInt(НАСТРОЙКИ.минХодов, НАСТРОЙКИ.максХодов),
      motivation: 61,
      emotion: 58,
      quality: 60,
      fatigue: 24,
      burnoutRisk: 10,
      обучениеБонус: 0,
      стабильностьБонус: 0,
      перегревШтраф: 0,
      критСерия: { motivation: 0, emotion: 0 },
      критическиеСостояния: 0,
      поддерживающие: 0,
      директивные: 0,
      история: [],
      текущееСобытие: null,
      завершено: false
    };

    const $ = (id) => document.getElementById(id);
    const ограничить = (v) => Math.max(0, Math.min(100, Math.round(v)));

    function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function ui() {
      return {
        motivation: $("motivation"), emotion: $("emotion"), quality: $("quality"), fatigue: $("fatigue"),
        motivationBar: $("motivationBar"), emotionBar: $("emotionBar"), qualityBar: $("qualityBar"), fatigueBar: $("fatigueBar"),
        message: $("message"), status: $("status"), sprite: $("characterSprite"), actions: document.querySelector(".actions")
      };
    }

    function применить(эффект) {
      Object.entries(эффект).forEach(([k, v]) => { if (typeof состояние[k] === "number") состояние[k] += v; });
    }

    function модификатор(actionId, контекст) {
      if (!контекст) return 0;
      if (actionId === "speedUpPace") return контекст.срочность * 2 - контекст.конфликт;
      if (actionId === "trainAndExplain") return контекст.обучение * 3 - контекст.срочность * 2;
      if (actionId === "personalTalk") return контекст.конфликт * 2 - контекст.срочность;
      if (actionId === "redistributeLoad") return контекст.хаос * 2 - контекст.срочность;
      if (actionId === "correctiveFeedback") return контекст.срочность + (контекст.хаос > 1 ? 1 : 0) - контекст.конфликт;
      if (actionId === "praiseEmployee") return контекст.конфликт + контекст.обучение - контекст.срочность;
      return 0;
    }

    function качество(корр = 0, контекст = { срочность: 0, хаос: 0 }) {
      const база = 0.58 * состояние.motivation + 0.42 * состояние.emotion;
      const штрафУсталости = Math.max(0, состояние.fatigue - 50) * 0.5;
      const штрафВыгорания = состояние.burnoutRisk * 0.24;
      const бонус = состояние.обучениеБонус * 0.9 + состояние.стабильностьБонус * 0.7;
      const штраф = состояние.перегревШтраф * 0.9 + контекст.хаос * 1.2 + контекст.срочность * 0.7;
      состояние.quality = ограничить(база - штрафУсталости - штрафВыгорания + бонус - штраф + корр);
    }

    function критичность() {
      состояние.критСерия.motivation = состояние.motivation <= НАСТРОЙКИ.критПорог ? состояние.критСерия.motivation + 1 : 0;
      состояние.критСерия.emotion = состояние.emotion <= НАСТРОЙКИ.критПорог ? состояние.критСерия.emotion + 1 : 0;
      if (состояние.motivation <= НАСТРОЙКИ.критПорог || состояние.emotion <= НАСТРОЙКИ.критПорог || состояние.fatigue >= 82) состояние.критическиеСостояния += 1;
      if (состояние.критСерия.motivation >= 2 || состояние.критСерия.emotion >= 2) {
        состояние.burnoutRisk += 5;
        состояние.перегревШтраф += 1;
      }
    }

    function нормализовать() {
      ["motivation", "emotion", "fatigue", "burnoutRisk", "обучениеБонус", "стабильностьБонус", "перегревШтраф"].forEach((k) => {
        состояние[k] = ограничить(состояние[k]);
      });
    }

    function состояниеСпрайта() {
      if (состояние.fatigue >= 80 || состояние.burnoutRisk >= 70) return "tired";
      if (состояние.emotion <= 18 || состояние.motivation <= 18) return "angry";
      if (состояние.emotion <= 35 || состояние.motivation <= 35 || состояние.fatigue >= 62) return "stressed";
      if (состояние.motivation >= 72 && состояние.emotion >= 72 && состояние.fatigue < 45) return "happy";
      return "neutral";
    }

    function отрисовать(э) {
      if (э.motivation) э.motivation.textContent = состояние.motivation;
      if (э.emotion) э.emotion.textContent = состояние.emotion;
      if (э.quality) э.quality.textContent = состояние.quality;
      if (э.fatigue) э.fatigue.textContent = состояние.fatigue;
      if (э.motivationBar) э.motivationBar.value = состояние.motivation;
      if (э.emotionBar) э.emotionBar.value = состояние.emotion;
      if (э.qualityBar) э.qualityBar.value = состояние.quality;
      if (э.fatigueBar) э.fatigueBar.value = состояние.fatigue;
      if (э.sprite) {
        э.sprite.onerror = () => { э.sprite.onerror = null; э.sprite.src = SVG_СПРАЙТ; };
        э.sprite.src = СПРАЙТЫ[состояниеСпрайта()] || SVG_СПРАЙТ;
      }
    }

    function завершить(э) {
      состояние.завершено = true;
      if (э.status) э.status.textContent = "Симуляция завершена. Нажмите, чтобы начать новую смену.";
      if (э.actions) э.actions.innerHTML = '<button type="button" onclick="window.location.reload()">Начать новую смену</button>';
    }

    function следующийХод(э) {
      состояние.текущееСобытие = СОБЫТИЯ[randomInt(0, СОБЫТИЯ.length - 1)];
      применить(состояние.текущееСобытие.эффект);
      качество(0, состояние.текущееСобытие.контекст);
      нормализовать();
      отрисовать(э);
      if (э.message) э.message.innerHTML = `<strong>${состояние.текущееСобытие.категория}.</strong> ${состояние.текущееСобытие.текст}`;
      if (э.status) э.status.textContent = `Ход ${состояние.ход + 1} из ${состояние.максимумХодов}. Выберите управленческое действие.`;
    }

    function нажать(э, действие) {
      if (состояние.завершено) return;
      применить(действие.эффект);
      if (действие.id === "trainAndExplain") состояние.обучениеБонус += 3;
      if (действие.id === "personalTalk" || действие.id === "redistributeLoad") состояние.стабильностьБонус += 2;
      if (действие.id === "speedUpPace") состояние.перегревШтраф += 2;
      if (действие.id === "correctiveFeedback") состояние.перегревШтраф += 1;
      if (действие.тип === "поддерживающее") состояние.поддерживающие += 1; else состояние.директивные += 1;
      критичность();
      const контекст = состояние.текущееСобытие?.контекст || { срочность: 0, конфликт: 0, хаос: 0, обучение: 0 };
      качество(действие.кКачеству + модификатор(действие.id, контекст), контекст);
      состояние.стабильностьБонус = Math.max(0, состояние.стабильностьБонус - 0.15);
      состояние.перегревШтраф = Math.max(0, состояние.перегревШтраф - 0.05);
      нормализовать();
      отрисовать(э);
      состояние.ход += 1;
      if (состояние.ход >= состояние.максимумХодов) return завершить(э);
      следующийХод(э);
    }

    function init() {
      const э = ui();
      if (!э.actions || !э.sprite || !э.message) return;
      э.actions.innerHTML = "";
      ДЕЙСТВИЯ.forEach((д) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = д.label;
        b.addEventListener("click", () => нажать(э, д));
        э.actions.appendChild(b);
      });
      качество();
      нормализовать();
      отрисовать(э);
      следующийХод(э);
      global.__TAMAGOCHI_READY__ = true;
    }

    return init;
  }

  global.ТамагочиИнициализация = создатьДвижок();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => global.ТамагочиИнициализация());
  } else {
    global.ТамагочиИнициализация();
  }
})(window);
