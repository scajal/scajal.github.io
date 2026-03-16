const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scajal.github.io";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Santiago Cajal",
  alternateName: "Santi",
  url: siteUrl,
  jobTitle: "Software Development Lead",
  description:
    "Full-Stack Engineer building secure, scalable platforms across fintech, crypto, and IoT. 8+ years of experience in technical leadership and product development.",
  sameAs: ["https://github.com/scajal", "https://linkedin.com/in/scajal"],
  email: "s.cajalvarela@gmail.com",
  knowsAbout: [
    "Full-Stack Development",
    "Fintech",
    "Cryptocurrency",
    "IoT",
    "Laravel",
    "React",
    "TypeScript",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Santiago Cajal — Software Development Lead & Full-Stack Engineer",
  url: siteUrl,
  description:
    "Building secure, scalable platforms across fintech, crypto, and IoT. 8+ years of experience in full-stack development and technical leadership.",
  author: {
    "@type": "Person",
    name: "Santiago Cajal",
    url: siteUrl,
  },
};

export function JsonLd() {
  const scripts = [personSchema, websiteSchema];
  return (
    <>
      {scripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
