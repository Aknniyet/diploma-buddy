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
    icon: FileText,
    colorClass: "documents",
  },
  {
    id: "housing",
    title: "Housing",
    icon: House,
    colorClass: "housing",
  },
  {
    id: "banking",
    title: "Banking",
    icon: Landmark,
    colorClass: "banking",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    icon: HeartPulse,
    colorClass: "healthcare",
  },
  {
    id: "transport",
    title: "Transport",
    icon: BusFront,
    colorClass: "transport",
  },
  {
    id: "social",
    title: "Social",
    icon: Users,
    colorClass: "social",
  },
];
