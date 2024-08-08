import "@rainbow-me/rainbowkit/styles.css";
import { Inter } from "next/font/google";

import { Providers } from "~/providers";
import "~/styles/globals.css";
import { api } from "~/utils/api";

import type { AppProps } from "next/app";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <style global jsx>{`
      :root {
        --font-inter: ${inter.style.fontFamily};
      }
    `}</style>

    <main className={`${inter.variable}  min-h-screen font-sans`}>
      <Component {...pageProps} />
    </main>
  </Providers>
);

export default api.withTRPC(MyApp);
