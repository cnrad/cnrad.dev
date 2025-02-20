import "./globals.css";

import localFont from "next/font/local";
import { Ysabeau, Karla } from "next/font/google";
import Head from "next/head";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ThemeProvider } from "next-themes";
import Image from "next/image";

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
    <ThemeProvider>
      <motion.main
        layout
        className={`${helveticaNeue.variable} ${ysabeau.variable} ${karla.variable} antialiased font-sans h-[100dvh] overflow-hidden @container/screen`}
      >
        <Head>
          <title>Conrad Crawford</title>
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>

        <Image
          src="/shadow.png"
          fill
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none select-none opacity-15"
          alt="A shadow casted by the light coming through a windowpane"
          style={{
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 75%)",
          }}
        />

        {/* Corner */}
        <div className="@max-sm:hidden absolute top-4 left-4 w-3 h-3 border-b border-r border-tertiary/20 border-dashed ml-[1px] mt-[1px]" />
        <div
          className="@max-sm:hidden absolute top-7 left-7 w-10 h-10 border-t border-l border-tertiary/20"
          style={{
            maskImage:
              "linear-gradient(to bottom right, rgba(0,0,0,1), rgba(0,0,0,0) 50%)",
          }}
        />

        <AnimatePresence mode="popLayout">
          <Component {...pageProps} key={router.pathname} />
        </AnimatePresence>
      </motion.main>
    </ThemeProvider>
  );
}
