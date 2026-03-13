export default function OpenGraphImage(): {
  alt: string;
  size: {
    width: number;
    height: number;
  };
  contentType: string;
  url: string;
} {
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
