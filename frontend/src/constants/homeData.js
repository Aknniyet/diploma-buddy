import {
  Users,
  MessageSquare,
  CheckCircle,
  Globe,
  Calendar,
  Shield,
  UserPlus,
  Search,
  MessagesSquare,
  Handshake,
} from "lucide-react";

export const homeFeatures = [
  {
    icon: Users,
    titleKey: "home.features.smartMatching.title",
    textKey: "home.features.smartMatching.text",
  },
  {
    icon: MessageSquare,
    titleKey: "home.features.directMessaging.title",
    textKey: "home.features.directMessaging.text",
  },
 
  {
    icon: CheckCircle,
    titleKey: "home.features.adaptationTracking.title",
    textKey: "home.features.adaptationTracking.text",
  },
    
  {
    icon: Globe,
    titleKey: "home.features.culturalExchange.title",
    textKey: "home.features.culturalExchange.text",
  },

    {
      icon: Calendar,
      titleKey: "home.features.eventPlanning.title",
      textKey: "home.features.eventPlanning.text",
    },
    {
      icon: Shield,
      titleKey: "home.features.verifiedStudents.title",
      textKey: "home.features.verifiedStudents.text",
    },
];

export const homeSteps = [
   {
      number: "01",
      icon: UserPlus,
      titleKey: "home.steps.createProfile.title",
      textKey: "home.steps.createProfile.text",
    },
    {
      number: "02",
      icon: Search,
      titleKey: "home.steps.findBuddy.title",
      textKey: "home.steps.findBuddy.text",
    },
    {
      number: "03",
      icon: MessagesSquare,
      titleKey: "home.steps.startCommunication.title",
      textKey: "home.steps.startCommunication.text",
    },
    {
      number: "04",
      icon: Handshake,
      titleKey: "home.steps.meetAndAdapt.title",
      textKey: "home.steps.meetAndAdapt.text",
    },
];

export const homeTestimonials = [
    {
      name: "Yuki Tanaka",
      role: "International Student from Japan",
      text: "My buddy helped me with everyday things like transport, banking, and understanding university life. I felt much more confident in my first weeks.",
    },
    {
      name: "Arman Tulegenov",
      role: "Local Student Buddy",
      text: "Being a buddy helped me meet amazing people from other countries and share our culture with them. It was a very rewarding experience.",
    },
    {
      name: "Carlos Silva",
      role: "International Student from Brazil",
      text: "The adaptation checklist and direct communication with my buddy made everything easier. I always knew what step to do next.",
    },
];
