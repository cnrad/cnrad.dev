import "../globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div className="flex flex-row justify-center">
            <Component {...pageProps} />
        </div>
    );
}
export default MyApp;
