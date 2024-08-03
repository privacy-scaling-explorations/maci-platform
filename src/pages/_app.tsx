import "@rainbow-me/rainbowkit/styles.css";
import { Krona_One as kronaOneFont } from "next/font/google";

import { Footer } from "~/components/Footer";
import Header from "~/components/Header";
import { Providers } from "~/providers";
import "~/styles/globals.css";
import { api } from "~/utils/api";

import type { AppProps } from "next/app";

const kronaOne = kronaOneFont({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});
const navLinks = [
  {
    href: "/",
    children: "Organizations",
  },
  {
    href: "/Discussions/info",
    children: "Current Voting",
  },
];
const MyApp = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <style global jsx>{`
      :root {
        --font-inter: ${kronaOne.style.fontFamily};
      }
    `}</style>

    <main className={`${kronaOne.className} grid min-h-screen grid-rows-[72px,1fr,68px] bg-[#B6CDEC]`}>
      <Header navLinks={navLinks} />

      <div className=" container mx-auto max-w-screen-2xl p-4 font-sans">
        <Component {...pageProps} />
      </div>

      <Footer />
    </main>
  </Providers>
);

export default api.withTRPC(MyApp);
