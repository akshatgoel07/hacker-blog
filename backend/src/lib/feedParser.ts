import { XMLParser } from "fast-xml-parser";

export interface FeedItem {
  title: string;
  link: string;
  publishedAt: Date | null;
  content: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  // tags like <content:encoded> get stored under "content:encoded"
  removeNSPrefix: false,
  parseTagValue: true,
});

const asString = (val: unknown): string => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const obj = val as any;
    if (typeof obj["#text"] === "string") return obj["#text"];
    if (typeof obj["@_href"] === "string") return obj["@_href"];
  }
  return "";
};

const arrayOf = <T,>(val: T | T[] | undefined): T[] => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const parseRssDate = (s: string): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const stripHtml = (html: string, max = 8000): string => {
  if (!html) return "";
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  return cleaned.length > max ? cleaned.slice(0, max) + "…" : cleaned;
};

const parseRss = (channel: any): FeedItem[] => {
  const items = arrayOf(channel?.item);
  return items.map((it: any) => {
    const title = asString(it.title);
    const link = asString(it.link);
    const pubDate = asString(it.pubDate ?? it["dc:date"]);
    const contentEncoded = asString(it["content:encoded"]);
    const description = asString(it.description);
    return {
      title,
      link,
      publishedAt: parseRssDate(pubDate),
      content: stripHtml(contentEncoded || description || ""),
    };
  });
};

const findHtmlAlternateLink = (links: any): string => {
  const arr = arrayOf(links);
  // Prefer rel="alternate" type="text/html"
  for (const l of arr) {
    if (typeof l !== "object") continue;
    const rel = l["@_rel"] || "alternate";
    const type = l["@_type"] || "";
    if (rel === "alternate" && (type === "" || type.includes("html"))) {
      return l["@_href"] || asString(l);
    }
  }
  // Fallback: first link
  return arrayOf(links).map(asString)[0] || "";
};

const parseAtom = (feed: any): FeedItem[] => {
  const entries = arrayOf(feed?.entry);
  return entries.map((entry: any) => {
    const title = asString(entry.title);
    const link = findHtmlAlternateLink(entry.link);
    const updated = asString(entry.updated || entry.published);
    const content = asString(entry.content || entry.summary);
    return {
      title,
      link,
      publishedAt: parseRssDate(updated),
      content: stripHtml(content),
    };
  });
};

export const parseFeed = (xml: string): FeedItem[] => {
  const data = parser.parse(xml);
  if (data?.rss?.channel) return parseRss(data.rss.channel);
  if (data?.feed) return parseAtom(data.feed);
  return [];
};
