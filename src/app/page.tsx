import Portfolio from "@/components/Portfolio";
import { getContent } from "@/sanity/fetch";

export const revalidate = 60;

export default async function Home() {
  const content = await getContent();
  const s = content.settings;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.name,
    jobTitle: s.role,
    email: `mailto:${s.email}`,
    telephone: s.phone,
    address: { "@type": "PostalAddress", addressLocality: "Noida", addressCountry: "India" },
    sameAs: [s.instagram],
    worksFor: { "@type": "Organization", name: s.currentCompany },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Portfolio content={content} />
    </>
  );
}
