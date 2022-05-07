import "../globals.css";
import type { AppProps } from "next/app";
import Spotify from "../components/Spotify";
import Head from "next/head";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { AnimatePresence } from "framer-motion";
import { Router } from "next/router";

import "react-tippy/dist/tippy.css";

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps, router }: AppProps) {
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        void new Audio("/pop.mp3").play().catch(() => null);
    }, [router.pathname]);

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
                <meta name="description" content="Conrad Crawford - Software Engineer" />
                <meta name="author" content="Conrad Crawford" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </Head>

            <div className="text-black dark:text-white flex flex-row justify-center w-full h-full bg-gradient-to-bl from-white to-[#fff] dark:from-black dark:to-[#0d131f] min-h-screen">
                <Nav />
                <div className="w-[80%] md:w-[45rem]">
                    <AnimatePresence exitBeforeEnter>
                        <Component {...pageProps} key={router.pathname} />
                    </AnimatePresence>
                    <Footer />
                </div>
                <Spotify />
            </div>
        </>
    );
}
export default MyApp;
