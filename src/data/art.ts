export type ArtPiece = {
  name: string;
  slug: string;
  date: string;
  href: string;
  width: number;
  height: number;
  post?: string;
  unsplash?: string;
  featured?: boolean;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function withSlugs<T extends { name: string }>(items: T[]): (T & { slug: string })[] {
  return items.map((item) => ({ ...item, slug: slugify(item.name) }));
}

export const COLLECTIONS = [
  {
    name: "SPHERUS",
    description: "a collection of attempts to convey ineffable emotions.",
    href: "https://spherus.cnrad.dev",
    thumbnail: "/art/spherus_thumbnail.webp",
  },
  {
    name: "FIGURA",
    description:
      "a collection of 12 beautiful, abstract wallpapers - all in stunning 6k resolution.",
    href: "https://cnrad.gumroad.com/l/figura",
    thumbnail: "/art/figura_thumbnail.webp",
  },
] as const;

export const WORKS: ArtPiece[] = withSlugs([
  {
    name: "Aurora (4)",
    date: "10.25.25",
    href: "/art/min/aurora_4.webp",
    width: 5000,
    height: 4000,
    post: "https://x.com/notcnrad/status/1982189530711990357",
  },
  {
    name: "Aurora (3)",
    date: "10.25.25",
    href: "/art/min/aurora_3.webp",
    width: 5000,
    height: 4000,
    post: "https://x.com/notcnrad/status/1982189530711990357",
  },
  {
    name: "Aurora (2)",
    date: "10.25.25",
    href: "/art/min/aurora_2.webp",
    width: 5000,
    height: 4000,
    post: "https://x.com/notcnrad/status/1982189530711990357",
  },
  {
    name: "Aurora (1)",
    date: "10.25.25",
    href: "/art/min/aurora_1.webp",
    width: 5000,
    height: 4000,
    post: "https://x.com/notcnrad/status/1982189530711990357",
  },
  {
    name: "Ultrawide Minimalism (1)",
    date: "06.03.24",
    href: "/art/min/ultrawide_minimalism_1.webp",
    width: 1536,
    height: 648,
    post: "https://x.com/notcnrad/status/1797489177782845750",
  },
  {
    name: "Ultrawide Minimalism (2)",
    date: "06.03.24",
    href: "/art/min/ultrawide_minimalism_2.webp",
    width: 1536,
    height: 648,
    post: "https://x.com/notcnrad/status/1797489177782845750",
  },
  {
    name: "Streams",
    date: "11.07.24",
    href: "/art/min/streams.webp",
    width: 1500,
    height: 1200,
    unsplash: "https://unsplash.com/photos/Q6gZw7Hnl5w",
    post: "https://x.com/notcnrad/status/1857255860071759885",
  },
  {
    name: "The Moment Our Eyes First Met",
    date: "04.08.23",
    href: "/art/min/themomentoureyesfirstmet.webp",
    width: 750,
    height: 1200,
  },
  {
    name: "Arcus Exploration",
    date: "06.20.23",
    href: "/art/min/arcus.webp",
    width: 1200,
    height: 1200,
    post: "https://x.com/notcnrad/status/1671238076180430851",
  },
  {
    name: "Arcus Exploration 2",
    date: "06.21.23",
    href: "/art/min/arcus_background.webp",
    width: 1500,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-dark-background-with-a-pattern-of-wavy-lines-EcWBgAdRqrQ",
    post: "https://x.com/notcnrad/status/1671634017446141956",
  },
  {
    name: "Fluctus",
    date: "01.08.24",
    href: "/art/min/fluctus.webp",
    width: 822,
    height: 1200,
  },
  {
    name: "Dawn of a New Tomorrow",
    date: "09.11.23",
    href: "/art/min/dawnofanewtomorrow.webp",
    width: 1500,
    height: 1500,
    post: "https://x.com/notcnrad/status/1701223417372971378",
  },
  {
    name: "Neo (Commission - Hop Inc.)",
    date: "01.08.24",
    href: "/art/min/neo_hop.webp",
    width: 1500,
    height: 1200,
    post: "https://x.com/notcnrad/status/1641602543703736324",
  },
  {
    name: "Neo",
    date: "03.29.23",
    href: "/art/min/neo.webp",
    width: 1228,
    height: 855,
    post: "https://x.com/notcnrad/status/1640931894933028870",
  },
  {
    name: "Light Trail 1",
    date: "01.08.24",
    href: "/art/min/light_trail_2.webp",
    width: 1500,
    height: 1200,
  },
  {
    name: "Light Trail 2",
    date: "01.08.24",
    href: "/art/min/light_trail.webp",
    width: 1500,
    height: 1200,
  },
  {
    name: "Planet",
    date: "05.09.23",
    href: "/art/min/planet.webp",
    width: 1800,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-red-planet-with-a-black-background-LipGKRm7dBM",
    post: "https://x.com/notcnrad/status/1655962324015124483",
  },
  {
    name: "Canalis",
    date: "06.18.23",
    href: "/art/min/wallpaper_wednesday_unsplash.webp",
    width: 1500,
    height: 1200,
    unsplash: "https://unsplash.com/photos/08pUkir23Z4",
    featured: true,
  },
  {
    name: "Rik Style",
    date: "01.08.24",
    href: "/art/min/rik_style.webp",
    width: 1200,
    height: 1800,
    unsplash:
      "https://unsplash.com/photos/a-purple-abstract-background-with-lines-and-curves-1uyWq9xVwcE",
  },
  {
    name: "Spectrum",
    date: "01.08.24",
    href: "/art/min/spectrum.webp",
    width: 1950,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-black-background-with-a-multicolored-wave-of-light-cRoeAzZTWSc",
  },
  {
    name: "To Gently Fall Further Away",
    date: "01.08.24",
    href: "/art/min/togentlyfallfurtheraway.webp",
    width: 1020,
    height: 1200,
  },
  {
    name: "WWDC Exploration 1",
    date: "06.05.23",
    href: "/art/min/wwdcexploration1.webp",
    width: 1500,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-blue-abstract-background-with-curved-shapes-k3s7LZzX5xU",
    featured: true,
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "WWDC Exploration 2",
    date: "06.05.23",
    href: "/art/min/wwdcexploration2.webp",
    width: 1500,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-red-background-gg5lVy-Qlz8",
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "WWDC Exploration 3",
    date: "06.05.23",
    href: "/art/min/wwdcexploration3.webp",
    width: 1500,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-green-and-blue-design-jm7hfafFt0g",
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "Wallpaper Wednesday 1",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_1.webp",
    width: 1500,
    height: 1200,
    unsplash: "https://unsplash.com/photos/Utx0LfuC5Mk",
  },
  {
    name: "Wallpaper Wednesday 2",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_2.webp",
    width: 1500,
    height: 1200,
    unsplash: "https://unsplash.com/photos/xzOSH_cUHFo",
  },
  {
    name: "Wallpaper Wednesday 3",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_3.webp",
    width: 1500,
    height: 1200,
    unsplash: "https://unsplash.com/photos/mzzpvI2Z5r8",
  },
  {
    name: "Wallpaper Wednesday 4",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_4.webp",
    width: 1500,
    height: 1200,
    unsplash: "https://unsplash.com/photos/SClBP10L2WI",
  },
  {
    name: "Wallpaper Wednesday 5",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_5.webp",
    width: 1500,
    height: 1200,
    unsplash:
      "https://unsplash.com/photos/a-black-and-white-photo-of-a-curved-object-3q9dlyY8CbI",
    featured: true,
  },
  {
    name: "Dimension",
    date: "01.31.24",
    post: "https://x.com/notcnrad/status/1752759331970285987",
    href: "/art/min/dimension.webp",
    width: 1500,
    height: 1500,
  },
]);
