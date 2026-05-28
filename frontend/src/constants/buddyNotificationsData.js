import { UserPlus, MessageSquare, CalendarClock } from "lucide-react";

export const buddyNotifications = [
  {
    id: 1,
    title: "New Buddy Request",
    description: "Carlos Silva would like to connect with you!",
    date: "Oct 10",
    read: false,
    icon: UserPlus,
  },
  {
    id: 2,
    title: "New Message from Student",
    description:
      "Mina Lee sent you a message asking about transport and dormitory life.",
    date: "Oct 9",
    read: true,
    icon: MessageSquare,
  },
  {
    id: 3,
    title: "Meeting Reminder",
    description:
      "You planned to meet Yuki Tanaka tomorrow afternoon. Don't forget to confirm the location.",
    date: "Oct 8",
    read: true,
    icon: CalendarClock,
  },
];