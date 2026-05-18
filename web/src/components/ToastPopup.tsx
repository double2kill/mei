import { useEffect } from "react";

type ToastPopupProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function ToastPopup({
  message,
  onDismiss,
  durationMs = 2500,
}: ToastPopupProps) {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[70] max-w-[min(100vw-2rem,24rem)] -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-medium leading-snug text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
    >
      {message}
    </div>
  );
}
