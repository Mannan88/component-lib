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

export const metadata: Metadata = {
  title: {
    default: "WebGL & Shader Experiments",
    template: "%s | WebGL & Shader Experiments",
  },
  description: "A personal collection of WebGL, shader, and interaction experiments built with Three.js, GLSL, Next.js, and GSAP.",
  keywords: ["WebGL", "Three.js", "Shaders", "GLSL", "Next.js", "React", "Creative Coding", "GSAP"],
  metadataBase: new URL("https://mannan88.github.io/component-lib/"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WebGL & Shader Experiments",
    description: "A personal collection of WebGL, shader, and interaction experiments built with Three.js and GLSL.",
    siteName: "Component Lib",
  },

  twitter: {
    card: "summary_large_image",
    title: "WebGL & Shader Experiments",
    description: "A personal collection of WebGL, shader, and interaction experiments built with Three.js and GLSL.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
        icon: "/favicon.ico",
   },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
