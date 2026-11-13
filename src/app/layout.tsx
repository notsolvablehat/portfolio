import type { Metadata } from "next";
import { Audiowide, Bitcount_Prop_Single, Montserrat } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Header from "@/components/Header";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const bitcount = Bitcount_Prop_Single({
  variable: "--font-bitcount",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false, // no metric overrides exist for this font
});

export const metadata: Metadata = {
  title: "Mohammed Yaseen Agha — Software Engineer",
  description: "Portfolio of Mohammed Yaseen Agha, software engineer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${audiowide.variable} ${bitcount.variable} antialiased`}
    >
      <body>
        <SmoothScroll>
          <Header />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
