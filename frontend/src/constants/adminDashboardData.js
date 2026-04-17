import { CalendarDays, LayoutGrid, ShieldCheck, Shuffle } from "lucide-react";

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
    label: "Buddy Profiles",
    path: "/admin/buddies",
    icon: ShieldCheck,
  },
  {
    id: 4,
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays,
  },
];
