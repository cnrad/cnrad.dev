import "../globals.css";
import type { AppProps } from "next/app";
import Spotify from "../components/Spotify";
import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { AnimatePresence } from "framer-motion";
import { Router } from "next/router";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <title>Conrad Crawford</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta
                    name="keywords"
                    content="cnrad, Conrad Crawford, Conrad, Crawford, web developer, github, typescript"
                />
                <meta name="description" content="Conrad Crawford - Fullstack TypeScript Developer." />
                <meta name="author" content="Conrad Crawford" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
                <noscript>
                    <style>{"* {opacity: 1 !important;}"}</style>
                </noscript>
            </Head>
            <div className="flex flex-row justify-center w-full h-full bg-gradient-to-bl from-black to-[#0d131f]">
                <Nav />
                <div className="w-[80%] md:w-[50rem]">
                    <AnimatePresence exitBeforeEnter>
                        <Component {...pageProps} />
                    </AnimatePresence>
                    <Footer />
                </div>
                <Spotify />
            </div>
        </>
    );
}
export default MyApp;
