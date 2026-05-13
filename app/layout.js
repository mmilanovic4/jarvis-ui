import { Outfit } from "next/font/google";
import { SidebarClient } from "@/app/components";
import { AppProvider } from "@/app/context/app-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const font = Outfit({
  subsets: ["latin"],
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
      className={`${font.className} subpixel-antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        try {
          var theme = localStorage.getItem('theme');
          if (theme === 'dark') document.documentElement.classList.add('dark');
        } catch(e) {}
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
