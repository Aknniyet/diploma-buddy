import {
  getChecklistTasksByUserId,
  insertChecklistTask,
  updateChecklistTaskMetadata,
} from "../repositories/checklistRepository.js";

export const defaultChecklistTasks = [
  {
    category: "documents",
    title: "Migration Registration",
    description: "Confirm your migration registration soon after arrival and keep the confirmation safe.",
    priority: "high",
    timeframe: "First 3 days",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "documents",
    title: "Check Visa and Stay Validity",
    description: "Double-check your visa dates or allowed stay period so you do not miss any deadlines.",
    priority: "high",
    timeframe: "Arrival week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "documents",
    title: "Get Student ID",
    description: "Collect your student ID from the university office or dean's office and keep it with you on campus.",
    priority: "high",
    timeframe: "First week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "documents",
    title: "Prepare Passport Copies",
    description: "Keep printed and digital copies of your passport, visa, and important university documents.",
    priority: "medium",
    timeframe: "First week",
  },
  {
    category: "documents",
    title: "Save International Office Contact",
    description: "Store the international office email, room number, and working hours for quick help later.",
    priority: "medium",
    timeframe: "First week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "housing",
    title: "Move Into Dormitory or Apartment",
    description: "Confirm your room, rental details, and the basic move-in steps for your new accommodation.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "housing",
    title: "Understand House Rules",
    description: "Learn the important dormitory or apartment rules, including quiet hours and visitor policies.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "housing",
    title: "Set Up Essentials",
    description: "Buy the basic items you need for daily life such as bedding, dishes, and hygiene supplies.",
    priority: "medium",
    timeframe: "First week",
  },
  {
    category: "housing",
    title: "Save Dormitory or Landlord Contact",
    description: "Keep the contact details of the dormitory manager, administrator, or landlord in your phone.",
    priority: "medium",
    timeframe: "First week",
  },
  {
    category: "housing",
    title: "Check Payment and Laundry Process",
    description: "Learn how monthly payments, laundry, kitchen access, and shared facilities work where you live.",
    priority: "medium",
    timeframe: "First 2 weeks",
  },
  {
    category: "banking",
    title: "Get IIN",
    description: "Apply for an Individual Identification Number if you still need one for banking and other services.",
    priority: "high",
    timeframe: "First week",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "banking",
    title: "Open a Bank Account",
    description: "Set up a local bank account for payments, transfers, and everyday student expenses.",
    priority: "high",
    timeframe: "First 2 weeks",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "banking",
    title: "Install a Payment App",
    description: "Install a local payment app such as Kaspi.kz for easier transfers, shopping, and QR payments.",
    priority: "medium",
    timeframe: "First 2 weeks",
  },
  {
    category: "banking",
    title: "Learn QR and Card Payments",
    description: "Get comfortable with paying by QR, card, and cashless transfer in shops, canteens, and taxis.",
    priority: "medium",
    timeframe: "First 2 weeks",
  },
  {
    category: "banking",
    title: "Keep Emergency Cash for First Days",
    description: "Keep a small amount of cash for transport, food, or documents in case online payments fail.",
    priority: "medium",
    timeframe: "Arrival week",
  },
  {
    category: "healthcare",
    title: "Find a Nearby Clinic",
    description: "Identify the clinic or university medical center you can use if you feel unwell.",
    priority: "high",
    timeframe: "First 2 weeks",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "healthcare",
    title: "Check Insurance Coverage",
    description: "Review what your insurance covers in Kazakhstan and what documents you may need for treatment.",
    priority: "high",
    timeframe: "First 2 weeks",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "healthcare",
    title: "Save Emergency Numbers",
    description: "Store emergency phone numbers such as 112 and 103 so you can reach help quickly if needed.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "healthcare",
    title: "Locate the Nearest Pharmacy",
    description: "Find a pharmacy near your dormitory or apartment for quick access to medicine and essentials.",
    priority: "medium",
    timeframe: "First 2 weeks",
  },
  {
    category: "healthcare",
    title: "Learn Where the University Medical Point Is",
    description: "Check if there is a campus medical point or student clinic and save its location.",
    priority: "medium",
    timeframe: "First month",
    actionLabel: "Read guide",
    actionUrl: "/guide",
  },
  {
    category: "transport",
    title: "Get a Transport Card",
    description: "Buy or activate a local transport card for buses or other public transport in your city.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "transport",
    title: "Download 2GIS",
    description: "Install 2GIS or another maps app to navigate routes, stops, and key places around you.",
    priority: "high",
    timeframe: "Arrival week",
  },
  {
    category: "transport",
    title: "Learn Your University Route",
    description: "Practice the route from your accommodation to campus before a busy study day starts.",
    priority: "high",
    timeframe: "First week",
  },
  {
    category: "transport",
    title: "Save Taxi and Bus Apps",
    description: "Install the local taxi and bus apps you may need in bad weather or late evenings.",
    priority: "medium",
    timeframe: "First 2 weeks",
  },
  {
    category: "transport",
    title: "Practice the Route to Key Services",
    description: "Find how to reach the PSC, supermarket, pharmacy, and dormitory from campus without stress.",
    priority: "medium",
    timeframe: "First month",
  },
  {
    category: "social",
    title: "Meet Your Buddy",
    description: "Arrange your first conversation or meeting with your buddy and ask your first practical questions.",
    priority: "high",
    timeframe: "First week",
    actionLabel: "Find a buddy",
    actionUrl: "/student/find-buddies",
  },
  {
    category: "social",
    title: "Join Student Chats",
    description: "Join student Telegram or WhatsApp groups so you do not miss announcements and informal support.",
    priority: "high",
    timeframe: "Arrival week",
    actionLabel: "Open community",
    actionUrl: "/student/community",
  },
  {
    category: "social",
    title: "Attend an Orientation Event",
    description: "Take part in a welcome or orientation event and meet other students in a low-pressure setting.",
    priority: "medium",
    timeframe: "First month",
    actionLabel: "Open events",
    actionUrl: "/student/events",
  },
  {
    category: "social",
    title: "Introduce Yourself in a Student Chat",
    description: "Post a short introduction or question in a student chat to make your first connection easier.",
    priority: "medium",
    timeframe: "First 2 weeks",
    actionLabel: "Open community",
    actionUrl: "/student/community",
  },
  {
    category: "social",
    title: "Visit One Club or Community Event",
    description: "Try at least one student club, meetup, or informal event to feel more connected on campus.",
    priority: "medium",
    timeframe: "First month",
    actionLabel: "Open events",
    actionUrl: "/student/events",
  },
];

export async function ensureChecklist(userId) {
  const existing = await getChecklistTasksByUserId(userId);
  const existingTitles = new Set(existing.rows.map((task) => task.title));

  for (const task of defaultChecklistTasks) {
    if (!existingTitles.has(task.title)) {
      await insertChecklistTask(userId, task);
    } else {
      await updateChecklistTaskMetadata(userId, task);
    }
  }
}

export function sortChecklistTasks(tasks) {
  const orderMap = new Map(
    defaultChecklistTasks.map((task, index) => [task.title, index])
  );

  return [...tasks].sort((first, second) => {
    const firstOrder = orderMap.get(first.title) ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = orderMap.get(second.title) ?? Number.MAX_SAFE_INTEGER;
    return firstOrder - secondOrder;
  });
}
