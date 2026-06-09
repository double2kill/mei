type PageStatusProps = {
  loading?: boolean;
  error?: string | null;
};

export function PageStatus({ loading, error }: PageStatusProps) {
  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <p className="text-center text-zinc-700 dark:text-zinc-300">
          加载失败：{error}
        </p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500 dark:text-zinc-400">加载中…</p>
      </div>
    );
  }
  return null;
}
