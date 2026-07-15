import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Describe the site you want. SiteChat asks the right follow-up questions, builds it live, and even restyles its own interface on request.";

export const metadata: Metadata = {
  title: "SiteChat — build websites by talking",
  description,
  openGraph: {
    title: "SiteChat — build websites by talking",
    description,
    siteName: "SiteChat",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SiteChat — build websites by talking",
    description,
  },
};

// Runs before hydration so the saved theme applies without a flash.
const themeBoot = `
try {
  var t = localStorage.getItem("sitechat.theme");
  if (t) document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="porcelain"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        {/* Site-theme fonts, one weight each — used by the theme swatch chips */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&family=Cormorant+Garamond:wght@600&family=Baloo+2:wght@600&family=Space+Grotesk:wght@600&family=Inter:wght@600&family=Lora:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
