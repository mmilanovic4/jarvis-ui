import { Poppins } from "next/font/google";
import SidebarClient from "./components/sidebar-client";
import { AppProvider } from "./context/app-context";

import "./globals.css";

export const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Jarvis",
  description: "AI assistant interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${font.className} subpixel-antialiased`}>
      <body className="text-soft bg-base h-screen overflow-hidden">
        <AppProvider>
          <div className="flex h-screen overflow-hidden">
            <aside className="border-line bg-surface flex w-55 shrink-0 flex-col border-r">
              <div className="border-line flex items-center gap-2 border-b px-4 py-5">
                <div className="bg-accent h-2 w-2 shrink-0 rounded-full" />
                <span className="text-bright text-sm font-semibold tracking-widest uppercase">
                  Jarvis
                </span>
              </div>
              <SidebarClient />
            </aside>
            <main className="bg-base flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
