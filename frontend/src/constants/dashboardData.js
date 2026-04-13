import {
  CalendarDays,
  LayoutGrid,
  Search,
  MessageSquare,
  ClipboardCheck,
  Bell,
  User,
} from "lucide-react";

export const sidebarLinks = [
  {
    id: 1,
    label: "Overview",
    path: "/student/overview",
    icon: LayoutGrid,
  },
  {
    id: 2,
    label: "Find Buddies",
    path: "/student/find-buddies",
    icon: Search,
  },
  {
    id: 3,
    label: "Messages",
    path: "/student/messages",
    icon: MessageSquare,
  },
  {
    id: 4,
    label: "Adaptation Checklist",
    path: "/student/checklist",
    icon: ClipboardCheck,
  },
  {
    id: 5,
    label: "Events",
    path: "/student/events",
    icon: CalendarDays,
  },
  {
    id: 6,
    label: "Notifications",
    path: "/student/notifications",
    icon: Bell,
  },
  {
    id: 7,
    label: "Profile",
    path: "/student/profile",
    icon: User,
  },
];

export const overviewCards = [
  {
    id: 1,
    type: "progress",
    title: "Adaptation Progress",
    progress: 7,
    subtitle: "Keep going! You're making progress.",
  },
  {
    id: 2,
    type: "buddy",
    title: "Your Buddy",
    name: "Arman Tulegenov",
    department: "Business Administration",
    avatar:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
  {
    id: 3,
    type: "messages",
    title: "Unread Messages",
    count: 0,
    actionText: "View messages",
  },
];

export const nextSteps = [
  {
    id: 1,
    title: "Migration Registration",
    description:
      "Register at the migration police within 3 business days of arrival. Your university may handle this for you.",
  },
  {
    id: 2,
    title: "Get IIN (Individual Identification Number)",
    description:
      "Apply for your IIN at the Public Service Center (TSON / CON). You'll need it for banking and SIM cards.",
  },
  {
    id: 3,
    title: "Move Into Dormitory or Apartment",
    description:
      "Check into your university dormitory (obshchezhitie) or sign a rental agreement for an apartment.",
  },
];

export const recentMessages = [
  {
    id: 1,
    name: "Yuki Tanaka",
    text: "Hi Arman! Thanks for accepting my buddy request. I had some questions ab...",
    avatar:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
  {
    id: 2,
    name: "Arman Tulegenov",
    text: "Hey Yuki! Of course, happy to help. You'll need your passport and IIN to open...",
    avatar:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    text: "That would be great! How about Thursday afternoon?",
    avatar:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
];

export const currentUser = {
  name: "Yuki Tanaka",
  role: "International Student",
  initials: "YT",
  avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" ,
};