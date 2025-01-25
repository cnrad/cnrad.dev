import "./globals.css";

import localFont from "next/font/local";
import { Ysabeau, Karla } from "next/font/google";
import Head from "next/head";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

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
    <motion.main
      layout
      className={`${helveticaNeue.variable} ${ysabeau.variable} ${karla.variable} antialiased font-sans h-[100dvh] overflow-hidden @container/screen`}
    >
      <Head>
        <title>Conrad Crawford</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <div
        className="fixed top-0 left-0 w-screen h-screen opacity-25 z-[-1]"
        style={{
          background: "url(/shadow.png)",
          backgroundSize: "cover",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 100%)",
        }}
      /> */}

      <div className="fixed top-8 left-1/2 w-full h-screen z-[-3] flex flex-col gap-32 items-center justify-center opacity-75">
        <div className="fixed top-0 left-0 min-h-4 blur-sm w-[200rem] bg-[#b0b0b0] z-[-2]" />
        <div
          className="min-h-72 blur-md rotate-30 w-[200rem] bg-[#c5c5c5] z-[-2]"
          style={{
            animation: "sway 6s infinite",
          }}
        />
        <div
          className="min-h-84 blur-md rotate-30 w-[200rem] bg-[#c5c5c5] z-[-2]"
          style={{
            animation: "sway 6s infinite",
            animationDelay: "0.5s",
          }}
        />
        <div
          className="min-h-32 mt-10 blur-md rotate-30 w-[200rem] bg-[#c5c5c5] z-[-2]"
          style={{
            animation: "sway 6s infinite",
            animationDelay: "1s",
          }}
        />
        <div className="fixed top-0 left-0 w-full h-full z-[-1] bg-linear-to-l from-white/0 to-white to-55% " />
      </div>

      <AnimatePresence mode="popLayout">
        <Component {...pageProps} key={router.pathname} />
      </AnimatePresence>
    </motion.main>
  );
}
