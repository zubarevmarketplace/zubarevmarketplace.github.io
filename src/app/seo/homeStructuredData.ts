// Existing structured data from the landing page.
export const homeStructuredData: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://zubarevlab.ru/"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Николай Зубарев",
    "url": "https://zubarevlab.ru/",
    "jobTitle": "Аналитик маркетплейсов Wildberries и Ozon",
    "description": "Аудит и рост продаж на маркетплейсах. Нахожу точки роста, собираю прибыльную модель бизнеса.",
    "knowsAbout": [
      "Маркетплейс-диагностика",
      "Аналитика",
      "Wildberries",
      "Ozon"
    ],
    "email": "zubarev.marketplace@gmail.com",
    "telephone": "+79046320024",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+79046320024",
        "email": "zubarev.marketplace@gmail.com",
        "availableLanguage": [
          "Russian"
        ]
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Что вы делаете?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Провожу аудит и диагностику бизнеса на маркетплейсах WB и Ozon, нахожу точки роста и выстраиваю прибыльную модель."
        }
      },
      {
        "@type": "Question",
        "name": "Какие услуги вы предлагаете?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Услуги аналитика WB и Ozon: анализ экономики, ассортимента, юнит-экономики, разработка стратегии продвижения, сопровождение."
        }
      }
    ]
  }
];
