function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function includesAny(message, keywords) {
  return keywords.some((keyword) => message.includes(keyword));
}

function detectLanguage(message) {
  return /[а-яёәғқңөұүһі]/i.test(message) ? "ru" : "en";
}

function isLocalBuddy(user) {
  return user?.role === "local";
}

function buildAction(labelEn, labelRu, path) {
  return { labelEn, labelRu, path };
}

const actionCatalog = {
  checklist: buildAction("Open checklist", "Открыть чеклист", "/student/checklist"),
  guide: buildAction("View guide", "Открыть гайд", "/guide"),
  studentEvents: buildAction("Open events", "Открыть события", "/student/events"),
  buddyEvents: buildAction("Open events", "Открыть события", "/buddy/events"),
  studentMessages: buildAction("Open messages", "Открыть сообщения", "/student/messages"),
  buddyMessages: buildAction("Open messages", "Открыть сообщения", "/buddy/messages"),
  findBuddies: buildAction("Find buddies", "Найти buddy", "/student/find-buddies"),
  community: buildAction("Open community", "Открыть сообщество", "/buddy/community"),
  buddyRequests: buildAction("Buddy requests", "Заявки buddy", "/buddy/buddy-requests"),
};

function localizeActions(actions, language) {
  return actions.map((action) => ({
    label: language === "ru" ? action.labelRu : action.labelEn,
    path: action.path,
  }));
}

function buildDefaultActions(user, language) {
  if (isLocalBuddy(user)) {
    return localizeActions(
      [actionCatalog.buddyEvents, actionCatalog.buddyMessages, actionCatalog.community],
      language
    );
  }

  return localizeActions(
    [actionCatalog.checklist, actionCatalog.studentEvents, actionCatalog.studentMessages],
    language
  );
}

const assistantIntents = [
  {
    intent: "buddy_unresponsive",
    keywords: [
      "ignores me",
      "ignore me",
      "not replying",
      "does not reply",
      "doesn't reply",
      "no response",
      "not responding",
      "ghost",
      "не отвечает",
      "игнор",
      "игнорирует",
      "нет ответа",
    ],
  },
  {
    intent: "iin",
    keywords: ["iin", "individual identification", "identification number", "иин"],
  },
  {
    intent: "sim",
    keywords: ["sim", "phone number", "mobile", "internet", "beeline", "tele2", "activ", "сим", "номер", "интернет", "связь"],
  },
  {
    intent: "bank",
    keywords: ["bank", "card", "kaspi", "payment", "money", "банк", "карта", "оплат"],
  },
  {
    intent: "documents",
    keywords: ["document", "passport", "visa", "migration", "registration", "документ", "паспорт", "виза", "миграц", "регистрац"],
  },
  {
    intent: "buddy",
    keywords: ["buddy", "match", "request", "connect", "find buddy", "бадди", "бадди", "матч", "заявк", "найти buddy", "найти бадди"],
  },
  {
    intent: "checklist",
    keywords: ["checklist", "task", "progress", "чеклист", "задач", "прогресс"],
  },
  {
    intent: "events",
    keywords: ["event", "orientation", "meeting", "activity", "tour", "ивент", "событ", "мероприят", "встреч", "тур"],
  },
  {
    intent: "housing",
    keywords: ["dormitory", "dorm", "housing", "apartment", "room", "общежит", "жиль", "квартира", "комнат"],
  },
  {
    intent: "transport",
    keywords: ["transport", "bus", "metro", "route", "2gis", "map", "транспорт", "автобус", "метро", "маршрут", "карта"],
  },
  {
    intent: "healthcare",
    keywords: ["health", "clinic", "doctor", "insurance", "emergency", "здоров", "клиник", "врач", "страхов", "экстр"],
  },
  {
    intent: "safety",
    keywords: ["safe", "safety", "scam", "lost", "police", "danger", "безопас", "мошен", "потерял", "потеряла", "полиция", "опас"],
  },
  {
    intent: "homesick",
    keywords: ["homesick", "lonely", "loneliness", "miss home", "stress", "anxious", "anxiety", "одинок", "скучаю", "стресс", "тревож"],
  },
  {
    intent: "language",
    keywords: ["language", "kazakh", "russian", "translate", "translation", "язык", "казах", "русск", "перевод"],
  },
  {
    intent: "culture",
    keywords: ["culture", "tradition", "etiquette", "custom", "respect", "культур", "традиц", "этикет", "обыча"],
  },
  {
    intent: "campus",
    keywords: ["campus", "building", "classroom", "library", "cafeteria", "canteen", "кампус", "здание", "аудитор", "библиот", "столов"],
  },
  {
    intent: "classes",
    keywords: ["class", "classes", "schedule", "teacher", "professor", "attendance", "курс", "пары", "распис", "преподав", "посещаем"],
  },
  {
    intent: "profile",
    keywords: ["profile", "photo", "bio", "interests", "edit profile", "профиль", "фото", "интерес", "био"],
  },
  {
    intent: "community",
    keywords: ["community", "post", "comment", "club", "friends", "сообщество", "пост", "коммент", "клуб", "друз"],
  },
];

function buildChecklistSummary(tasks = [], language = "en") {
  const incompleteTasks = tasks.filter((task) => !task.is_completed).slice(0, 3);

  if (incompleteTasks.length === 0) {
    return language === "ru"
      ? "Судя по данным платформы, обязательные шаги у тебя уже почти закрыты. Дальше лучше сосредоточиться на событиях, общении с buddy и бытовой адаптации."
      : "Based on your platform data, your core adaptation steps look mostly complete. Next, focus on events, buddy communication, and day-to-day adaptation.";
  }

  const taskList = incompleteTasks
    .map((task, index) => {
      const extras = [task.timeframe, task.priority].filter(Boolean).join(", ");
      return extras
        ? `${index + 1}. ${task.title} (${extras})`
        : `${index + 1}. ${task.title}`;
    })
    .join("\n");

  return language === "ru"
    ? `Вот ближайшие шаги из твоего чеклиста:\n${taskList}`
    : `These are the next useful steps from your checklist:\n${taskList}`;
}

function buildIntentReply(intent, user, checklistTasks, language) {
  const checklistSummary = buildChecklistSummary(checklistTasks, language);

  switch (intent) {
    case "buddy_unresponsive":
      return {
        answer:
          language === "ru"
            ? "Если buddy не отвечает, сначала напиши короткое вежливое сообщение ещё раз и дай ему немного времени. Если ответа всё равно нет, ты можешь продолжить поиск другого buddy через страницу Find Buddies или написать администратору/International Office вне платформы. На платформе нет отдельной страницы для жалоб или report, поэтому я не буду направлять тебя туда."
            : "If your buddy is not replying, send one short polite follow-up and give them a little time. If there is still no response, you can look for another buddy on the Find Buddies page or contact the administrator/International Office outside the platform. There is no separate report page in this platform, so I should not direct you to one.",
        actions: localizeActions([actionCatalog.studentMessages, actionCatalog.findBuddies], language),
      };
    case "iin":
      return {
        answer:
          language === "ru"
            ? `ИИН обычно нужен для банка, SIM-карты и части местных сервисов в Казахстане. Сначала проверь раздел с документами и банковскими шагами в платформе.\n\n${checklistSummary}`
            : `IIN is usually needed for banking, SIM cards, and several local services in Kazakhstan. Start with the documents and banking-related steps inside the platform.\n\n${checklistSummary}`,
        actions: localizeActions([actionCatalog.checklist, actionCatalog.guide], language),
      };
    case "bank":
      return {
        answer:
          language === "ru"
            ? `Для открытия банковского счёта студентам чаще всего нужны удостоверяющие документы и ИИН. Я бы рекомендовал сначала закрыть шаги по документам, а затем переходить к банку.\n\n${checklistSummary}`
            : `To open a bank account, students usually need identification documents and an IIN. I would first complete the document-related steps and then move to banking.\n\n${checklistSummary}`,
        actions: localizeActions([actionCatalog.checklist], language),
      };
    case "sim":
      return {
        answer:
          language === "ru"
            ? "Для SIM-карты обычно стоит подготовить паспорт, проверить наличие ИИН, выбрать тариф с достаточным интернетом и сохранить номер в профиле/контактах. Если не уверен, какой оператор удобнее, спроси buddy о покрытии рядом с кампусом и общежитием."
            : "For a SIM card, prepare your passport, check whether you need an IIN, choose a plan with enough mobile data, and save your new number in your contacts. If you are unsure which provider is convenient, ask your buddy about coverage near campus and your dorm or apartment.",
        actions: localizeActions([actionCatalog.studentMessages, actionCatalog.checklist], language),
      };
    case "documents":
      return {
        answer:
          language === "ru"
            ? `По документам лучше держать под рукой паспорт, визовые и регистрационные бумаги, а также студенческие данные. Самый безопасный путь здесь идти по чеклисту платформы и уточнять спорные требования у international office.\n\n${checklistSummary}`
            : `For documents, keep your passport, visa or migration papers, and student-related records ready. The safest path is to follow the platform checklist and confirm any official requirement with the international office.\n\n${checklistSummary}`,
        actions: localizeActions([actionCatalog.checklist, actionCatalog.guide], language),
      };
    case "buddy":
      if (isLocalBuddy(user)) {
        return {
          answer:
            language === "ru"
              ? "Как local buddy, ты можешь принимать запросы, отвечать студентам в сообщениях и помогать им с адаптацией по шагам. Если хочешь быстрее включиться, проверь новые запросы и события."
              : "As a local buddy, you can review requests, reply to students in messages, and support them with adaptation steps. A good next move is to check new requests and upcoming events.",
          actions: localizeActions([actionCatalog.buddyRequests, actionCatalog.buddyMessages], language),
        };
      }

      return {
        answer:
          language === "ru"
            ? "Ты можешь открыть список buddy, отправить заявку подходящему человеку и после одобрения продолжить общение в сообщениях. Если не знаешь, кого выбрать, ориентируйся на язык, интересы и описание профиля."
            : "You can open the buddy list, send a request to someone suitable, and continue in messages after approval. If you are unsure whom to choose, compare language, interests, and profile description.",
        actions: localizeActions([actionCatalog.findBuddies, actionCatalog.studentMessages], language),
      };
    case "checklist":
      return {
        answer:
          language === "ru"
            ? `Чеклист показывает, какие адаптационные шаги уже закрыты и что лучше сделать следующим. ${checklistSummary}`
            : `The checklist shows which adaptation steps are already done and what is worth doing next. ${checklistSummary}`,
        actions: localizeActions([actionCatalog.checklist], language),
      };
    case "events":
      return {
        answer:
          language === "ru"
            ? "События помогают быстрее познакомиться с кампусом, студентами и buddy-сообществом. Лучше всего регулярно проверять раздел Events и приходить хотя бы на ближайшие встречи."
            : "Events help you get comfortable with campus, other students, and the buddy community faster. The best next step is to keep an eye on the Events page and join the nearest activities.",
        actions: isLocalBuddy(user)
          ? localizeActions([actionCatalog.buddyEvents], language)
          : localizeActions([actionCatalog.studentEvents], language),
      };
    case "housing":
      return {
        answer:
          language === "ru"
            ? "По жилью стоит заранее подтвердить адрес, контакты, правила проживания и маршрут до университета. Если часть бытовых шагов ещё не закрыта, удобнее пройти их через чеклист."
            : "For housing, it helps to confirm your address, contacts, accommodation rules, and route to the university in advance. If your day-to-day setup is still incomplete, the checklist is the best place to track it.",
        actions: buildDefaultActions(user, language),
      };
    case "transport":
      return {
        answer:
          language === "ru"
            ? "По транспорту начни с маршрута до университета, сохранённых карт и удобного способа оплаты. Хорошая практика на первых днях заранее проверить дорогу до кампуса и обратно."
            : "For transport, start with your route to the university, saved maps, and a practical payment method. In the first days, it is helpful to test the route to and from campus in advance.",
        actions: buildDefaultActions(user, language),
      };
    case "healthcare":
      return {
        answer:
          language === "ru"
            ? "По медицине лучше заранее понять, какая у тебя страховка, куда обращаться за помощью и какие экстренные номера сохранить. Если вопрос официальный, лучше уточнить его у администрации университета или страховой."
            : "For healthcare, it is best to understand your insurance coverage, where to go for help, and which emergency numbers to save. If the question is official, confirm it with the university or your insurer.",
        actions: buildDefaultActions(user, language),
      };
    case "safety":
      return {
        answer:
          language === "ru"
            ? "Если ситуация срочная или небезопасная, сразу обращайся в местные экстренные службы, охрану кампуса или к администрации университета. Для обычных бытовых вопросов: не отправляй деньги незнакомым людям, проверяй адреса и документы, держи копии паспорта отдельно и попроси buddy помочь оценить ситуацию."
            : "If the situation is urgent or unsafe, contact local emergency services, campus security, or university administration immediately. For everyday safety: do not send money to strangers, double-check addresses and documents, keep passport copies separately, and ask your buddy to help you assess the situation.",
        actions: localizeActions([actionCatalog.studentMessages, actionCatalog.guide], language),
      };
    case "homesick":
      return {
        answer:
          language === "ru"
            ? "Это нормально чувствовать одиночество или стресс в новой стране. Попробуй сделать один маленький социальный шаг: написать buddy, сходить на ближайшее событие или присоединиться к студенческой активности. Если состояние тяжёлое или длится долго, лучше обратиться в студенческую поддержку или International Office."
            : "It is normal to feel lonely or stressed in a new country. Try one small social step: message your buddy, join an upcoming event, or take part in a student activity. If it feels heavy or lasts a long time, contact student support or the International Office.",
        actions: localizeActions([actionCatalog.studentMessages, actionCatalog.studentEvents], language),
      };
    case "language":
      return {
        answer:
          language === "ru"
            ? "Если сложно с языком, начни с фраз для повседневных ситуаций: транспорт, еда, адрес, документы и университет. В сообщениях можно попросить buddy объяснить местные слова или помочь сформулировать вопрос для администрации."
            : "If language feels difficult, start with phrases for everyday situations: transport, food, addresses, documents, and university offices. You can message your buddy to explain local words or help you phrase a question for administration.",
        actions: localizeActions([actionCatalog.studentMessages, actionCatalog.guide], language),
      };
    case "culture":
      return {
        answer:
          language === "ru"
            ? "Для культурной адаптации лучше наблюдать, спрашивать и быть вежливым, когда что-то непонятно. Хорошие темы для buddy: как здороваться, как вести себя в гостях, что принято в университете и какие местные привычки стоит знать."
            : "For cultural adaptation, observe, ask, and stay polite when something is unclear. Good topics for your buddy are greetings, visiting etiquette, university norms, and local habits worth knowing.",
        actions: localizeActions([actionCatalog.studentMessages, actionCatalog.studentEvents], language),
      };
    case "campus":
      return {
        answer:
          language === "ru"
            ? "Для ориентации на кампусе сначала найди свои основные точки: учебные корпуса, библиотеку, столовую, International Office и дорогу домой. Если есть события или туры, они помогут быстрее привыкнуть к маршрутам."
            : "For campus orientation, first locate your main places: academic buildings, library, cafeteria, International Office, and your route home. If there are events or tours, they can help you learn the routes faster.",
        actions: localizeActions([actionCatalog.studentEvents, actionCatalog.studentMessages], language),
      };
    case "classes":
      return {
        answer:
          language === "ru"
            ? "По учёбе начни с расписания, аудиторий, правил посещаемости и контактов преподавателей. Если что-то официальное непонятно, уточни у координатора программы или в офисе университета; buddy может помочь с бытовым контекстом, но не заменяет администрацию."
            : "For classes, start with your schedule, classrooms, attendance rules, and instructor contacts. If an official rule is unclear, confirm it with your program coordinator or university office; your buddy can help with everyday context but does not replace administration.",
        actions: localizeActions([actionCatalog.checklist, actionCatalog.studentMessages], language),
      };
    case "profile":
      return {
        answer:
          language === "ru"
            ? "Хороший профиль помогает buddy быстрее понять, чем тебе помочь. Добавь понятное фото, языки, интересы, страну и короткое описание того, с чем нужна поддержка: кампус, документы, жильё, транспорт или общение."
            : "A good profile helps buddies understand how to support you. Add a clear photo, languages, interests, home country, and a short note about what you need help with: campus, documents, housing, transport, or social adaptation.",
        actions: localizeActions([actionCatalog.findBuddies], language),
      };
    case "community":
      return {
        answer:
          language === "ru"
            ? "Сообщество полезно для неформальных вопросов, поиска активности и знакомства с другими студентами. Если вопрос личный или касается твоего buddy, лучше использовать Messages; если вопрос общий, события и community помогут быстрее найти людей."
            : "Community is useful for informal questions, activities, and meeting other students. If the question is personal or about your buddy, use Messages; if it is general, events and community can help you find people faster.",
        actions: buildDefaultActions(user, language),
      };
    default:
      return null;
  }
}

function buildChecklistAnswer(tasks = []) {
  const incompleteTasks = tasks.filter((task) => !task.is_completed).slice(0, 3);

  if (incompleteTasks.length === 0) {
    return {
      answer:
        "Great job! Your checklist looks complete. You can continue by joining events, communicating with your buddy, and checking useful information.",
      actions: [
        { label: "Open events", path: "/student/events" },
        { label: "Open messages", path: "/student/messages" },
      ],
    };
  }

  const taskList = incompleteTasks
    .map((task, index) => `${index + 1}. ${task.title}`)
    .join("\n");

  return {
    answer: `Based on your checklist, your next recommended steps are:\n${taskList}`,
    actions: [{ label: "Open checklist", path: "/student/checklist" }],
  };
}

export function generateAssistantReply(message, user, checklistTasks = []) {
  const normalizedMessage = normalizeText(message);
  const language = detectLanguage(normalizedMessage);

  if (!normalizedMessage) {
    return {
      answer:
        language === "ru"
          ? "Напиши вопрос, и я постараюсь подсказать следующий полезный шаг."
          : "Please write your question, and I will try to guide you.",
      intent: "empty",
      actions: [],
    };
  }

  const matchedIntent = assistantIntents.find((item) =>
    includesAny(normalizedMessage, item.keywords)
  );

  if (matchedIntent) {
    const reply = buildIntentReply(matchedIntent.intent, user, checklistTasks, language);

    return {
      intent: matchedIntent.intent,
      answer: reply.answer,
      actions: reply.actions,
    };
  }

  if (
    includesAny(normalizedMessage, [
      "what should i do",
      "next step",
      "next steps",
      "what next",
      "recommend",
    ])
  ) {
    const checklistAnswer = buildChecklistAnswer(checklistTasks);

    return {
      intent: "next_steps",
      answer:
        language === "ru"
          ? buildChecklistSummary(checklistTasks, language)
          : checklistAnswer.answer,
      actions: isLocalBuddy(user)
        ? buildDefaultActions(user, language)
        : localizeActions([actionCatalog.checklist], language),
    };
  }

  const roleText =
    language === "ru"
      ? user?.role === "local"
        ? "Как local buddy, ты можешь помогать студентам через заявки, сообщения, события и сообщество."
        : "Как international student, ты можешь использовать чеклист, искать buddy, смотреть события и писать в сообщения."
      : user?.role === "local"
        ? "As a local buddy, you can support students through requests, messages, events, and community activities."
        : "As an international student, you can use the checklist, find a buddy, view events, and message your buddy.";

  const fallbackTail =
    language === "ru"
      ? checklistTasks.length > 0
        ? `\n\n${buildChecklistSummary(checklistTasks, language)}`
        : "\n\nЕсли хочешь, спроси про ИИН, документы, банк, жильё, транспорт, события или поиск buddy."
      : checklistTasks.length > 0
        ? `\n\n${buildChecklistSummary(checklistTasks, language)}`
        : "\n\nIf you want, ask about IIN, documents, banking, housing, transport, events, or buddy matching.";

  return {
    intent: "fallback",
    answer:
      language === "ru"
        ? `${roleText} Я не вижу точного совпадения по теме, но могу помочь с адаптацией, документами, событиями, чеклистом и buddy matching.${fallbackTail}`
        : `${roleText} I could not find an exact topic match, but I can still help with adaptation, documents, events, checklist progress, and buddy matching.${fallbackTail}`,
    actions: buildDefaultActions(user, language),
  };
}
