import {
  FileText,
  House,
  Landmark,
  Heart,
  Bus,
  Users,
  School,
} from "lucide-react";

export const quickTips = [
    "Save emergency numbers: Police (102), Ambulance (103), Fire (101), Unified (112)",
    "Download 2GIS for offline maps — it's the most accurate navigation app in Kazakhstan",
    "Get Kaspi.kz app — it's essential for payments, transfers, and shopping",
    "Join your university's student Telegram groups for news and events",
    "Keep digital copies of your passport, visa, and IIN in cloud storage",
    "Learn basic Kazakh/Russian phrases — people really appreciate the effort",
    "Download Yandex Go for affordable taxi rides anywhere in the city",
];

export const guideSections = [
  {
      icon: FileText,
      title: "Documents & Registration",
      subtitle:
        "Essential paperwork to complete within your first days in Kazakhstan.",
      items: [
        {
          title: "Migration Registration",
          content:
            "You must register at the migration police within 3 business days of arrival. Most universities handle this for international students through the international office. Bring your passport, visa, and enrollment documents.",
        },
        {
          title: "IIN (Individual Identification Number)",
          content:
            "The IIN is very important in Kazakhstan. You need it to open a bank account, use some digital services, and complete official procedures. Ask your university or local buddy for help with the application process.",
        },
        {
          title: "Student ID Card",
          content:
            "Your university will usually provide a student ID after enrollment is confirmed. Keep it with you because you may need it for dormitory access, campus entry, and student discounts.",
        },
        {
          title: "Residence Permit (for long stays)",
          content:
            "If you plan to stay in Kazakhstan long-term, ask your university or migration office whether you need a residence permit or visa extension. Requirements may depend on your citizenship and program duration.",
        },
      ],
    },
    {
      icon: House,
      title: "Housing & Accommodation",
      subtitle: "Setting up your new home in Kazakhstan.",
      items: [
        {
          title: "University Dormitory",
          content:
            "Many universities offer dormitories for international students. Apply as early as possible, because places may be limited. Ask about payment, facilities, rules, and room equipment before moving in.",
        },
        {
          title: "Renting an Apartment",
          content:
            "If you choose private housing, use trusted services and never send money before seeing the apartment. Check location, transport access, internet, heating, and whether utility bills are included.",
        },
        {
          title: "SIM Card & Internet",
          content:
            "Get a local SIM card from Kcell, Beeline, Tele2, or Altel. You'll need your passport. Mobile data plans are affordable, and many students also install home Wi-Fi in rented apartments.",
        },
        {
          title: "Essential Apps to Download",
          content:
            "Useful apps include 2GIS for maps, Yandex Go for taxis, Kaspi.kz for payments, Telegram for student groups, and your university's internal apps or portals.",
        },
      ],
    },
    {
      icon: Landmark,
      title: "Banking & Finances",
      subtitle: "Managing your money in Kazakhstan.",
      items: [
        {
          title: "Kaspi Bank (recommended)",
          content:
            "Kaspi Bank is one of the most popular banks in Kazakhstan. The Kaspi app lets you pay by QR code, transfer money instantly, shop online, and pay utility bills. You'll usually need your passport and IIN to open an account.",
        },
        {
          title: "Halyk Bank",
          content:
            "Halyk Bank is another reliable option. Some students prefer it for traditional banking services. Compare card fees, mobile app convenience, and branch access before deciding.",
        },
        {
          title: "Currency & Costs",
          content:
            "The local currency is the Kazakhstani tenge (KZT). Track your first month's spending carefully, especially on food, transport, rent, mobile data, and study materials.",
        },
        {
          title: "Student Discounts",
          content:
            "Always ask whether student discounts are available for transport, museums, events, and university-related services. Your student ID may help you save money.",
        },
      ],
    },
    {
      icon: Heart,
      title: "Healthcare",
      subtitle: "Staying healthy and accessing medical services in Kazakhstan.",
      items: [
        {
          title: "Health Insurance",
          content:
            "Check whether your university provides insurance or requires you to buy your own. Keep a digital and printed copy of your insurance documents with you.",
        },
        {
          title: "Polyclinics & Hospitals",
          content:
            "Ask your university which clinic or hospital international students usually visit. Some institutions have partner clinics. Knowing where to go before you get sick is very helpful.",
        },
        {
          title: "Pharmacies",
          content:
            "Pharmacies are easy to find in most cities. Basic medicine is widely available, but for some items you may need a prescription. Learn the nearest pharmacy to your dorm or apartment.",
        },
        {
          title: "Emergency Services",
          content:
            "In emergencies call 103 for ambulance or 112 for the general emergency line. Save these numbers in your phone on your first day.",
        },
      ],
    },
    {
      icon: Bus,
      title: "Transportation",
      subtitle: "Getting around Kazakhstan.",
      items: [
        {
          title: "Public Transport",
          content:
            "Most big cities have buses, and some have metro systems. Ask your buddy how to buy or top up a transport card in your city. Apps like 2GIS help you plan routes.",
        },
        {
          title: "Taxis (Yandex Go & inDrive)",
          content:
            "Taxi apps are very popular and often affordable. Use official apps instead of random street taxis. Always check the driver and car details before entering.",
        },
        {
          title: "Intercity Travel",
          content:
            "You can travel between cities by train, bus, or airplane. Buy tickets from official websites or trusted apps. Keep your passport with you during travel.",
        },
        {
          title: "2GIS Navigation",
          content:
            "2GIS is one of the best apps for navigation in Kazakhstan. It shows routes, shops, pharmacies, and important city services very clearly.",
        },
      ],
    },
    {
      icon: Users,
      title: "Social Life & Culture",
      subtitle: "Making friends and adapting to Kazakh culture.",
      items: [
        {
          title: "Telegram Groups",
          content:
            "Student groups on Telegram are very important for university life. You'll find announcements, events, housing offers, and everyday advice there.",
        },
        {
          title: "Kazakh Hospitality",
          content:
            "Kazakh culture is known for hospitality. Be open, polite, and curious. Accepting invitations respectfully and showing interest in local culture helps a lot.",
        },
        {
          title: "Student Clubs & Events",
          content:
            "Join clubs, campus activities, and language exchange events. These are the easiest ways to meet new people and practice communication.",
        },
        {
          title: "Language Tips",
          content:
            "Even a few phrases in Kazakh or Russian can make daily life easier. Learn greetings, polite expressions, and simple transport or shopping phrases.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Academic Calendar (AITU)",
      subtitle: "Plan your semester with official university dates.",
      items: [
        {
          title: "Bachelor Year 1",
          content: "Includes semester start/end dates, exam sessions, and holidays.",
          link: "/pdfs/calendar-year1.pdf",
        },
        {
          title: "Bachelor Year 2",
          content: " Important academic deadlines and exam periods.",
          link: "/pdfs/calendar-year2.pdf",
        },
        {
          title: "Bachelor Year 3",
          content: "Final academic schedule and project deadlines.",
          link: "/pdfs/calendar-year3.pdf",
        },
      ],
    },
    {
      icon: School,
      title: "University Life (AITU)",
      subtitle: "Everything you need inside the university.",
      items: [
        {
          title: "Dean’s Office",
          content: "Contact your dean's office for academic issues.",
        },
        {
          title: "Student Portal",
          content: "Use university systems to check grades and schedule.",
          links: [
            {
              label: "LMS Moodle",
              url: "https://lms.astanait.edu.kz/",
            },
            {
              label: "DU",
              url: "https://du.astanait.edu.kz/",
            },
          ],
        },
      ],
    },
];