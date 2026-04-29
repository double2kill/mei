import type { ReactNode } from "react";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col font-sans antialiased">{children}</div>
  );
}
