import { ReactNode } from "react";

import { AppHeader } from "@/components/AppHeader";

export default function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-[100vh] flex-col">
      <header>
        <AppHeader />
      </header>
      <main className="flex-1">{children}</main>
      <footer>
        <div className="flex items-center justify-center gap-2 bg-gray-200 p-2">
          <span>TheToolk.it</span> <span>v0.1.0</span> <span>&copy;2025</span>
        </div>
      </footer>
    </div>
  );
}
