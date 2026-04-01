import {
  FileText,
  House,
  Landmark,
  HeartPulse,
  BusFront,
  Users,
} from "lucide-react";

export const checklistCategories = [
  {
    id: "documents",
    title: "Documents",
    progress: 33,
    icon: FileText,
    colorClass: "documents",
  },
  {
    id: "housing",
    title: "Housing",
    progress: 0,
    icon: House,
    colorClass: "housing",
  },
  {
    id: "banking",
    title: "Banking",
    progress: 0,
    icon: Landmark,
    colorClass: "banking",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    progress: 0,
    icon: HeartPulse,
    colorClass: "healthcare",
  },
  {
    id: "transport",
    title: "Transport",
    progress: 0,
    icon: BusFront,
    colorClass: "transport",
  },
  {
    id: "social",
    title: "Social",
    progress: 0,
    icon: Users,
    colorClass: "social",
  },
];

export const checklistTasks = {
  documents: [
    {
      id: 1,
      title: "Migration Registration",
      description:
        "Register at the migration police within 3 business days of arrival. Your university may handle this for you.",
      completed: false,
    },
    {
      id: 2,
      title: "Get Student ID",
      description:
        "Obtain your university student card from the dean's office (dekanat).",
      completed: true,
    },
    {
      id: 3,
      title: "Prepare Passport Copies",
      description:
        "Keep printed and digital copies of your passport, visa, and migration card for important procedures.",
      completed: false,
    },
  ],
  housing: [
    {
      id: 1,
      title: "Move Into Dormitory or Apartment",
      description:
        "Check into your dormitory or finalize your apartment rental agreement.",
      completed: false,
    },
    {
      id: 2,
      title: "Understand House Rules",
      description:
        "Ask about dormitory quiet hours, visitors, laundry, and kitchen rules.",
      completed: false,
    },
    {
      id: 3,
      title: "Set Up Essentials",
      description:
        "Buy bedding, toiletries, dishes, and basic supplies for your room.",
      completed: false,
    },
  ],
  banking: [
    {
      id: 1,
      title: "Get IIN",
      description:
        "Apply for your Individual Identification Number (IIN) at the Public Service Center.",
      completed: false,
    },
    {
      id: 2,
      title: "Open a Bank Account",
      description:
        "Use your passport and IIN to open a local student-friendly bank account.",
      completed: false,
    },
    {
      id: 3,
      title: "Install a Payment App",
      description:
        "Set up Kaspi or another local payment app for daily expenses and transfers.",
      completed: false,
    },
  ],
  healthcare: [
    {
      id: 1,
      title: "Find a Nearby Clinic",
      description:
        "Learn which clinic or student medical center is closest to your accommodation.",
      completed: false,
    },
    {
      id: 2,
      title: "Check Insurance Coverage",
      description:
        "Understand what your medical insurance covers in Kazakhstan.",
      completed: false,
    },
    {
      id: 3,
      title: "Save Emergency Numbers",
      description:
        "Store emergency phone numbers like 103 for ambulance and 112 for unified emergency help.",
      completed: false,
    },
  ],
  transport: [
    {
      id: 1,
      title: "Get a Transport Card",
      description:
        "Buy a local transport card for buses or public transport in your city.",
      completed: false,
    },
    {
      id: 2,
      title: "Download 2GIS",
      description:
        "Use 2GIS to navigate routes, stops, and important places around you.",
      completed: false,
    },
    {
      id: 3,
      title: "Learn Your University Route",
      description:
        "Practice your route from home to campus before classes begin.",
      completed: false,
    },
  ],
  social: [
    {
      id: 1,
      title: "Meet Your Buddy",
      description:
        "Arrange your first meeting with your local buddy to ask questions and get support.",
      completed: false,
    },
    {
      id: 2,
      title: "Join Student Chats",
      description:
        "Join Telegram or WhatsApp groups for your faculty, dormitory, or university community.",
      completed: false,
    },
    {
      id: 3,
      title: "Attend an Orientation Event",
      description:
        "Take part in a student orientation event or welcome session to meet people.",
      completed: false,
    },
  ],
};