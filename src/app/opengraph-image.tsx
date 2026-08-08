import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/lib/constants";

/**
 * Dynamic Open Graph image - auto-generated at build time and served at
 * /opengraph-image. When the homepage link is shared on LinkedIn, Twitter,
 * Slack, etc., this branded 1200×630 card is what people see.
 *
 * Uses the brand's maple-red / parchment palette from globals.css and
 * flexbox-only layout (ImageResponse doesn't support grid or advanced CSS).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

export const alt = "Digi Bear - Design, Motion & AI Video Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SERVICES = [
  "Web Design & Dev",
  "Social Media",
  "Motion Graphics",
  "Video Editing",
  "AI Video",
];

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 80px",
        background: "linear-gradient(135deg, #f3eee5 0%, #e8ddd0 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: "linear-gradient(90deg, #8b1e2d 0%, #d08856 100%)",
          display: "flex",
        }}
      />

      {/* Logo text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <span
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#2d3748",
            letterSpacing: "-1px",
          }}
        >
          DIGI{" "}
        </span>
        <span
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#8b1e2d",
            letterSpacing: "-1px",
          }}
        >
          BEAR
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "32px",
          fontWeight: 600,
          color: "#2d3748",
          marginBottom: "40px",
          lineHeight: 1.3,
          display: "flex",
        }}
      >
        Design, Motion & AI Video Studio
      </div>

      {/* Service pills */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {SERVICES.map((s) => (
          <div
            key={s}
            style={{
              padding: "10px 24px",
              borderRadius: "100px",
              border: "2px solid rgba(139, 30, 45, 0.3)",
              fontSize: "18px",
              fontWeight: 500,
              color: "#8b1e2d",
              display: "flex",
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Domain */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "80px",
          fontSize: "20px",
          color: "#d08856",
          fontWeight: 600,
          display: "flex",
        }}
      >
        {SITE_DOMAIN}
      </div>
    </div>,
    { ...size },
  );
}
