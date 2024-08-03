import "@rainbow-me/rainbowkit/styles.css";
import { Krona_One as kronaOneFont } from "next/font/google";

import { Providers } from "~/providers";
import "~/styles/globals.css";
import { api } from "~/utils/api";

import type { AppProps } from "next/app";

const kronaOne = kronaOneFont({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <style global jsx>{`
      :root {
        --font-inter: ${kronaOne.style.fontFamily};
      }
    `}</style>

    <main className={`${kronaOne.className} min-h-screen font-sans`}>
      <Component {...pageProps} />
    </main>
  </Providers>
);

export default api.withTRPC(MyApp);
