import type { Metadata } from "next";
import { Inter, Work_Sans, Libre_Caslon_Text } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const libreCaslonText = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrbanLease",
  description: "Nền tảng thuê bất động sản chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      {...mantineHtmlProps}
      className={`${inter.variable} ${workSans.variable} ${libreCaslonText.variable}`}
      style={{ height: "100%", WebkitFontSmoothing: "antialiased" }}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-cream)",
          color: "var(--color-brand)",
          fontFamily: "var(--font-body)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
