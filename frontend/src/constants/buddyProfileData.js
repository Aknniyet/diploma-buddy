import { BookOpen, Heart, Languages, MapPin, UserRound } from "lucide-react";

export const buddyProfileData = {
  fullName: "Aigerim Serikova",
  role: "Local Student",
  email: "emma.schmidt@uni.edu",
  avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",

  summaryItems: [
    {
      id: 1,
      icon: MapPin,
      label: "City:",
      value: "Almaty",
    },
    {
      id: 2,
      icon: BookOpen,
      label: "Studying:",
      value: "Computer Science",
    },
  ],

  fields: [
    {
      id: 1,
      label: "Full Name",
      value: "Aigerim Serikova",
    },
    {
      id: 2,
      label: "City",
      value: "Almaty",
    },
    {
      id: 3,
      label: "Study Program",
      value: "Computer Science",
    },
    {
      id: 4,
      label: "Maximum Buddies",
      value: "3",
    },
  ],

  sections: [
    {
      id: 1,
      title: "Languages Spoken",
      icon: Languages,
      type: "filled",
      items: ["Kazakh", "Russian", "English"],
    },
    {
      id: 2,
      title: "Hobbies & Interests",
      icon: Heart,
      type: "outline",
      items: ["Hiking", "Photography", "Cooking"],
    },
    {
      id: 3,
      title: "About Me",
      icon: UserRound,
      type: "text",
      text: "Salem! I'm Aigerim, a 3rd year CS student at KBTU. I love helping international students discover Almaty and Kazakh culture. Let's grab some tea and beshbarmak!",
    },
  ],
};