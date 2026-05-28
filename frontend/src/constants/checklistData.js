import {
  BriefcaseBusiness,
  FileText,
  House,
  Landmark,
  BusFront,
  GraduationCap,
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
    id: "transport",
    title: "Transport",
    icon: BusFront,
    colorClass: "transport",
  },
  {
    id: "banking",
    title: "Banking",
    icon: Landmark,
    colorClass: "banking",
  },
  {
    id: "university",
    title: "University",
    icon: GraduationCap,
    colorClass: "university",
  },
  {
    id: "personal",
    title: "Personal",
    icon: BriefcaseBusiness,
    colorClass: "personal",
  },
];
