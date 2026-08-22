import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppShellProps {
  readonly children: ReactNode;
}

export function AppShell({ children }: Readonly<AppShellProps>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
