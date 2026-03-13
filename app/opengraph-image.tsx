import type { MetadataRoute } from "next";

export default function Image(): MetadataRoute.Image {
  return {
    alt: "Santiago Cajal — Software Development Lead & Full-Stack Engineer",
    size: {
      width: 1200,
      height: 630,
    },
    contentType: "image/png",
    url: "/og-image.png",
  };
}

