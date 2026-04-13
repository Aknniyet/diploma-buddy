import { CalendarDays, LayoutGrid, Shuffle } from "lucide-react";

export const adminSidebarLinks = [
  {
    id: 1,
    label: "Dashboard",
    path: "/admin",
    icon: LayoutGrid,
    end: true,
  },
  {
    id: 2,
    label: "Match Management",
    path: "/admin/matches",
    icon: Shuffle,
  },
  {
    id: 3,
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays,
  },
];
