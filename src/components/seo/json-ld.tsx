export function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ULurne",
    "operatingSystem": "Web",
    "applicationCategory": "EducationApplication",
    "description": "The world's first addictive short-form learning ecosystem for students. Master any skill in 120-second bite-sized steps.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1200"
    },
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ULurne",
      "url": "https://ulurne.com"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is ULurne free to use for students?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our core video learning feed is 100% free. We believe education should be accessible to every student with a smartphone."
        }
      },
      {
        "@type": "Question",
        "name": "How do I become a tutor and earn money?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Top students with proven academic performance can apply. Once verified, you can upload lessons and earn through course sales and tips."
        }
      },
      {
        "@type": "Question",
        "name": "What universities do you support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We are currently launching across major Nigerian universities (FUTA, Unilag, UI, OAU) with plans to expand across Africa rapidly."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
