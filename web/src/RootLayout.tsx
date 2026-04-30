import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col font-sans antialiased">
      <SiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
