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
      <body className="h-screen overflow-hidden bg-[#0d0d0f] text-[#c0bedd]">
        <AppProvider>
          <div className="flex h-screen overflow-hidden">
            <aside className="flex w-55 shrink-0 flex-col border-r border-[#2a2a35] bg-[#111116]">
              <div className="flex items-center gap-2 border-b border-[#2a2a35] px-4 py-5">
                <div className="h-2 w-2 shrink-0 rounded-full bg-[#534ab7]" />
                <span className="text-sm font-semibold tracking-widest text-[#e0dff8] uppercase">
                  Jarvis
                </span>
              </div>
              <SidebarClient />
            </aside>
            <main className="flex flex-1 flex-col overflow-hidden bg-[#0d0d0f]">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
