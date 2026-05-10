import { Space_Grotesk } from "next/font/google";
import SidebarClient from "./components/sidebar-client";
import { AppProvider } from "./context/app-context";

import "./globals.css";

export const font = Space_Grotesk({
  subsets: ["latin"],
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
            <SidebarClient />
            <main className="bg-base flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
