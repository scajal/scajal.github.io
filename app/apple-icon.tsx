import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The mark is the full stop that closes the headline and sits inside the
// wordmark. At icon size it stands alone, centred — an offset dot reads as
// a mistake rather than as punctuation once the letters are gone.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 74,
            background: "#93de04",
          }}
        />
      </div>
    ),
    size,
  );
}
