import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Ysabeau } from "next/font/google";

const ysabeau = Ysabeau({ variable: "--font-ysabeau" });

const helveticaNeue = localFont({
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

export const metadata: Metadata = {
  title: "Conrad Crawford",
  description: "software engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${helveticaNeue.variable} ${ysabeau.variable} antialiased p-14 font-sans h-[100dvh]`}
      >
        <div
          className="fixed top-0 left-0 w-screen h-screen opacity-25 z-[-1]"
          style={{
            background: "url(/shadow.png)",
            backgroundSize: "cover",
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 100%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
