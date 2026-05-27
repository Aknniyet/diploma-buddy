import { AlertTriangle, CalendarDays, LayoutGrid, ShieldCheck, Shuffle } from "lucide-react";

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
    label: "Risk Monitor",
    path: "/admin/risk-monitor",
    icon: AlertTriangle,
  },
  {
    id: 4,
    label: "Buddy Profiles",
    path: "/admin/buddies",
    icon: ShieldCheck,
  },
  {
    id: 5,
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays,
  },
];
