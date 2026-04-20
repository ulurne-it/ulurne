import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ulurne.com"),
  title: {
    default: "ULurne | Students Learning Media & Addictive Education",
    template: "%s | ULurne"
  },
  description: "ULurne is the world's first addictive short-form learning ecosystem for students. Master any skill in 120-second bite-sized steps. The ultimate learning media platform.",
  keywords: [
    "ULurne", 
    "Students Learning Media", 
    "Short-form Education", 
    "EdTech", 
    "Social Learning", 
    "Bite-sized Learning", 
    "Student Tutors", 
    "Micro-learning",
    "Educational Social Media"
  ],
  authors: [{ name: "ULurne Team" }],
  creator: "ULurne",
  publisher: "ULurne",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ulurne.com",
    siteName: "ULurne",
    title: "ULurne | The Future of Student Learning Media",
    description: "Master any skill with 120-second bite-sized lessons. Join the addictive education revolution.",
    images: [
      {
        url: "/og-image.png", // Assuming this will be created or exists
        width: 1200,
        height: 630,
        alt: "ULurne - Learn. Scroll. Grow.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ULurne | Students Learning Media",
    description: "The addictive education platform for students. Learn what matters in 120 seconds.",
    images: ["/og-image.png"],
    creator: "@ulurne",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://ulurne.com",
  },
};

export const viewport: Viewport = {
  themeColor: "#6C5CE7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans min-h-full flex flex-col bg-background text-foreground`}
      >
        <StoreProvider>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Toaster 
            position="bottom-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(10, 10, 15, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '16px 20px',
                fontSize: '10px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#fff',
              },
              className: 'font-heading italic',
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
