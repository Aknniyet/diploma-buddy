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
          links: [
            {
              label: "AITU International Office",
              url: "https://int.astanait.edu.kz/",
            },
            {
              label: "AITU International Relations",
              url: "https://astanait.edu.kz/en/international-partners/",
            },
          ],
        },
        {
          titleKey: "guide.sections.documents.items.iin.title",
          contentKey: "guide.sections.documents.items.iin.content",
          links: [
            {
              label: "eGov: IIN for Foreigners",
              url: "https://egov.kz/cms/en/services/for_foreigners/pass011_mvd",
            },
            {
              label: "Gov.kz: Obtaining IIN for Non-residents",
              url: "https://www.gov.kz/situations/497/1150?lang=en",
            },
          ],
        },
        {
          titleKey: "guide.sections.documents.items.studentId.title",
          contentKey: "guide.sections.documents.items.studentId.content",
          links: [
            {
              label: "AITU Study Process",
              url: "https://astanait.edu.kz/en/study-at-aitu/",
            },
          ],
        },
        {
          titleKey: "guide.sections.documents.items.residencePermit.title",
          contentKey: "guide.sections.documents.items.residencePermit.content",
          links: [
            {
              label: "AITU International Office",
              url: "https://int.astanait.edu.kz/",
            },
          ],
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
          links: [
            {
              label: "AITU Student House",
              url: "https://astanait.edu.kz/en/students-dormitory/",
            },
          ],
        },
        {
          titleKey: "guide.sections.housing.items.renting.title",
          contentKey: "guide.sections.housing.items.renting.content",
          links: [
            {
              label: "2GIS: Check Area and Routes",
              url: "https://2gis.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.housing.items.simCard.title",
          contentKey: "guide.sections.housing.items.simCard.content",
          links: [
            {
              label: "Kcell",
              url: "https://www.kcell.kz/",
            },
            {
              label: "Beeline Kazakhstan",
              url: "https://beeline.kz/",
            },
            {
              label: "Tele2 Kazakhstan",
              url: "https://tele2.kz/",
            },
            {
              label: "Altel",
              url: "https://altel.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.housing.items.apps.title",
          contentKey: "guide.sections.housing.items.apps.content",
          links: [
            {
              label: "2GIS",
              url: "https://2gis.kz/",
            },
            {
              label: "Yandex Go",
              url: "https://go.yandex.com/",
            },
            {
              label: "Kaspi.kz",
              url: "https://kaspi.kz/",
            },
            {
              label: "Telegram",
              url: "https://telegram.org/",
            },
          ],
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
          links: [
            {
              label: "Kaspi.kz",
              url: "https://kaspi.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.banking.items.halyk.title",
          contentKey: "guide.sections.banking.items.halyk.content",
          links: [
            {
              label: "Halyk Bank",
              url: "https://halykbank.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.banking.items.currency.title",
          contentKey: "guide.sections.banking.items.currency.content",
          links: [
            {
              label: "National Bank of Kazakhstan",
              url: "https://nationalbank.kz/en",
            },
          ],
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
          links: [
            {
              label: "AITU International Office",
              url: "https://int.astanait.edu.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.healthcare.items.clinics.title",
          contentKey: "guide.sections.healthcare.items.clinics.content",
          links: [
            {
              label: "2GIS: Clinics and Pharmacies",
              url: "https://2gis.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.healthcare.items.pharmacies.title",
          contentKey: "guide.sections.healthcare.items.pharmacies.content",
          links: [
            {
              label: "2GIS: Nearest Pharmacies",
              url: "https://2gis.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.healthcare.items.emergency.title",
          contentKey: "guide.sections.healthcare.items.emergency.content",
          links: [
            {
              label: "eGov: Emergency Number 112",
              url: "https://egov.kz/cms/en/articles/emergency_situations/emergency_number_112",
            },
            {
              label: "Ministry of Emergency Situations",
              url: "https://www.gov.kz/memleket/entities/emer?lang=en",
            },
          ],
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
          links: [
            {
              label: "2GIS: Public Transport Routes",
              url: "https://2gis.kz/",
            },
          ],
        },
        {
          titleKey: "guide.sections.transportation.items.taxis.title",
          contentKey: "guide.sections.transportation.items.taxis.content",
          links: [
            {
              label: "Yandex Go",
              url: "https://go.yandex.com/",
            },
            {
              label: "inDrive",
              url: "https://indrive.com/",
            },
          ],
        },
        {
          titleKey: "guide.sections.transportation.items.intercity.title",
          contentKey: "guide.sections.transportation.items.intercity.content",
          links: [
            {
              label: "Kazakhstan Railways",
              url: "https://railways.kz/",
            },
            {
              label: "Air Astana",
              url: "https://airastana.com/",
            },
          ],
        },
        {
          titleKey: "guide.sections.transportation.items.navigation.title",
          contentKey: "guide.sections.transportation.items.navigation.content",
          links: [
            {
              label: "2GIS",
              url: "https://2gis.kz/",
            },
          ],
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
          links: [
            {
              label: "Telegram",
              url: "https://telegram.org/",
            },
          ],
        },
        {
          titleKey: "guide.sections.socialLife.items.hospitality.title",
          contentKey: "guide.sections.socialLife.items.hospitality.content",
        },
        {
          titleKey: "guide.sections.socialLife.items.clubs.title",
          contentKey: "guide.sections.socialLife.items.clubs.content",
          links: [
            {
              label: "AITU Official Website",
              url: "https://astanait.edu.kz/en/",
            },
          ],
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
          links: [
            {
              label: "AITU Academic Calendar",
              url: "https://astanait.edu.kz/en/academic-calendar/",
            },
          ],
        },
        {
          titleKey: "guide.sections.academicCalendar.items.year2.title",
          contentKey: "guide.sections.academicCalendar.items.year2.content",
          link: "/pdfs/calendar-year2.pdf",
          links: [
            {
              label: "AITU Academic Calendar",
              url: "https://astanait.edu.kz/en/academic-calendar/",
            },
          ],
        },
        {
          titleKey: "guide.sections.academicCalendar.items.year3.title",
          contentKey: "guide.sections.academicCalendar.items.year3.content",
          link: "/pdfs/calendar-year3.pdf",
          links: [
            {
              label: "AITU Academic Calendar",
              url: "https://astanait.edu.kz/en/academic-calendar/",
            },
          ],
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
          links: [
            {
              label: "AITU Academic Department",
              url: "https://astanait.edu.kz/en/academic-department",
            },
            {
              label: "AITU Organizational Structure",
              url: "https://astanait.edu.kz/en/orgstructure-of-uni/",
            },
          ],
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
