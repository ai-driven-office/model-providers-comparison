import type { APIRoute } from "astro";
import type { ReactNode } from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;

async function loadFont(weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());

  const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)?.[1];
  if (!url) throw new Error(`Font URL not found for weight ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export const GET: APIRoute = async () => {
  const [regular, bold] = await Promise.all([loadFont(400), loadFont(700)]);

  const bars = [
    { h: 100, o: 0.3 },
    { h: 160, o: 0.45 },
    { h: 230, o: 0.6 },
    { h: 185, o: 0.5 },
    { h: 310, o: 0.75 },
    { h: 260, o: 0.65 },
    { h: 390, o: 1 },
  ];

  const providers = [
    { name: "OpenAI", color: "#10A37F" },
    { name: "Anthropic", color: "#D4A574" },
    { name: "Google", color: "#4285F4" },
    { name: "xAI", color: "#FFFFFF" },
    { name: "Cerebras", color: "#00D4AA" },
  ];

  const tree = {
      type: "div",
      props: {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #06060f 0%, #0c0c1d 40%, #100c1a 100%)",
          padding: "56px 64px",
          fontFamily: "DM Sans",
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "24px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            width: "28px",
                            height: "4px",
                            background: "#00E5A0",
                            borderRadius: "2px",
                          },
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "#00E5A0",
                            fontSize: "16px",
                            fontWeight: 700,
                            letterSpacing: "2.5px",
                          },
                          children: "AI MODEL COMPARISON",
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      color: "#FFFFFF",
                      fontSize: "50px",
                      fontWeight: 700,
                      lineHeight: 1.15,
                    },
                    children: "Throughput & Pricing",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      color: "#FFFFFF",
                      fontSize: "50px",
                      fontWeight: 700,
                      lineHeight: 1.15,
                      marginBottom: "22px",
                    },
                    children: "Dashboard",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "19px",
                      lineHeight: 1.5,
                      marginBottom: "36px",
                      maxWidth: "460px",
                    },
                    children:
                      "Compare speed, cost, and capabilities across frontier AI models",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    },
                    children: providers.map((p) => ({
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "20px",
                          padding: "5px 14px",
                          border: "1px solid rgba(255,255,255,0.08)",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: p.color,
                              },
                            },
                          },
                          {
                            type: "span",
                            props: {
                              style: {
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "13px",
                                fontWeight: 400,
                              },
                              children: p.name,
                            },
                          },
                        ],
                      },
                    })),
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                paddingBottom: "16px",
                marginLeft: "24px",
              },
              children: bars.map((bar) => ({
                type: "div",
                props: {
                  style: {
                    width: "34px",
                    height: `${bar.h}px`,
                    borderRadius: "5px 5px 3px 3px",
                    background: "#00E5A0",
                    opacity: bar.o,
                  },
                },
              })),
            },
          },
        ],
      },
  } as unknown as ReactNode;

  const svg = await satori(tree, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "DM Sans", data: regular, weight: 400, style: "normal" as const },
        { name: "DM Sans", data: bold, weight: 700, style: "normal" as const },
      ],
    });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  const png = resvg.render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
