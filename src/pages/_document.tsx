import { Html, Head, Main, NextScript } from "next/document";
import { CSideScript } from "@c-side/react";

export default function Document() {
    return (
        <Html className="dark">
            <Head>
                <CSideScript />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
