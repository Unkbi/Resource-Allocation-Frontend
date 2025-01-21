import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import StoreProvide from "./StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "resorce allocations",
  description: "Resorce Allocations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StoreProvide>
        {children}
        </StoreProvide>
      </body>
    </html>
  );
}
