import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import { SidebarClient } from "@/app/components";
import { AppProvider } from "@/app/context/app-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const fontSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Jarvis",
  description: "AI assistant interface",
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} subpixel-antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        const stored = localStorage.getItem('theme');
        const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (dark) document.documentElement.classList.add('dark');
      })();
    `,
          }}
        />
      </head>
      <body className="flex h-screen overflow-hidden">
        <AppProvider>
          <TooltipProvider>
            <SidebarProvider className="flex flex-1 overflow-hidden">
              <SidebarClient />
              <main className="flex flex-1 flex-col overflow-hidden">
                {children}
              </main>
            </SidebarProvider>
          </TooltipProvider>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
