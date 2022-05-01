import "../globals.css";
import type { AppProps } from "next/app";
import { Spotify } from "../components/spotify";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div className="flex flex-row justify-center w-screen bg-gradient-to-bl from-black to-[#060c1a]">
            <Component {...pageProps} />
            <Spotify />
        </div>
    );
}
export default MyApp;
