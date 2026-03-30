import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "HMS Impeccable | Modern Hospital Management",
  description: "A premium, efficient, and reliable hospital management system designed for modern healthcare.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter selection:bg-primary/20" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
