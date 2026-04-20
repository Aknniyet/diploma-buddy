import {
  BadgeCheck,
  Banknote,
  Bus,
  CloudSun,
  FileText,
  HeartPulse,
  Home,
  Languages,
  MapPinned,
  MessageCircle,
  Plane,
  School,
  ShieldAlert,
  Smartphone,
  Users,
} from "lucide-react";

export const quickStartSteps = [
  {
    number: "1",
    icon: MessageCircle,
    titleKey: "guide.quickStart.steps.office.title",
    textKey: "guide.quickStart.steps.office.text",
  },
  {
    number: "2",
    icon: Smartphone,
    titleKey: "guide.quickStart.steps.sim.title",
    textKey: "guide.quickStart.steps.sim.text",
  },
  {
    number: "3",
    icon: ShieldAlert,
    titleKey: "guide.quickStart.steps.emergency.title",
    textKey: "guide.quickStart.steps.emergency.text",
  },
  {
    number: "4",
    icon: MapPinned,
    titleKey: "guide.quickStart.steps.apps.title",
    textKey: "guide.quickStart.steps.apps.text",
  },
  {
    number: "5",
    icon: Users,
    titleKey: "guide.quickStart.steps.buddy.title",
    textKey: "guide.quickStart.steps.buddy.text",
    featured: true,
  },
];

export const roadmapSteps = [
  {
    number: "01",
    titleKey: "guide.roadmap.before.title",
    textKey: "guide.roadmap.before.text",
  },
  {
    number: "02",
    titleKey: "guide.roadmap.arrival.title",
    textKey: "guide.roadmap.arrival.text",
  },
  {
    number: "03",
    titleKey: "guide.roadmap.week.title",
    textKey: "guide.roadmap.week.text",
  },
  {
    number: "04",
    titleKey: "guide.roadmap.month.title",
    textKey: "guide.roadmap.month.text",
  },
];

export const guideSections = [
  {
    icon: Plane,
    tagKey: "guide.tags.before",
    titleKey: "guide.sections.beforeArrival.title",
    subtitleKey: "guide.sections.beforeArrival.subtitle",
    items: [
      {
        titleKey: "guide.sections.beforeArrival.items.documents.title",
        contentKey: "guide.sections.beforeArrival.items.documents.content",
      },
      {
        titleKey: "guide.sections.beforeArrival.items.contacts.title",
        contentKey: "guide.sections.beforeArrival.items.contacts.content",
      },
      {
        titleKey: "guide.sections.beforeArrival.items.weather.title",
        contentKey: "guide.sections.beforeArrival.items.weather.content",
      },
    ],
  },
  {
    icon: FileText,
    tagKey: "guide.tags.required",
    titleKey: "guide.sections.documents.title",
    subtitleKey: "guide.sections.documents.subtitle",
    items: [
      {
        titleKey: "guide.sections.documents.items.registration.title",
        contentKey: "guide.sections.documents.items.registration.content",
      },
      {
        titleKey: "guide.sections.documents.items.iin.title",
        contentKey: "guide.sections.documents.items.iin.content",
      },
      {
        titleKey: "guide.sections.documents.items.copies.title",
        contentKey: "guide.sections.documents.items.copies.content",
      },
    ],
  },
  {
    icon: Home,
    tagKey: "guide.tags.dailyLife",
    titleKey: "guide.sections.housing.title",
    subtitleKey: "guide.sections.housing.subtitle",
    items: [
      {
        titleKey: "guide.sections.housing.items.dormitory.title",
        contentKey: "guide.sections.housing.items.dormitory.content",
      },
      {
        titleKey: "guide.sections.housing.items.renting.title",
        contentKey: "guide.sections.housing.items.renting.content",
      },
      {
        titleKey: "guide.sections.housing.items.food.title",
        contentKey: "guide.sections.housing.items.food.content",
      },
    ],
  },
  {
    icon: Banknote,
    tagKey: "guide.tags.useful",
    titleKey: "guide.sections.money.title",
    subtitleKey: "guide.sections.money.subtitle",
    items: [
      {
        titleKey: "guide.sections.money.items.banking.title",
        contentKey: "guide.sections.money.items.banking.content",
      },
      {
        titleKey: "guide.sections.money.items.sim.title",
        contentKey: "guide.sections.money.items.sim.content",
      },
      {
        titleKey: "guide.sections.money.items.budget.title",
        contentKey: "guide.sections.money.items.budget.content",
      },
    ],
  },
  {
    icon: Bus,
    tagKey: "guide.tags.city",
    titleKey: "guide.sections.transport.title",
    subtitleKey: "guide.sections.transport.subtitle",
    items: [
      {
        titleKey: "guide.sections.transport.items.publicTransport.title",
        contentKey: "guide.sections.transport.items.publicTransport.content",
      },
      {
        titleKey: "guide.sections.transport.items.taxis.title",
        contentKey: "guide.sections.transport.items.taxis.content",
      },
      {
        titleKey: "guide.sections.transport.items.intercity.title",
        contentKey: "guide.sections.transport.items.intercity.content",
      },
    ],
  },
  {
    icon: HeartPulse,
    tagKey: "guide.tags.safety",
    titleKey: "guide.sections.health.title",
    subtitleKey: "guide.sections.health.subtitle",
    items: [
      {
        titleKey: "guide.sections.health.items.insurance.title",
        contentKey: "guide.sections.health.items.insurance.content",
      },
      {
        titleKey: "guide.sections.health.items.clinics.title",
        contentKey: "guide.sections.health.items.clinics.content",
      },
      {
        titleKey: "guide.sections.health.items.emergency.title",
        contentKey: "guide.sections.health.items.emergency.content",
      },
    ],
  },
  {
    icon: School,
    tagKey: "guide.tags.study",
    titleKey: "guide.sections.university.title",
    subtitleKey: "guide.sections.university.subtitle",
    items: [
      {
        titleKey: "guide.sections.university.items.portal.title",
        contentKey: "guide.sections.university.items.portal.content",
      },
      {
        titleKey: "guide.sections.university.items.advisor.title",
        contentKey: "guide.sections.university.items.advisor.content",
      },
      {
        titleKey: "guide.sections.university.items.rules.title",
        contentKey: "guide.sections.university.items.rules.content",
      },
    ],
  },
  {
    icon: Languages,
    tagKey: "guide.tags.culture",
    titleKey: "guide.sections.culture.title",
    subtitleKey: "guide.sections.culture.subtitle",
    items: [
      {
        titleKey: "guide.sections.culture.items.language.title",
        contentKey: "guide.sections.culture.items.language.content",
      },
      {
        titleKey: "guide.sections.culture.items.hospitality.title",
        contentKey: "guide.sections.culture.items.hospitality.content",
      },
      {
        titleKey: "guide.sections.culture.items.religion.title",
        contentKey: "guide.sections.culture.items.religion.content",
      },
    ],
  },
  {
    icon: ShieldAlert,
    tagKey: "guide.tags.safety",
    titleKey: "guide.sections.safety.title",
    subtitleKey: "guide.sections.safety.subtitle",
    items: [
      {
        titleKey: "guide.sections.safety.items.scams.title",
        contentKey: "guide.sections.safety.items.scams.content",
      },
      {
        titleKey: "guide.sections.safety.items.documents.title",
        contentKey: "guide.sections.safety.items.documents.content",
      },
      {
        titleKey: "guide.sections.safety.items.night.title",
        contentKey: "guide.sections.safety.items.night.content",
      },
    ],
  },
  {
    icon: CloudSun,
    tagKey: "guide.tags.wellbeing",
    titleKey: "guide.sections.wellbeing.title",
    subtitleKey: "guide.sections.wellbeing.subtitle",
    items: [
      {
        titleKey: "guide.sections.wellbeing.items.homesick.title",
        contentKey: "guide.sections.wellbeing.items.homesick.content",
      },
      {
        titleKey: "guide.sections.wellbeing.items.community.title",
        contentKey: "guide.sections.wellbeing.items.community.content",
      },
      {
        titleKey: "guide.sections.wellbeing.items.askHelp.title",
        contentKey: "guide.sections.wellbeing.items.askHelp.content",
      },
    ],
  },
];

export const guideStats = [
  {
    icon: BadgeCheck,
    valueKey: "guide.stats.verified.value",
    labelKey: "guide.stats.verified.label",
  },
  {
    icon: ShieldAlert,
    valueKey: "guide.stats.safety.value",
    labelKey: "guide.stats.safety.label",
  },
  {
    icon: Users,
    valueKey: "guide.stats.buddy.value",
    labelKey: "guide.stats.buddy.label",
  },
];
