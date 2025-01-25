import { motion } from "motion/react";
import Image from "next/image";

// challenge TODO: scrape the heights of each and dynamically determine the order to make the total height of each column closest to equal
const WORKS = [
  {
    name: "Ultrawide Minimalism (1)",
    date: "06.03.24",
    src: "ultrawide_minimalism_1.webp",
    post: "https://x.com/notcnrad/status/1797489177782845750",
  },
  {
    name: "Ultrawide Minimalism (2)",
    date: "06.03.24",
    src: "ultrawide_minimalism_2.webp",
    post: "https://x.com/notcnrad/status/1797489177782845750",
  },
  {
    name: "The Moment Our Eyes First Met",
    date: "04.08.23",
    src: "themomentoureyesfirstmet.webp",
  },
  {
    name: "Arcus Exploration",
    date: "06.20.23",
    src: "arcus.webp",
    post: "https://x.com/notcnrad/status/1671238076180430851",
  },
  {
    name: "Arcus Exploration 2",
    date: "06.21.23",
    src: "arcus_background.webp",
    unsplash:
      "https://unsplash.com/photos/a-dark-background-with-a-pattern-of-wavy-lines-EcWBgAdRqrQ",
    post: "https://x.com/notcnrad/status/1671634017446141956",
  },
  {
    name: "Fluctus",
    date: "01.08.24",
    src: "fluctus.webp",
  },
  {
    name: "Dawn of a New Tomorrow",
    date: "09.11.23",
    src: "dawnofanewtomorrow.webp",
    post: "https://x.com/notcnrad/status/1701223417372971378",
  },
  {
    name: "Neo (Commission - Hop Inc.)",
    date: "01.08.24",
    src: "neo_hop.webp",
    post: "https://x.com/notcnrad/status/1641602543703736324",
  },
  {
    name: "Neo",
    date: "03.29.23",
    src: "neo.webp",
    post: "https://x.com/notcnrad/status/1640931894933028870",
  },
  {
    name: "Light Trail 1",
    date: "01.08.24",
    src: "light_trail_2.webp",
  },
  {
    name: "Light Trail 2",
    date: "01.08.24",
    src: "light_trail.webp",
  },
  {
    name: "Planet",
    date: "05.09.23",
    src: "planet.webp",
    unsplash:
      "https://unsplash.com/photos/a-red-planet-with-a-black-background-LipGKRm7dBM",
    post: "https://x.com/notcnrad/status/1655962324015124483",
  },
  {
    name: "Rik Style",
    date: "01.08.24",
    src: "rik_style.webp",
    unsplash:
      "https://unsplash.com/photos/a-purple-abstract-background-with-lines-and-curves-1uyWq9xVwcE",
  },
  {
    name: "Spectrum",
    date: "01.08.24",
    src: "spectrum.webp",
    unsplash:
      "https://unsplash.com/photos/a-black-background-with-a-multicolored-wave-of-light-cRoeAzZTWSc",
  },
  {
    name: "To Gently Fall Further Away",
    date: "01.08.24",
    src: "togentlyfallfurtheraway.webp",
  },
  {
    name: "WWDC Exploration 1",
    date: "06.05.23",
    src: "wwdcexploration1.webp",
    unsplash:
      "https://unsplash.com/photos/a-blue-abstract-background-with-curved-shapes-k3s7LZzX5xU",
    featured: true,
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "WWDC Exploration 2",
    date: "06.05.23",
    src: "wwdcexploration2.webp",
    unsplash:
      "https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-red-background-gg5lVy-Qlz8",
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "WWDC Exploration 3",
    date: "06.05.23",
    src: "wwdcexploration3.webp",
    unsplash:
      "https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-green-and-blue-design-jm7hfafFt0g",
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "Wallpaper Wednesday 1",
    date: "04.23.23",
    src: "wallpaper_wednesday_42323_1.webp",
    unsplash: "https://unsplash.com/photos/Utx0LfuC5Mk",
  },
  {
    name: "Wallpaper Wednesday 2",
    date: "04.23.23",
    src: "wallpaper_wednesday_42323_2.webp",
    unsplash: "https://unsplash.com/photos/xzOSH_cUHFo",
  },
  {
    name: "Wallpaper Wednesday 3",
    date: "04.23.23",
    src: "wallpaper_wednesday_42323_3.webp",
    unsplash: "https://unsplash.com/photos/mzzpvI2Z5r8",
  },
  {
    name: "Wallpaper Wednesday 4",
    date: "04.23.23",
    src: "wallpaper_wednesday_42323_4.webp",
    unsplash: "https://unsplash.com/photos/SClBP10L2WI",
  },
  {
    name: "Wallpaper Wednesday 5",
    date: "04.23.23",
    src: "wallpaper_wednesday_42323_5.webp",
    unsplash:
      "https://unsplash.com/photos/a-black-and-white-photo-of-a-curved-object-3q9dlyY8CbI",
    featured: true,
  },
  {
    name: "Dimension",
    date: "01.31.24",
    post: "https://x.com/notcnrad/status/1752759331970285987",
    src: "dimension.webp",
  },
] as Array<{
  name: string;
  date: string;
  src: string;
  post?: string;
  unsplash?: string;
  featured?: boolean;
}>;

export const Gallery = () => {
  return (
    <motion.div
      initial={{
        y: 10,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      exit={{
        y: 10,
        opacity: 0,
      }}
      transition={{
        duration: 1,
        ease: [0.26, 1, 0.6, 1],
      }}
      className="grid h-auto w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 py-14"
    >
      {Array(3)
        .fill("")
        .map((_val, i, arr) => (
          <div key={i} className="relative flex h-auto w-full flex-col gap-4">
            {WORKS.slice(
              i * (WORKS.length / arr.length),
              i * (WORKS.length / arr.length) + WORKS.length / arr.length
            ).map((piece) => (
              <ImageComponent key={piece.name} piece={piece} />
            ))}
          </div>
        ))}
    </motion.div>
  );
};

const ImageComponent = ({ piece }: { piece: (typeof WORKS)[number] }) => {
  return (
    <div className="group relative h-auto w-full cursor-pointer overflow-visible rounded-md">
      <div
        className="absolute bottom-0 z-5 min-h-[min(100%,10rem)] w-full rounded-md transition-all duration-200 group-hover:bg-black/15 group-hover:backdrop-blur-md"
        style={{ mask: "linear-gradient(transparent, black, black)" }}
      />

      <div className="absolute bottom-0 z-10 flex min-h-16 w-full flex-col items-center justify-center gap-1 bg-transparent py-4 opacity-0 transition-all duration-200 group-hover:opacity-100">
        <p className="text-sm font-semibold text-white/70">
          {piece.name} {piece.featured ? "*" : null}
        </p>
        <a
          href={piece.post ?? "https://x.com/notcnrad/"}
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-row text-sm font-medium text-white/30 hover:text-white/60"
        >
          {piece.date}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-auto ml-0.5 size-2"
          >
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </a>

        <a
          href={piece.unsplash ?? piece.src}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 flex flex-row rounded-[4px] border border-white/10 bg-black/25 px-2 py-1 text-xs font-semibold text-white/75 transition-all duration-100 hover:border-white/15 hover:bg-black/50 hover:text-white"
        >
          View {piece.unsplash ? "on Unsplash" : null}
        </a>
      </div>

      <Image
        key={piece.name}
        width={400}
        height={400}
        src={`/art/${piece.src}`}
        alt={piece.name}
        className="z-10 h-fit w-full rounded-md object-cover"
      />
    </div>
  );
};
