import "./globals.css";

import localFont from "next/font/local";
import { Ysabeau, Karla } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { AppProps } from "next/app";

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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <main
      className={`${helveticaNeue.variable} ${ysabeau.variable} ${karla.variable} antialiased font-sans h-[100dvh] overflow-hidden`}
    >
      <Head>
        <title>Conrad Crawford</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="fixed top-0 left-0 w-screen h-screen opacity-25 z-[-1]"
        style={{
          background: "url(/shadow.png)",
          backgroundSize: "cover",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 100%)",
        }}
      />

      <Component {...pageProps} key={router.pathname} />
    </main>
  );
}
