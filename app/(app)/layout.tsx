import { ReactNode } from "react";

import { AppFooter } from "@/components/AppFooter";
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
        <AppFooter />
      </footer>
    </div>
  );
}
