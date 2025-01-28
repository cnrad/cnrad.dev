import "./globals.css";

import localFont from "next/font/local";
import { Ysabeau, Karla } from "next/font/google";
import Head from "next/head";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ThemeProvider } from "next-themes";

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

        <div
          className="fixed top-0 left-2/5 w-full h-screen z-[-3] flex flex-col gap-32 items-center justify-center opacity-75"
          style={{
            maskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 10%, rgba(0,0,0,0))",
          }}
        >
          <div
            className="mt-20 min-h-64 blur-md rotate-30 w-[200rem] bg-light z-[-2]"
            style={{
              animation: "sway 6s infinite",
            }}
          />
          <div
            className="min-h-84 blur-md rotate-30 w-[200rem] bg-light z-[-2]"
            style={{
              animation: "sway 6s infinite",
              animationDelay: "0.5s",
            }}
          />
          <div
            className="min-h-36 mt-10 blur-md rotate-30 w-[200rem] bg-light z-[-2]"
            style={{
              animation: "sway 6s infinite",
              animationDelay: "1s",
            }}
          />
        </div>

        <AnimatePresence mode="popLayout">
          <Component {...pageProps} key={router.pathname} />
        </AnimatePresence>
      </motion.main>
    </ThemeProvider>
  );
}
