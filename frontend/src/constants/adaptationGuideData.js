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
  "guide.quickTips.tip1",
  "guide.quickTips.tip2",
  "guide.quickTips.tip3",
  "guide.quickTips.tip4",
  "guide.quickTips.tip5",
  "guide.quickTips.tip6",
  "guide.quickTips.tip7",
];

export const guideSections = [
  {
      icon: FileText,
      titleKey: "guide.sections.documents.title",
      subtitleKey: "guide.sections.documents.subtitle",
      items: [
        {
          titleKey: "guide.sections.documents.items.migrationRegistration.title",
          contentKey: "guide.sections.documents.items.migrationRegistration.content",
        },
        {
          titleKey: "guide.sections.documents.items.iin.title",
          contentKey: "guide.sections.documents.items.iin.content",
        },
        {
          titleKey: "guide.sections.documents.items.studentId.title",
          contentKey: "guide.sections.documents.items.studentId.content",
        },
        {
          titleKey: "guide.sections.documents.items.residencePermit.title",
          contentKey: "guide.sections.documents.items.residencePermit.content",
        },
      ],
    },
    {
      icon: House,
      titleKey: "guide.sections.housing.title",
      subtitleKey: "guide.sections.housing.subtitle",
      items: [
        {
          titleKey: "guide.sections.housing.items.dormitory.title",
          contentKey: "guide.sections.housing.items.dormitory.content",
        },
        {
          titleKey: "guide.sections.housing.items.renting.title",
          contentKey: "guide.sections.housing.items.renting.content",
        },
        {
          titleKey: "guide.sections.housing.items.simCard.title",
          contentKey: "guide.sections.housing.items.simCard.content",
        },
        {
          titleKey: "guide.sections.housing.items.apps.title",
          contentKey: "guide.sections.housing.items.apps.content",
        },
      ],
    },
    {
      icon: Landmark,
      titleKey: "guide.sections.banking.title",
      subtitleKey: "guide.sections.banking.subtitle",
      items: [
        {
          titleKey: "guide.sections.banking.items.kaspi.title",
          contentKey: "guide.sections.banking.items.kaspi.content",
        },
        {
          titleKey: "guide.sections.banking.items.halyk.title",
          contentKey: "guide.sections.banking.items.halyk.content",
        },
        {
          titleKey: "guide.sections.banking.items.currency.title",
          contentKey: "guide.sections.banking.items.currency.content",
        },
        {
          titleKey: "guide.sections.banking.items.discounts.title",
          contentKey: "guide.sections.banking.items.discounts.content",
        },
      ],
    },
    {
      icon: Heart,
      titleKey: "guide.sections.healthcare.title",
      subtitleKey: "guide.sections.healthcare.subtitle",
      items: [
        {
          titleKey: "guide.sections.healthcare.items.insurance.title",
          contentKey: "guide.sections.healthcare.items.insurance.content",
        },
        {
          titleKey: "guide.sections.healthcare.items.clinics.title",
          contentKey: "guide.sections.healthcare.items.clinics.content",
        },
        {
          titleKey: "guide.sections.healthcare.items.pharmacies.title",
          contentKey: "guide.sections.healthcare.items.pharmacies.content",
        },
        {
          titleKey: "guide.sections.healthcare.items.emergency.title",
          contentKey: "guide.sections.healthcare.items.emergency.content",
        },
      ],
    },
    {
      icon: Bus,
      titleKey: "guide.sections.transportation.title",
      subtitleKey: "guide.sections.transportation.subtitle",
      items: [
        {
          titleKey: "guide.sections.transportation.items.publicTransport.title",
          contentKey: "guide.sections.transportation.items.publicTransport.content",
        },
        {
          titleKey: "guide.sections.transportation.items.taxis.title",
          contentKey: "guide.sections.transportation.items.taxis.content",
        },
        {
          titleKey: "guide.sections.transportation.items.intercity.title",
          contentKey: "guide.sections.transportation.items.intercity.content",
        },
        {
          titleKey: "guide.sections.transportation.items.navigation.title",
          contentKey: "guide.sections.transportation.items.navigation.content",
        },
      ],
    },
    {
      icon: Users,
      titleKey: "guide.sections.socialLife.title",
      subtitleKey: "guide.sections.socialLife.subtitle",
      items: [
        {
          titleKey: "guide.sections.socialLife.items.telegram.title",
          contentKey: "guide.sections.socialLife.items.telegram.content",
        },
        {
          titleKey: "guide.sections.socialLife.items.hospitality.title",
          contentKey: "guide.sections.socialLife.items.hospitality.content",
        },
        {
          titleKey: "guide.sections.socialLife.items.clubs.title",
          contentKey: "guide.sections.socialLife.items.clubs.content",
        },
        {
          titleKey: "guide.sections.socialLife.items.languageTips.title",
          contentKey: "guide.sections.socialLife.items.languageTips.content",
        },
      ],
    },
    {
      icon: FileText,
      titleKey: "guide.sections.academicCalendar.title",
      subtitleKey: "guide.sections.academicCalendar.subtitle",
      items: [
        {
          titleKey: "guide.sections.academicCalendar.items.year1.title",
          contentKey: "guide.sections.academicCalendar.items.year1.content",
          link: "/pdfs/calendar-year1.pdf",
        },
        {
          titleKey: "guide.sections.academicCalendar.items.year2.title",
          contentKey: "guide.sections.academicCalendar.items.year2.content",
          link: "/pdfs/calendar-year2.pdf",
        },
        {
          titleKey: "guide.sections.academicCalendar.items.year3.title",
          contentKey: "guide.sections.academicCalendar.items.year3.content",
          link: "/pdfs/calendar-year3.pdf",
        },
      ],
    },
    {
      icon: School,
      titleKey: "guide.sections.universityLife.title",
      subtitleKey: "guide.sections.universityLife.subtitle",
      items: [
        {
          titleKey: "guide.sections.universityLife.items.deansOffice.title",
          contentKey: "guide.sections.universityLife.items.deansOffice.content",
        },
        {
          titleKey: "guide.sections.universityLife.items.portal.title",
          contentKey: "guide.sections.universityLife.items.portal.content",
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
