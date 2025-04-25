import { MotionProps, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { StaticImageData } from "next/image";

import ultrawide_minimalism_1 from "../../../public/art/min/ultrawide_minimalism_1.webp";
import ultrawide_minimalism_2 from "../../../public/art/min/ultrawide_minimalism_2.webp";
import streams from "../../../public/art/min/streams.webp";
import themomentoureyesfirstmet from "../../../public/art/min/themomentoureyesfirstmet.webp";
import arcus from "../../../public/art/min/arcus.webp";
import arcus_background from "../../../public/art/min/arcus_background.webp";
import fluctus from "../../../public/art/min/fluctus.webp";
import dawnofanewtomorrow from "../../../public/art/min/dawnofanewtomorrow.webp";
import neo_hop from "../../../public/art/min/neo_hop.webp";
import neo from "../../../public/art/min/neo.webp";
import light_trail_2 from "../../../public/art/min/light_trail_2.webp";
import light_trail from "../../../public/art/min/light_trail.webp";
import planet from "../../../public/art/min/planet.webp";
import wallpaper_wednesday_unsplash from "../../../public/art/min/wallpaper_wednesday_unsplash.webp";
import rik_style from "../../../public/art/min/rik_style.webp";
import spectrum from "../../../public/art/min/spectrum.webp";
import togentlyfallfurtheraway from "../../../public/art/min/togentlyfallfurtheraway.webp";
import wwdcexploration1 from "../../../public/art/min/wwdcexploration1.webp";
import wwdcexploration2 from "../../../public/art/min/wwdcexploration2.webp";
import wwdcexploration3 from "../../../public/art/min/wwdcexploration3.webp";
import wallpaper_wednesday_42323_1 from "../../../public/art/min/wallpaper_wednesday_42323_1.webp";
import wallpaper_wednesday_42323_2 from "../../../public/art/min/wallpaper_wednesday_42323_2.webp";
import wallpaper_wednesday_42323_3 from "../../../public/art/min/wallpaper_wednesday_42323_3.webp";
import wallpaper_wednesday_42323_4 from "../../../public/art/min/wallpaper_wednesday_42323_4.webp";
import wallpaper_wednesday_42323_5 from "../../../public/art/min/wallpaper_wednesday_42323_5.webp";
import dimension from "../../../public/art/min/dimension.webp";

export const WORKS = [
  {
    name: "Ultrawide Minimalism (1)",
    date: "06.03.24",
    href: "/art/min/ultrawide_minimalism_1.webp",
    src: ultrawide_minimalism_1,
    post: "https://x.com/notcnrad/status/1797489177782845750",
  },
  {
    name: "Ultrawide Minimalism (2)",
    date: "06.03.24",
    href: "/art/min/ultrawide_minimalism_2.webp",
    src: ultrawide_minimalism_2,
    post: "https://x.com/notcnrad/status/1797489177782845750",
  },
  {
    name: "Streams",
    date: "11.07.24",
    href: "/art/min/streams.webp",
    src: streams,
    unsplash: "https://unsplash.com/photos/Q6gZw7Hnl5w",
    post: "https://x.com/notcnrad/status/1857255860071759885",
  },
  {
    name: "The Moment Our Eyes First Met",
    date: "04.08.23",
    href: "/art/min/themomentoureyesfirstmet.webp",
    src: themomentoureyesfirstmet,
  },
  {
    name: "Arcus Exploration",
    date: "06.20.23",
    href: "/art/min/arcus.webp",
    src: arcus,
    post: "https://x.com/notcnrad/status/1671238076180430851",
  },
  {
    name: "Arcus Exploration 2",
    date: "06.21.23",
    href: "/art/min/arcus_background.webp",
    src: arcus_background,
    unsplash:
      "https://unsplash.com/photos/a-dark-background-with-a-pattern-of-wavy-lines-EcWBgAdRqrQ",
    post: "https://x.com/notcnrad/status/1671634017446141956",
  },
  {
    name: "Fluctus",
    date: "01.08.24",
    href: "/art/min/fluctus.webp",
    src: fluctus,
  },
  {
    name: "Dawn of a New Tomorrow",
    date: "09.11.23",
    href: "/art/min/dawnofanewtomorrow.webp",
    src: dawnofanewtomorrow,
    post: "https://x.com/notcnrad/status/1701223417372971378",
  },
  {
    name: "Neo (Commission - Hop Inc.)",
    date: "01.08.24",
    href: "/art/min/neo_hop.webp",
    src: neo_hop,
    post: "https://x.com/notcnrad/status/1641602543703736324",
  },
  {
    name: "Neo",
    date: "03.29.23",
    href: "/art/min/neo.webp",
    src: neo,
    post: "https://x.com/notcnrad/status/1640931894933028870",
  },
  {
    name: "Light Trail 1",
    date: "01.08.24",
    href: "/art/min/light_trail_2.webp",
    src: light_trail_2,
  },
  {
    name: "Light Trail 2",
    date: "01.08.24",
    href: "/art/min/light_trail.webp",
    src: light_trail,
  },
  {
    name: "Planet",
    date: "05.09.23",
    href: "/art/min/planet.webp",
    src: planet,
    unsplash:
      "https://unsplash.com/photos/a-red-planet-with-a-black-background-LipGKRm7dBM",
    post: "https://x.com/notcnrad/status/1655962324015124483",
  },
  {
    name: "Canalis",
    date: "06.18.23",
    href: "/art/min/wallpaper_wednesday_unsplash.webp",
    src: wallpaper_wednesday_unsplash,
    unsplash: "https://unsplash.com/photos/08pUkir23Z4",
    featured: true,
  },
  {
    name: "Rik Style",
    date: "01.08.24",
    href: "/art/min/rik_style.webp",
    src: rik_style,
    unsplash:
      "https://unsplash.com/photos/a-purple-abstract-background-with-lines-and-curves-1uyWq9xVwcE",
  },
  {
    name: "Spectrum",
    date: "01.08.24",
    href: "/art/min/spectrum.webp",
    src: spectrum,
    unsplash:
      "https://unsplash.com/photos/a-black-background-with-a-multicolored-wave-of-light-cRoeAzZTWSc",
  },
  {
    name: "To Gently Fall Further Away",
    date: "01.08.24",
    href: "/art/min/togentlyfallfurtheraway.webp",
    src: togentlyfallfurtheraway,
  },
  {
    name: "WWDC Exploration 1",
    date: "06.05.23",
    href: "/art/min/wwdcexploration1.webp",
    src: wwdcexploration1,
    unsplash:
      "https://unsplash.com/photos/a-blue-abstract-background-with-curved-shapes-k3s7LZzX5xU",
    featured: true,
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "WWDC Exploration 2",
    date: "06.05.23",
    href: "/art/min/wwdcexploration2.webp",
    src: wwdcexploration2,
    unsplash:
      "https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-red-background-gg5lVy-Qlz8",
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "WWDC Exploration 3",
    date: "06.05.23",
    href: "/art/min/wwdcexploration3.webp",
    src: wwdcexploration3,
    unsplash:
      "https://unsplash.com/photos/a-close-up-of-a-cell-phone-with-a-green-and-blue-design-jm7hfafFt0g",
    post: "https://x.com/notcnrad/status/1665776662871527425",
  },
  {
    name: "Wallpaper Wednesday 1",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_1.webp",
    src: wallpaper_wednesday_42323_1,
    unsplash: "https://unsplash.com/photos/Utx0LfuC5Mk",
  },
  {
    name: "Wallpaper Wednesday 2",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_2.webp",
    src: wallpaper_wednesday_42323_2,
    unsplash: "https://unsplash.com/photos/xzOSH_cUHFo",
  },
  {
    name: "Wallpaper Wednesday 3",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_3.webp",
    src: wallpaper_wednesday_42323_3,
    unsplash: "https://unsplash.com/photos/mzzpvI2Z5r8",
  },
  {
    name: "Wallpaper Wednesday 4",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_4.webp",
    src: wallpaper_wednesday_42323_4,
    unsplash: "https://unsplash.com/photos/SClBP10L2WI",
  },
  {
    name: "Wallpaper Wednesday 5",
    date: "04.23.23",
    href: "/art/min/wallpaper_wednesday_42323_5.webp",
    src: wallpaper_wednesday_42323_5,
    unsplash:
      "https://unsplash.com/photos/a-black-and-white-photo-of-a-curved-object-3q9dlyY8CbI",
    featured: true,
  },
  {
    name: "Dimension",
    date: "01.31.24",
    post: "https://x.com/notcnrad/status/1752759331970285987",
    href: "/art/min/dimension.webp",
    src: dimension,
  },
] as Array<{
  name: string;
  date: string;
  href?: string;
  src: StaticImageData;
  post?: string;
  unsplash?: string;
  featured?: boolean;
}>;

const IMAGE_TRANSITIONS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
      ease: [0.26, 1, 0.6, 1],
    },
  },
};

export const Gallery = () => {
  const [cols, setCols] = useState([0, 1, 2]);

  // Masonry
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 1024) {
        setCols([0]);
      } else if (window.innerWidth < 1280) {
        setCols([0, 1]);
      } else {
        setCols([0, 1, 2]);
      }
    };

    updateCols(); // run initially

    window.addEventListener("resize", updateCols);

    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const columns = useMemo(
    () =>
      cols.map((i, _, arr) => (
        <motion.div
          key={i}
          initial={IMAGE_TRANSITIONS.initial}
          animate={IMAGE_TRANSITIONS.animate}
          exit={IMAGE_TRANSITIONS.exit}
          transition={{
            delay: i / 14,
            duration: 1,
            ease: [0.26, 1, 0.6, 1],
          }}
          className="relative flex h-auto w-full flex-col gap-4"
        >
          {WORKS.slice(
            i * (WORKS.length / arr.length),
            i * (WORKS.length / arr.length) + WORKS.length / arr.length,
          ).map((piece) => (
            <ImageComponent key={piece.name} piece={piece} />
          ))}
        </motion.div>
      )),
    [cols],
  );

  return (
    <>
      <div className="flex flex-col gap-2 pb-14">
        <div className="xs:px-10 grid h-auto w-full grid-cols-1 gap-4 px-8 sm:px-4 sm:py-10 lg:grid-cols-2 xl:grid-cols-3 min-xl:px-10">
          <motion.h3
            initial={IMAGE_TRANSITIONS.initial}
            animate={IMAGE_TRANSITIONS.animate}
            exit={IMAGE_TRANSITIONS.exit}
            transition={{
              duration: 1,
              ease: [0.26, 1, 0.6, 1],
            }}
            className="text-sm leading-none font-bold min-sm:hidden"
          >
            individuals
          </motion.h3>

          {columns}
        </div>
        <p className="text-tertiary xs:px-14 px-8 text-center text-xs brightness-125 max-sm:pt-4 sm:px-4">
          All works © Conrad Crawford. <br /> Do not reproduce without the
          expressed written consent of Conrad Crawford.
        </p>
      </div>
    </>
  );
};

const ImageComponent = ({
  piece,
  ...props
}: { piece: (typeof WORKS)[number] } & MotionProps) => {
  return (
    <motion.div
      className="group bg-tertiary/25 relative h-auto w-full overflow-visible rounded-md transition-transform duration-400 ease-out hover:scale-98"
      {...props}
    >
      <div
        className="absolute bottom-0 z-5 min-h-[min(100%,10rem)] w-full rounded-md transition-all duration-200 group-hover:bg-black/15 group-hover:backdrop-blur-md"
        style={{ mask: "linear-gradient(transparent, black, black)" }}
      />

      <div className="absolute bottom-0 z-10 flex min-h-16 w-full flex-col items-center justify-center gap-1 bg-transparent py-4 opacity-0 transition-all duration-200 group-hover:opacity-100">
        <p className="cursor-default text-sm font-semibold text-white/85">
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

        {piece.unsplash ? (
          <a
            href={piece.unsplash ?? piece.src}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 flex flex-row rounded-[4px] border border-white/10 bg-black/25 px-2 py-1 text-xs font-semibold text-white/75 transition-all duration-100 hover:border-white/15 hover:bg-black/50 hover:text-white"
          >
            View {piece.unsplash ? "on Unsplash" : null}
          </a>
        ) : null}
      </div>

      {/* eslint-disable @next/next/no-img-element */}
      <img
        key={piece.name}
        src={piece.href}
        alt={piece.name}
        width={piece.src.width}
        height={piece.src.height}
        fetchPriority="high"
        className="bg-tertiary/25 z-10 w-full rounded-md object-cover"
      />
    </motion.div>
  );
};
