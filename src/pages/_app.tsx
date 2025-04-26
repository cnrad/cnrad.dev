import "./globals.css";

import localFont from "next/font/local";
import { Ysabeau, Karla } from "next/font/google";
import Head from "next/head";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/Nav";
import { MobileNav } from "@/components/MobileNav";

const ysabeau = Ysabeau({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-ysabeau",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

const helveticaNeue = localFont({
  weight: "300",
  src: [
    {
      path: "../fonts/helvetica-neue/HelveticaNeueLight.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/helvetica-neue/HelveticaNeueRoman.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/helvetica-neue/HelveticaNeueMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/helvetica-neue/HelveticaNeueBold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/helvetica-neue/HelveticaNeueItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/helvetica-neue/HelveticaNeueMediumItalic.otf",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-helvetica-neue",
});

export default function App({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const click = new Audio("/pop.mp3");
    click.volume = 0.5;
    void click.play().catch(() => null);
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>Conrad Crawford</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="prefetch" fetchPriority="high" href="/main/cside.webp" />
        <link rel="prefetch" fetchPriority="high" href="/main/dimension.webp" />
        <link rel="prefetch" fetchPriority="high" href="/main/incard.webp" />

        <link rel="prefetch" href="/art/figura_thumbnail.webp" />
        <link rel="prefetch" href="/art/spherus_thumbnail.webp" />
      </Head>
      <div
        className={`${helveticaNeue.variable} ${ysabeau.variable} ${karla.variable} @container/screen h-full w-full font-sans antialiased`}
      >
        <ThemeProvider>
          {/* Sun rays */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.2,
            }}
            transition={{
              duration: 2,
              ease: [0.26, 1, 0.6, 1],
            }}
            className="fixed top-0 left-0 z-[-3] flex h-screen w-screen flex-col items-center justify-center gap-32 bg-gradient-to-l from-[#121212] to-white to-75%"
            style={{
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 30%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)",
            }}
          >
            <div
              className="bg-background z-[-2] mt-80 ml-[50vw] min-h-34 w-[200vw] blur-md"
              style={{
                animation: "sway 7s infinite",
              }}
            />
            <div
              className="bg-background z-[-2] mt-48 ml-[50vw] min-h-30 w-[200vw] blur-md"
              style={{
                animation: "sway 6s infinite",
              }}
            />
            <div
              className="bg-background z-[-2] mt-18 ml-[50vw] min-h-64 w-[200vw] blur-md"
              style={{
                animation: "sway 8s infinite",
              }}
            />
          </motion.div>

          <Nav />
          <MobileNav />

          <motion.main
            initial={{
              opacity: 0,
              scale: 0.98,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1,
              ease: [0.26, 1, 0.6, 1],
            }}
            layout
            className="relative max-sm:h-[100svh] max-sm:overflow-y-auto"
          >
            <AnimatePresence mode="popLayout">
              <Component {...pageProps} key={router.pathname} />
            </AnimatePresence>
          </motion.main>
        </ThemeProvider>
      </div>
    </>
  );
}
