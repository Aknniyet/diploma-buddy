import { CheckCircle2, MessageSquare, ClipboardList } from "lucide-react";

export const studentNotifications = [
  {
    id: 1,
    title: "Buddy Request Accepted",
    description:
      "Aigerim Serikova accepted your buddy request. You can now start chatting and planning your first meeting.",
    date: "Oct 10",
    read: false,
    icon: CheckCircle2,
  },
  {
    id: 2,
    title: "New Message from Your Buddy",
    description:
      "Aigerim Serikova sent you a new message about meeting on Thursday afternoon.",
    date: "Oct 9",
    read: true,
    icon: MessageSquare,
  },
  {
    id: 3,
    title: "Checklist Reminder",
    description:
      "Don't forget to complete your migration registration within 3 business days of arrival.",
    date: "Oct 8",
    read: true,
    icon: ClipboardList,
  },
];