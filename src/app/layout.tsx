import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { StoreProvider } from "../../providers/StoreProvider";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import RootLayoutWrapper from "./RootLayoutWrapper";

// ✅ Add Urbanist font
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Street-10",
  description: "Street-10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` ${urbanist.variable} min-h-screen antialiased`}
    >
      <body className="font-[var(--font-urbanist)]">
        <StoreProvider>
          <RootLayoutWrapper>{children}</RootLayoutWrapper>
        </StoreProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
