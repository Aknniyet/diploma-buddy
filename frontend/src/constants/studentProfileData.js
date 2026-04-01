import { BookOpen, Heart, Languages, MapPin, UserRound } from "lucide-react";

export const studentProfileData = {
  fullName: "Yuki Tanaka",
  role: "International Student",
  email: "yuki.tanaka@student.edu",
  avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",

  summaryItems: [
    {
      id: 1,
      icon: MapPin,
      label: "From:",
      value: "Japan",
    },
    {
      id: 2,
      icon: MapPin,
      label: "Living in:",
      value: "Almaty",
    },
    {
      id: 3,
      icon: BookOpen,
      label: "Studying:",
      value: "Mechanical Engineering",
    },
  ],

  fields: [
    {
      id: 1,
      label: "Full Name",
      value: "Yuki Tanaka",
    },
    {
      id: 2,
      label: "Home Country",
      value: "Japan",
    },
    {
      id: 3,
      label: "Current City",
      value: "Almaty",
    },
    {
      id: 4,
      label: "Study Program",
      value: "Mechanical Engineering",
    },
  ],

  sections: [
    {
      id: 1,
      title: "Languages Spoken",
      icon: Languages,
      type: "filled",
      items: ["Japanese", "English"],
    },
    {
      id: 2,
      title: "Hobbies & Interests",
      icon: Heart,
      type: "outline",
      items: ["Anime", "Cycling", "Cooking"],
    },
  ],
};