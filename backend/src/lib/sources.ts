export interface FeedSource {
  slug: string;
  name: string;
  url: string;
  // when true the feed body has rich content; otherwise we synthesize a stub
  // body that links back to the source (e.g. Aaron Swartz's PG scraper).
  contentInFeed: boolean;
}

export const FEED_SOURCES: FeedSource[] = [
  {
    slug: "paul-graham",
    name: "Paul Graham",
    url: "http://www.aaronsw.com/2002/feeds/pgessays.rss",
    contentInFeed: false,
  },
  {
    slug: "sam-altman",
    name: "Sam Altman",
    url: "https://blog.samaltman.com/posts.atom",
    contentInFeed: true,
  },
  {
    slug: "dhh",
    name: "David Heinemeier Hansson",
    url: "https://world.hey.com/dhh/feed.atom",
    contentInFeed: true,
  },
  {
    slug: "julia-evans",
    name: "Julia Evans",
    url: "https://jvns.ca/atom.xml",
    contentInFeed: true,
  },
];
