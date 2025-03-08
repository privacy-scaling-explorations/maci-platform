import { DM_Sans as DmSans, Share_Tech_Mono as ShareTechMono, Inter } from "next/font/google";

const dmSans = DmSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const shareTechMono = ShareTechMono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const fontVariables = `${dmSans.className} ${dmSans.variable} ${shareTechMono.variable} ${inter.variable}`;
