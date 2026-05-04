/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const avatarData = await fetch(
    new URL("../../../public/media/stenio-55-og-source.png", import.meta.url),
  ).then((response) => response.arrayBuffer());

  const avatarSrc = `data:image/png;base64,${Buffer.from(avatarData).toString(
    "base64",
  )}`;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#F5A98A",
          color: "#2A2A2A",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "64px 78px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 690,
          }}
        >
          <div
            style={{
              color: "#1F4D3A",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            07.05.2026 · Quinta · 19h
          </div>
          <div
            style={{
              fontFamily: "serif",
              fontSize: 118,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 0.94,
            }}
          >
            Stênio faz 55
          </div>
          <div
            style={{
              color: "#1F4D3A",
              fontSize: 37,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Boteco Caju Limão Sudoeste
          </div>
          <div
            style={{
              alignItems: "center",
              background: "#1F4D3A",
              borderRadius: 18,
              color: "#FAF6F0",
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              height: 70,
              justifyContent: "center",
              padding: "0 34px",
              width: 395,
            }}
          >
            vem brindar com a gente
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            background: "#FAF6F0",
            border: "12px solid #1F4D3A",
            borderRadius: "999px",
            boxShadow: "0 36px 80px rgba(42,42,42,0.24)",
            display: "flex",
            height: 430,
            justifyContent: "center",
            overflow: "hidden",
            width: 430,
          }}
        >
          <img
            alt=""
            height={430}
            src={avatarSrc}
            style={{
              height: "100%",
              objectFit: "cover",
              width: "100%",
            }}
            width={430}
          />
        </div>
      </div>
    ),
    {
      height: 630,
      width: 1200,
    },
  );
}
