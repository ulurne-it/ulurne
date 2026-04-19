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
  title: "ULurne | Learn. Scroll. Grow.",
  description: "The addictive education platform for students. Learn what matters in a way that sticks.",
  keywords: ["EdTech", "Social Learning", "Short-form Education", "Student Tutors"],
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
