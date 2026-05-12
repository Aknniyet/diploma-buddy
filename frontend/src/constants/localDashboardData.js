import {
  CalendarDays,
  LayoutGrid,
  Users,
  Bell,
  MessageSquare,
  User,
  UserPlus,
  UsersRound,
} from "lucide-react";

export const localSidebarLinks = [
  {
    id: 1,
    label: "Overview",
    path: "/buddy/overview",
    icon: LayoutGrid,
  },
  {
    id: 2,
    label: "My Buddies",
    path: "/buddy/my-buddies",
    icon: Users,
  },
  {
    id: 3,
    label: "Buddy Requests",
    path: "/buddy/buddy-requests",
    icon: UserPlus,
  },
  {
    id: 4,
    label: "Messages",
    path: "/buddy/messages",
    icon: MessageSquare,
  },
  {
    id: 5,
    label: "Community Board",
    path: "/buddy/community",
    icon: UsersRound,
  },
  {
    id: 6,
    label: "Events",
    path: "/buddy/events",
    icon: CalendarDays,
  },
  {
    id: 7,
    label: "Notifications",
    path: "/buddy/notifications",
    icon: Bell,
  },
  {
    id: 8,
    label: "Profile",
    path: "/buddy/profile",
    icon: User,
  },
];

export const localCurrentUser = {
  name: "Aigerim Serikova",
  role: "Local Student",
  initials: "AS",
  avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
};

export const localOverviewCards = [
  {
    id: 1,
    title: "Active Buddies",
    value: 0,
    subtitle: "of 3 max buddies",
    actionText: "View buddies",
    actionPath: "/buddy/my-buddies",
  },
  {
    id: 2,
    title: "Pending Requests",
    value: 1,
    subtitle: "students want to connect",
    actionText: "Review requests",
    actionPath: "/buddy/buddy-requests",
  },
  {
    id: 3,
    title: "Unread Messages",
    value: 0,
    subtitle: "messages waiting",
    actionText: "View messages",
    actionPath: "/buddy/messages",
  },
];

export const myBuddiesEmptyState = {
  title: "No buddies yet",
  subtitle: "Wait for requests or update your profile",
};

export const localPendingRequests = [
  {
    id: 1,
    name: "Carlos Silva",
    avatar:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    text: "Hi Aigerim! I'm Carlos from Brazil, studying Data Science. I'd love to connect and learn more about life in Almaty!",
  },
];
