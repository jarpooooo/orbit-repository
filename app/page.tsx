import type { Metadata } from "next";
import { OG_DASAR, SITE_URL, SITUS } from "@/app/data/situs";
import Homepage from "./home/page";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...OG_DASAR, title: SITUS.nama, description: SITUS.deskripsi, url: "/" },
};

// Data terstruktur (JSON-LD) untuk mesin pencari: situs + kotak pencarian ke /katalog?q=
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITUS.nama,
      description: SITUS.deskripsi,
      inLanguage: "id-ID",
      publisher: { "@id": `${SITE_URL}/#organisasi` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/katalog?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organisasi`,
      name: SITUS.organisasi,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/img/logo.svg`,
      address: { "@type": "PostalAddress", streetAddress: SITUS.alamat, addressLocality: "Yogyakarta", addressCountry: "ID" },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
      />
      <Homepage/>
    </>
  );
}
