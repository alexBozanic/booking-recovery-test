import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/lib/SessionProvider"; // Import our new provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Booking Recovery Tool",
  description: "Recover abandoned calendar bookings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider> {/* Add the provider here */}
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
