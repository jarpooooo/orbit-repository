import type { Metadata } from "next";
import { BASE_OPEN_GRAPH, SITE, SITE_URL } from "@/app/data/site";
import HomeContent from "./components/home/home-content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...BASE_OPEN_GRAPH, title: SITE.name, description: SITE.description, url: "/" },
};

// Structured data (JSON-LD) for search engines: the site + a search box pointing to /catalog?q=
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "id-ID",
      publisher: { "@id": `${SITE_URL}/#organisasi` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalog?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organisasi`,
      name: SITE.organization,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/img/logo.svg`,
      address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Yogyakarta", addressCountry: "ID" },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
      />
      <HomeContent />
    </>
  );
}
