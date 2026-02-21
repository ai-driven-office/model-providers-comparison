import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const newsEntries = await getCollection("news");
  const news = newsEntries
    .map((e) => e.data)
    .sort((a, b) => b.timestamp - a.timestamp);

  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const siteUrl = new URL(base, site).href;
  const feedUrl = new URL(`${base}feed.xml`, site).href;

  const items = news
    .map((post) => {
      const slug = post.date + "-" + post.title.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
      return `    <item>
      <title><![CDATA[${post.title.en}]]></title>
      <description><![CDATA[${post.body.en}]]></description>
      <pubDate>${new Date(post.timestamp).toUTCString()}</pubDate>
      <link>${siteUrl}</link>
      <guid isPermaLink="false">${slug}</guid>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Model Comparison — News &amp; Updates</title>
    <description>Latest developments in AI model performance, pricing, and infrastructure</description>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
